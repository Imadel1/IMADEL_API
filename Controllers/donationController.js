// Controllers/donationController.js
import Donation from '../Models/Donation.js';
import paystackAPI from '../config/paystack.js';
import sendEmail from '../Utils/sendEmail.js';

// @desc    Initialize donation payment
// @route   POST /api/donations/initialize
// @access  Public
export const initializeDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency,
      message,
      isAnonymous,
      purpose
    } = req.body;

    // Validate required fields
    if (!donorName || !donorEmail || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir le nom, l\'email et le montant'
      });
    }

    // Validate amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Le montant minimum est de 100 XOF'
      });
    }

    // Generate unique reference
    const reference = `IMADEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create donation record (pending)
    const donation = await Donation.create({
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency: currency || 'XOF',
      paymentReference: reference,
      paymentStatus: 'pending',
      message,
      isAnonymous: isAnonymous || false,
      purpose: purpose || 'general'
    });

    // Initialize Paystack transaction
    const paystackResponse = await paystackAPI.post('/transaction/initialize', {
      email: donorEmail,
      amount: amount * 100, // Paystack uses kobo/pesewas (amount in smallest unit)
      currency: currency || 'XOF',
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL || 'https://imadel.org'}/donation/callback`,
      metadata: {
        donorName,
        donorPhone,
        message,
        purpose,
        isAnonymous,
        donationId: donation._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Paiement initialisé',
      data: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code,
        reference: reference
      }
    });
  } catch (error) {
    console.error('❌ Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Verify donation payment
// @route   GET /api/donations/verify/:reference
// @access  Public
export const verifyDonation = async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const paystackResponse = await paystackAPI.get(`/transaction/verify/${reference}`);

    const paymentData = paystackResponse.data.data;

    // Find donation
    const donation = await Donation.findOne({ paymentReference: reference });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don non trouvé'
      });
    }

    // Update donation status
    if (paymentData.status === 'success') {
      donation.paymentStatus = 'success';
      donation.paymentMethod = paymentData.channel;
      donation.paystackReference = paymentData.reference;
      donation.authorizationCode = paymentData.authorization?.authorization_code;
      donation.paidAt = new Date(paymentData.paid_at);
      await donation.save();

      // Send thank you email to donor
      try {
        await sendEmail({
          email: donation.donorEmail,
          subject: 'Merci pour votre don - IMADEL',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Merci pour votre générosité! 🙏</h1>
              
              <p>Cher(e) ${donation.donorName},</p>
              
              <p>Nous vous remercions sincèrement pour votre don de <strong>${donation.amount} ${donation.currency}</strong> à IMADEL.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails de votre don</h3>
                <p><strong>Montant:</strong> ${donation.amount} ${donation.currency}</p>
                <p><strong>Référence:</strong> ${donation.paymentReference}</p>
                <p><strong>Date:</strong> ${new Date(donation.paidAt).toLocaleDateString('fr-FR')}</p>
                <p><strong>Objectif:</strong> ${getPurposeLabel(donation.purpose)}</p>
              </div>
              
              <p>Votre soutien nous permet de continuer notre mission de développement communautaire au Mali.</p>
              
              ${donation.message ? `<p><em>"${donation.message}"</em></p>` : ''}
              
              <p>Cordialement,<br><strong>L'équipe IMADEL</strong></p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                Ce reçu confirme votre don. Pour toute question, contactez-nous à info@imadel.org
              </p>
            </div>
          `
        });
        console.log('✅ Thank you email sent to donor:', donation.donorEmail);
      } catch (emailError) {
        console.error('❌ Failed to send thank you email:', emailError.message);
      }

      // Send notification to admin
      try {
        await sendEmail({
          email: process.env.COMPANY_EMAIL || process.env.ADMIN_EMAIL,
          subject: `Nouveau Don Reçu - ${donation.amount} ${donation.currency}`,
          html: `
            <h2>Nouveau Don Reçu! 🎉</h2>
            <p><strong>Donateur:</strong> ${donation.isAnonymous ? 'Anonyme' : donation.donorName}</p>
            <p><strong>Email:</strong> ${donation.donorEmail}</p>
            <p><strong>Montant:</strong> ${donation.amount} ${donation.currency}</p>
            <p><strong>Objectif:</strong> ${getPurposeLabel(donation.purpose)}</p>
            <p><strong>Date:</strong> ${new Date(donation.paidAt).toLocaleDateString('fr-FR')}</p>
            ${donation.message ? `<p><strong>Message:</strong> ${donation.message}</p>` : ''}
            <p><strong>Référence:</strong> ${donation.paymentReference}</p>
          `
        });
        console.log('✅ Admin notification sent');
      } catch (emailError) {
        console.error('❌ Failed to send admin notification:', emailError.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Paiement vérifié avec succès',
        donation: {
          id: donation._id,
          amount: donation.amount,
          currency: donation.currency,
          status: donation.paymentStatus,
          paidAt: donation.paidAt
        }
      });
    } else {
      donation.paymentStatus = 'failed';
      await donation.save();

      return res.status(400).json({
        success: false,
        message: 'Le paiement a échoué',
        status: paymentData.status
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du paiement',
      error: error.response?.data?.message || error.message
    });
  }
};

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Private
export const getDonations = async (req, res) => {
  try {
    const { status, purpose } = req.query;
    
    let query = {};
    
    if (status) query.paymentStatus = status;
    if (purpose) query.purpose = purpose;

    const donations = await Donation.find(query).sort({ createdAt: -1 });

    // Calculate total
    const total = donations
      .filter(d => d.paymentStatus === 'success')
      .reduce((sum, d) => sum + d.amount, 0);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      donations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Don non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function
function getPurposeLabel(purpose) {
  const labels = {
    general: 'Don général',
    education: 'Éducation',
    healthcare: 'Santé',
    water: 'Eau potable',
    emergency: 'Urgence',
    other: 'Autre'
  };
  return labels[purpose] || 'Don général';
}