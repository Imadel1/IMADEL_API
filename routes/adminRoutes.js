// routes/adminRoutes.js
import express from 'express';
import { protect } from '../Middlewares/authMiddleware.js';
import Project from '../Models/Project.js';
import Job from '../Models/Job.js';
import Partner from '../Models/Partner.js';
import Newsletter from '../Models/Newsletter.js';
import Office from '../Models/Office.js';
import Application from '../Models/Application.js'

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalProjects,
      activeProjects,
      totalJobs,
      openJobs,
      totalPartners,
      totalSubscribers,
      totalOffices,
      totalApplications,          
      pendingApplications 
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'active', published: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open', published: true }),
      Partner.countDocuments({ active: true }),
      Newsletter.countDocuments({ subscribed: true }),
      Office.countDocuments({ active: true }),
      Application.countDocuments(),                           
      Application.countDocuments({ status: 'pending' }) 
    ]);

    res.status(200).json({
      success: true,
      stats: {
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        jobs: {
          total: totalJobs,
          open: openJobs
        },
        partners: totalPartners,
        subscribers: totalSubscribers,
        offices: totalOffices
      },
       applications: {                   
          total: totalApplications,
          pending: pendingApplications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;