// src/utils/errorHandler.js

export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true; // For distinguishing known errors
    }
  }
  
  const mapDatabaseError = (error) => {
    const code = error?.parent?.code || error?.original?.code || error?.code;
    const sqlMessage = error?.parent?.sqlMessage || error?.original?.sqlMessage || error?.message || '';

    if (code === 'ER_DUP_ENTRY') {
      return { statusCode: 400, message: 'A user with this email already exists' };
    }

    if (code === 'ER_DATA_TOO_LONG') {
      if (sqlMessage.includes('U_Profile')) {
        return {
          statusCode: 400,
          message: 'Profile photo is too large. Please upload a smaller image.',
        };
      }
      return {
        statusCode: 400,
        message: 'One of the fields is too long. Please shorten the input and try again.',
      };
    }

    if (code === 'ER_BAD_FIELD_ERROR' || code === 'ER_NO_SUCH_TABLE') {
      return {
        statusCode: 500,
        message: 'Database schema is out of sync. Please restart backend to apply model changes.',
      };
    }

    if (error?.name === 'SequelizeValidationError' || error?.name === 'SequelizeUniqueConstraintError') {
      const first = error?.errors?.[0]?.message;
      return { statusCode: 400, message: first || 'Validation failed for submitted data' };
    }

    return null;
  };

  // Express-friendly error handler
  export const handleError = (res, error) => {
    console.error(error); // Log the actual error for debugging

    const mapped = mapDatabaseError(error);
    if (mapped) {
      return res.status(mapped.statusCode).json({ success: false, message: mapped.message });
    }
  
    // If it’s an AppError, send its status code; otherwise 500
    const statusCode = error.isOperational ? error.statusCode : 500;
    const isDev = process.env.NODE_ENV !== 'production';
    const message = error.isOperational
      ? error.message
      : (isDev && error?.message ? error.message : 'Internal server error');
  
    res.status(statusCode).json({ success: false, message });
  };
  