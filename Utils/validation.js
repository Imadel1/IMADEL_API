// Utils/validation.js

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Mali format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+223|0)[2-9]\d{8}$/;
  return phoneRegex.test(phone);
};

// Validate URL
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Validate password strength
export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Sanitize string input
export const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

// Validate ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Validate date
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Check if date is in the future
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Check if date is in the past
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};