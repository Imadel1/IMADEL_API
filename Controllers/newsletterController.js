// Controllers/newsletterController.js
import Newsletter from '../Models/Newsletter.js';
import sendEmail from '../Utils/sendEmail.js';

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletters
// @access  Private (Admin only)
export const getSubscribers = async (req, res) => {
  try {
    const { subscribed } = req.query;
    
    let query = {};
    
    if (subscribed !== undefined) query.subscribed = subscribed === 'true';

    const subscribers = await Newsletter.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletters/subscribe
// @access  Public
export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.subscribed) {
        return res.status(400).json({
          success: false,
          message: 'Email already subscribed'
        });
      } else {
        // Resubscribe
        subscriber.subscribed = true;
        subscriber.subscribedAt = Date.now();
        subscriber.unsubscribedAt = null;
        if (name) subscriber.name = name;
        await subscriber.save();

        // Send welcome email
        try {
          await sendEmail({
            email: subscriber.email,
            subject: 'Bienvenue à la Newsletter IMADEL',
            message: 'Merci de vous être réinscrit à notre newsletter!',
            html: `
              <h1>Bienvenue ${name || ''}!</h1>
              <p>Merci de vous être réinscrit à la newsletter IMADEL.</p>
              <p>Vous recevrez désormais nos dernières actualités et mises à jour.</p>
            `
          });
          console.log('✅ Welcome email sent to:', subscriber.email);
        } catch (emailError) {
          console.error('❌ Email error:', emailError.message);
          // Continue even if email fails
        }

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          subscriber
        });
      }
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
      email,
      name,
      subscribed: true
    });

    // Send welcome email to new subscriber
    try {
      await sendEmail({
        email: subscriber.email,
        subject: 'Bienvenue à la Newsletter IMADEL',
        message: 'Merci de vous être inscrit à notre newsletter!',
        html: `
          <h1>Bienvenue ${name || ''}!</h1>
          <p>Merci de vous être inscrit à la newsletter IMADEL.</p>
          <p>Vous recevrez désormais nos dernières actualités sur nos projets de développement au Mali.</p>
          <br>
          <p>Cordialement,</p>
          <p><strong>L'équipe IMADEL</strong></p>
        `
      });
      console.log('✅ Welcome email sent to:', subscriber.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails - subscription is still created
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletters/unsubscribe
// @access  Public
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in newsletter list'
      });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete subscriber
// @route   DELETE /api/newsletters/:id
// @access  Private (Admin only)
export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};