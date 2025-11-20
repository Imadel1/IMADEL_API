// Utils/fileHelper.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Delete file
export const deleteFile = (filename) => {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file size in readable format
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Check if file exists
export const fileExists = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  return fs.existsSync(filePath);
};

// Get file extension
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Generate unique filename
export const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalFilename);
  const name = path.basename(originalFilename, ext);
  
  return `${name}-${timestamp}-${random}${ext}`;
};

// Validate file type
export const isImageFile = (filename) => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
};

// Get all files in uploads directory
export const getAllUploadedFiles = () => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return [];
    }
    
    return fs.readdirSync(uploadsDir).map(filename => ({
      filename,
      path: `/uploads/${filename}`,
      size: getFileSize(fs.statSync(path.join(uploadsDir, filename)).size),
      uploadedAt: fs.statSync(path.join(uploadsDir, filename)).mtime
    }));
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return [];
  }
};