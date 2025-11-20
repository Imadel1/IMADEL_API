// Utils/logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Get current date for log filename
const getLogFilename = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
};

// Format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}\n`;
};

// Write log to file
const writeLog = (level, message, meta = {}) => {
  const logFile = path.join(logsDir, getLogFilename());
  const logMessage = formatLogMessage(level, message, meta);
  
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(logMessage.trim());
  }
};

// Logger object
const logger = {
  info: (message, meta = {}) => {
    writeLog('info', message, meta);
  },
  
  warn: (message, meta = {}) => {
    writeLog('warn', message, meta);
  },
  
  error: (message, meta = {}) => {
    writeLog('error', message, meta);
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      writeLog('debug', message, meta);
    }
  },
  
  // Log API requests
  request: (req) => {
    const message = `${req.method} ${req.originalUrl}`;
    const meta = {
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    writeLog('request', message, meta);
  }
};

export default logger;