// Controllers/applicationController.js
import Application from '../Models/Application.js';
import Job from '../Models/Job.js';
import sendEmail from '../Utils/sendEmail.js';

// @desc    Submit job application
// @route   POST /api/applications
// @access  Public
export const submitApplication = async (req, res) => {
  try {
    const {
      jobId,
      fullName,
      email,
      phone,
      address,
      resume,
      coverLetter,
    } = req.body;

    // Validate required fields
    if (!jobId || !fullName || !email || !address || !phone || !coverLetter || !resume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check job status and deadline
    if (job.status !== 'open' || new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ job: jobId, email });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }

    // Save application
    const application = await Application.create({
      job: jobId,
      jobTitle: job.title,
      fullName,
      email,
      phone,
      address,
      resume,
      coverLetter,
    });

    // Send emails asynchronously without blocking response
    try {
     await sendEmail({
  email: application.email,
  subject: `Confirmation de candidature - ${job.title}`,
  html: `
    <h1>Confirmation de réception de votre candidature</h1>
    <p>Bonjour ${fullName},</p>
    <p>Nous vous remercions d’avoir postulé pour le poste de <strong>${job.title}</strong> au sein de notre organisation.</p>
    <p>Votre candidature a bien été enregistrée et sera examinée par notre équipe de recrutement.</p>
    <p>Nous vous contacterons si votre profil correspond à nos besoins.</p>
    <br>
    <p><strong>Détails de votre candidature :</strong></p>
    <ul>
      <li>Poste : ${job.title}</li>
      <li>Lieu : ${job.location}</li>
      <li>Date de candidature : ${new Date().toLocaleDateString('fr-FR')}</li>
    </ul>
    <br>
    <p>Nous vous remercions pour l’intérêt porté à notre organisation et vous souhaitons bonne chance.</p>
    <p>Cordialement,</p>
    <p><strong>L'équipe IMADEL</strong></p>
  `
});

      console.log('Email de confirmation envoyé au candidat :', application.email);
    } catch (emailError) {
      console.error('Échec de l’envoi de l’email de confirmation :', emailError.message);
    }

    try {
     await sendEmail({
  email: process.env.ADMIN_EMAIL || 'admin@imadel.org',
  subject: `Nouvelle candidature reçue - ${job.title}`,
  html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Nouvelle Candidature Reçue</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Informations du Poste</h3>
              <p><strong>Poste:</strong> ${job.title}</p>
              <p><strong>Lieu:</strong> ${job.location}</p>
              <p><strong>Date de candidature:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Informations du Candidat</h3>
              <p><strong>Nom complet:</strong> ${fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Téléphone:</strong> ${phone}</p>
              <p><strong>Adresse:</strong> ${address}</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Lettre de Motivation</h3>
              <p style="white-space: pre-wrap;">${coverLetter || 'Non fournie'}</p>
            </div>

            <div style="margin: 30px 0;">
              <a href="${resume}" 
                 style="display: inline-block; background-color: #2563eb; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                📄 Télécharger le CV
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              Pour gérer cette candidature, connectez-vous au <a href="https://imadelapi-production.up.railway.app/admin">panneau d'administration</a>.
            </p>
          </div>
        `
      });
       console.log('Email de notification admin envoyé');
    } catch (emailError) {
      console.error(' Échec de l’envoi de l’email de notification admin :', emailError.message);
    }
      res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        jobTitle: application.jobTitle,
        applicantName: application.fullName,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all applications (Admin only)
// GET /api/applications
// access  Private
export const getApplications = async (req, res) => {
  try {
    const { status, jobId } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (jobId) query.job = jobId;

    const applications = await Application.find(query)
      .populate('job', 'title location type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single application
// GET /api/applications/:id
// access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//  Update application status
// PUT /api/applications/:id
// access  Private (Admin only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable.'
      });
    }

    // Send status update email to applicant
    try {
      let emailSubject = '';
      let emailMessage = '';

      switch (status) {
        case 'reviewing':
          emailSubject =  'Mise à jour de votre candidature';
          emailMessage = `
            <h1>Mise à jour de votre candidature</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Votre candidature pour le poste de <strong>${application.jobTitle}</strong> est actuellement en cours d'examen.</p>
            <p>Nous vous tiendrons informé de la suite du processus.</p>
          `;
          break;
        case 'shortlisted':
          emailSubject = 'Félicitations - Vous êtes présélectionné(e)';
          emailMessage = `
            <h1>Félicitations!</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous sommes heureux de vous informer que vous avez été présélectionné pour le poste de <strong>${application.jobTitle}</strong>.</p>
            <p>Nous vous contacterons bientôt pour la prochaine étape du processus de recrutement.</p>
          `;
          break;
        case 'interviewed':
          emailSubject = 'Entretien planifié';
          emailMessage = `
            <h1>Entretien planifié</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous souhaitons vous rencontrer pour un entretien concernant le poste de <strong>${application.jobTitle}</strong>.</p>
            <p>Nous vous contacterons prochainement avec les détails.</p>
          `;
          break;
        case 'accepted':
          emailSubject = 'Offre d’emploi - Félicitations';
          emailMessage = `
            <h1>Félicitations!</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous sommes ravis de vous offrir le poste de <strong>${application.jobTitle}</strong> chez IMADEL.</p>
            <p>Nous vous contacterons avec les détails de l'offre.</p>
          `;
          break;
        case 'rejected':
          emailSubject = 'Mise à jour de votre candidature';
          emailMessage = `
            <h1>Mise à jour de votre candidature</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Merci pour votre intérêt pour le poste de <strong>${application.jobTitle}</strong>.</p>
            <p>Après examen, nous avons décidé de poursuivre avec d'autres candidats pour ce poste.</p>
            <p>Nous vous encourageons à postuler pour d'autres opportunités chez IMADEL à l'avenir.</p>
          `;
          break;
      }

      if (emailSubject && emailMessage) {
        await sendEmail({
          email: application.email,
          subject: emailSubject,
          html: `
            ${emailMessage}
            <br>
            <p>Cordialement,</p>
            <p><strong>L'équipe IMADEL</strong></p>
          `
        });
         console.log('Email de mise à jour du statut envoyé au candidat');
      }
    } catch (emailError) {
      console.error('Échec de l’envoi de l’email de mise à jour du statut :', emailError.message);
    }


    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin only)
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature introuvable.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidature supprimée avec succès.'
    });
  } catch (error) {
    res.status(500).json({
      success: 'Erreur serveur',
      error: error.message
    });
  }
};