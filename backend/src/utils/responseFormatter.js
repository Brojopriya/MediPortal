// src/utils/responseFormatter.js
export const formatResponse = (success, message, data = null) => ({
    success,
    message,
    data,
  });
  
  export const successResponse = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  };
  
  export const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  };
  