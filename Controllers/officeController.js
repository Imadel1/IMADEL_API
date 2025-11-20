// Controllers/officeController.js
import Office from '../Models/Office.js';

// @desc    Get all offices
// @route   GET /api/offices
// @access  Public
export const getOffices = async (req, res) => {
  try {
    const { type, active } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';

    const offices = await Office.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offices.length,
      offices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single office
// @route   GET /api/offices/:id
// @access  Public
export const getOffice = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }

    res.status(200).json({
      success: true,
      office
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create office
// @route   POST /api/offices
// @access  Private (Admin only)
export const createOffice = async (req, res) => {
  try {
    const office = await Office.create(req.body);

    res.status(201).json({
      success: true,
      office
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update office
// @route   PUT /api/offices/:id
// @access  Private (Admin only)
export const updateOffice = async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }

    res.status(200).json({
      success: true,
      office
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete office
// @route   DELETE /api/offices/:id
// @access  Private (Admin only)
export const deleteOffice = async (req, res) => {
  try {
    const office = await Office.findByIdAndDelete(req.params.id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Office deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};