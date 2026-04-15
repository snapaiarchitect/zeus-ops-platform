import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import { User, Activity } from '../models/index.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /register - Register new user
router.post(
  '/register',
  validateRegister,
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password, firstName, lastName, company, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      company,
      phone,
      role: 'client',
      isActive: true
    });

    // Log activity
    await Activity.create({
      userId: user.id,
      type: 'login',
      description: 'User registered and logged in',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON()
    });
  })
);

// POST /login - Login user
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Log activity
    await Activity.create({
      userId: user.id,
      type: 'login',
      description: 'User logged in',
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  })
);

// POST /logout - Logout user
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'logout',
        description: 'User logged out',
        entityType: 'user',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({ message: 'Logout successful' });
  })
);

// GET /me - Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    res.json({ user: req.user.toJSON() });
  })
);

// POST /forgot-password - Request password reset
router.post(
  '/forgot-password',
  asyncHandler(async (req: AuthRequest, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account exists with this email, password reset instructions will be sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (would need to add these fields to User model)
    // For now, we'll just log the intent
    await Activity.create({
      userId: user.id,
      type: 'email_sent',
      description: 'Password reset requested',
      entityType: 'user',
      entityId: user.id,
      metadata: { resetToken, resetTokenExpiry },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // TODO: Send actual email via email service
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ 
      message: 'If an account exists with this email, password reset instructions will be sent.' 
    });
  })
);

// POST /reset-password - Reset password
router.post(
  '/reset-password',
  asyncHandler(async (req: AuthRequest, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Token and password are required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // TODO: Validate token and update password
    // For now, return a placeholder response
    throw new AppError('Password reset functionality requires email service integration', 501);
  })
);

export default router;
