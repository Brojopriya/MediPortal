// src/utils/errorHandler.js

export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true; // For distinguishing known errors
    }
  }
  
  // Express-friendly error handler
  export const handleError = (res, error) => {
    console.error(error); // Log the actual error for debugging
  
    // If it’s an AppError, send its status code; otherwise 500
    const statusCode = error.isOperational ? error.statusCode : 500;
    const message = error.isOperational ? error.message : 'Internal server error';
  
    res.status(statusCode).json({ success: false, message });
  };
  