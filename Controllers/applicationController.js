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

    // Check if job is still open
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This job position is no longer accepting applications'
      });
    }

    // Check if deadline has passed
    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline has passed'
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

    // Create application
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

    // Send confirmation email to applicant
    try {
      await sendEmail({
        email: application.email,
        subject: `Application Received - ${job.title}`,
        html: `
          <h1>Merci pour votre candidature!</h1>
          <p>Bonjour ${fullName} ,</p>
          <p>Nous avons bien reçu votre candidature pour le poste de <strong>${job.title}</strong>.</p>
          <p>Notre équipe examinera votre candidature et vous contactera si votre profil correspond à nos besoins.</p>
          <br>
          <p><strong>Détails de votre candidature:</strong></p>
          <ul>
            <li>Poste: ${job.title}</li>
            <li>Lieu: ${job.location}</li>
            <li>Date de candidature: ${new Date().toLocaleDateString('fr-FR')}</li>
          </ul>
          <br>
          <p>Cordialement,</p>
          <p><strong>L'équipe IMADEL</strong></p>
        `
      });
      console.log('✅ Confirmation email sent to applicant:', application.email);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
    }

    // Send notification email to admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@imadel.org',
        subject: `New Job Application - ${job.title}`,
        html: `
          <h2>Nouvelle candidature reçue</h2>
          <p><strong>Poste:</strong> ${job.title}</p>
          <p><strong>Candidat:</strong> ${fullName} </p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <br>
          <p><strong>CV:</strong> <a href="${resume}">Télécharger le CV</a></p>
          <br>
          <p><strong>Lettre de motivation:</strong></p>
          <p>${coverLetter}</p>
        //${linkedIn ? `<p><strong>LinkedIn:</strong> <a href="${linkedIn}">${linkedIn}</a></p>` : ''}
        //${portfolio ? `<p><strong>Portfolio:</strong> <a href="${portfolio}">${portfolio}</a></p>` : ''}
        // `
      });
      console.log('✅ Admin notification email sent');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        jobTitle: application.jobTitle,
        applicantName: `${application.fullName}`,
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

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private
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

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
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

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Admin only)
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
        message: 'Application not found'
      });
    }

    // Send status update email to applicant
    try {
      let emailSubject = '';
      let emailMessage = '';

      switch (status) {
        case 'reviewing':
          emailSubject = 'Your Application is Under Review';
          emailMessage = `
            <h1>Mise à jour de votre candidature</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Votre candidature pour le poste de <strong>${application.jobTitle}</strong> est actuellement en cours d'examen.</p>
            <p>Nous vous tiendrons informé de la suite du processus.</p>
          `;
          break;
        case 'shortlisted':
          emailSubject = 'You Have Been Shortlisted!';
          emailMessage = `
            <h1>Félicitations!</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous sommes heureux de vous informer que vous avez été présélectionné pour le poste de <strong>${application.jobTitle}</strong>.</p>
            <p>Nous vous contacterons bientôt pour la prochaine étape du processus de recrutement.</p>
          `;
          break;
        case 'interviewed':
          emailSubject = 'Interview Scheduled';
          emailMessage = `
            <h1>Entretien planifié</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous souhaitons vous rencontrer pour un entretien concernant le poste de <strong>${application.jobTitle}</strong>.</p>
            <p>Nous vous contacterons prochainement avec les détails.</p>
          `;
          break;
        case 'accepted':
          emailSubject = 'Congratulations - Job Offer';
          emailMessage = `
            <h1>Félicitations!</h1>
            <p>Bonjour ${application.fullName},</p>
            <p>Nous sommes ravis de vous offrir le poste de <strong>${application.jobTitle}</strong> chez IMADEL.</p>
            <p>Nous vous contacterons avec les détails de l'offre.</p>
          `;
          break;
        case 'rejected':
          emailSubject = 'Application Status Update';
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
        console.log('✅ Status update email sent to applicant');
      }
    } catch (emailError) {
      console.error('❌ Failed to send status update email:', emailError.message);
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
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};