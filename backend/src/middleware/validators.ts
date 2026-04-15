import { body } from 'express-validator';

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name is required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateLead = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }),
  body('source')
    .optional()
    .trim()
    .isIn(['website', 'referral', 'linkedin', 'cold_email', 'event', 'other']),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('estimatedValue')
    .optional()
    .isFloat({ min: 0 }),
  body('notes')
    .optional()
    .trim()
];

export const validateBooking = [
  body('eventType')
    .isIn(['discovery', 'strategy', 'demo', 'consultation', 'check_in'])
    .withMessage('Valid event type is required'),
  body('scheduledAt')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 }),
  body('timezone')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
];

export const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title is required'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done', 'blocked']),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']),
  body('category')
    .optional()
    .isIn(['client_work', 'internal', 'business_dev', 'admin']),
  body('dueDate')
    .optional()
    .isISO8601(),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 999 })
];

// Contact validators
export const validateContact = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }),
  body('linkedinUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be valid'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('notes')
    .optional()
    .trim()
];

// Password reset validators
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number')
];
