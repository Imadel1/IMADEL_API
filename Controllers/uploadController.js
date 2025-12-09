// controllers/uploadController.js
import cloudinary from "../config/cloudinary.js";

// Upload Single Image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      file: {
        url: req.file.path,       // Cloudinary URL
        public_id: req.file.filename, // Cloudinary public ID
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

// Upload Multiple Images
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const files = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

// Delete Image From Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "public_id is required",
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return res.status(404).json({
        success: false,
        message: "Image not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};
