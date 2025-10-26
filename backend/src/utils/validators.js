// src/utils/validators.js

// ✅ Validate required fields
export const validateFields = (fields, body) => {
    const missing = [];
    fields.forEach(field => {
      if (!body[field]) missing.push(field);
    });
    return missing;
  };
  
  // ✅ Validate email format
  export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // ✅ Example usage:
  import { validateFields, isValidEmail } from '../utils/validators.js';
  
  // In controller:
  const missing = validateFields(['U_Name', 'U_Email'], req.body);
  if (missing.length > 0) return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  
  if (!isValidEmail(req.body.U_Email)) return res.status(400).json({ message: 'Invalid email format' });
  