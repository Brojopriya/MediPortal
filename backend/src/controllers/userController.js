// src/controllers/userController.js
import { User } from '../models/index.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { handleError } from '../utils/errorHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register User
export const registerUser = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    let { name, email, password, role, phone } = req.body;
    email = email?.trim().toLowerCase();

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json(
        formatResponse(false, "Name, email and password are required")
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json(
        formatResponse(false, "User already exists")
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role
    });

    res.status(201).json(
      formatResponse(true, "User registered successfully", user)
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);   // 👈 Important for debugging
    handleError(res, err);
  }
};


// Login User
export const loginUser = async (req, res) => {
  try {
    console.log("LOGIN REQ:", req.body);
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      console.warn(`LOGIN - user not found: ${normalizedEmail}`);
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`LOGIN - password mismatch for user id=${user.id} email=${user.email}`);
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json(formatResponse(true, 'Login successful', { token, user }));
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    handleError(res, err);
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json(formatResponse(false, 'User not found'));
    res.json(formatResponse(true, 'User profile fetched', user));
  } catch (err) {
    handleError(res, err);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const [updatedCount, updatedUsers] = await User.update(req.body, {
      where: { id: req.user.id },
      returning: true,
    });
    if (updatedCount === 0) return res.status(404).json(formatResponse(false, 'User not found'));
    res.json(formatResponse(true, 'User profile updated', updatedUsers[0]));
  } catch (err) {
    handleError(res, err);
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.user.id } });
    if (!deleted) return res.status(404).json(formatResponse(false, 'User not found'));
    res.json(formatResponse(true, 'User deleted successfully'));
  } catch (err) {
    handleError(res, err);
  }
};
