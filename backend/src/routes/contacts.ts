import { Router } from 'express';
import { Op } from 'sequelize';
import { likeOp, tagsAny } from '../database/dialect.js';
import { body, validationResult } from 'express-validator';
import { Contact, User, Activity } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Validation rules for contacts
const validateContact = [
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

// GET / - List all contacts with filtering and pagination
router.get(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      isClient,
      company,
      tags,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = {};

    // Apply filters
    if (isClient !== undefined) {
      where.isClient = isClient === 'true';
    }
    if (company) {
      where.company = { [likeOp]: `%${company}%` };
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      Object.assign(where, tagsAny(tagArray as string[]));
    }

    // Search across email, firstName, lastName, company, jobTitle
    if (search) {
      where[Op.or] = [
        { email: { [likeOp]: `%${search}%` } },
        { firstName: { [likeOp]: `%${search}%` } },
        { lastName: { [likeOp]: `%${search}%` } },
        { company: { [likeOp]: `%${search}%` } },
        { jobTitle: { [likeOp]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Build order
    const order: any[] = [[sortBy as string, sortOrder === 'asc' ? 'ASC' : 'DESC']];

    // Execute query
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ],
      order,
      limit: limitNum,
      offset
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);

    res.json({
      contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  })
);

// POST / - Create new contact
router.post(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  validateContact,
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      phone,
      linkedinUrl,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      tags,
      notes,
      isClient,
      clientSince,
      lifetimeValue
    } = req.body;

    // Check if contact with email already exists
    const existingContact = await Contact.findOne({ where: { email } });
    if (existingContact) {
      throw new AppError('Contact with this email already exists', 409);
    }

    // Create contact
    const contact = await Contact.create({
      userId: req.user?.id,
      email,
      firstName,
      lastName,
      company,
      jobTitle,
      phone,
      linkedinUrl,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      tags: tags || [],
      notes,
      isClient: isClient || false,
      clientSince: clientSince ? new Date(clientSince) : undefined,
      lifetimeValue,
      lastInteractionAt: new Date()
    });

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'contact_created',
        description: `Contact created: ${firstName || ''} ${lastName || ''} (${email})`,
        entityType: 'contact',
        entityId: contact.id,
        metadata: { company, isClient: isClient || false },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return contact with user info
    const contactWithUser = await Contact.findByPk(contact.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Contact created successfully',
      contact: contactWithUser
    });
  })
);

// GET /:id - Get contact by ID
router.get(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const contact = await Contact.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    res.json({ contact });
  })
);

// PATCH /:id - Update contact
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    // Check email uniqueness if being updated
    if (updates.email && updates.email !== contact.email) {
      const existingContact = await Contact.findOne({ where: { email: updates.email } });
      if (existingContact) {
        throw new AppError('Contact with this email already exists', 409);
      }
    }

    // Update lastInteractionAt if relevant fields changed
    const interactionFields = ['notes', 'phone', 'jobTitle', 'company'];
    const hasInteractionUpdate = interactionFields.some(field => updates[field] !== undefined);
    if (hasInteractionUpdate) {
      updates.lastInteractionAt = new Date();
    }

    await contact.update(updates);

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'contact_created',
        description: `Contact updated: ${contact.firstName || ''} ${contact.lastName || ''}`,
        entityType: 'contact',
        entityId: contact.id,
        metadata: { updatedFields: Object.keys(updates) },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return updated contact
    const updatedContact = await Contact.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  })
);

// DELETE /:id - Delete contact
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    const contactInfo = `${contact.firstName || ''} ${contact.lastName || ''} (${contact.email})`;

    await contact.destroy();

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'contact_created',
        description: `Contact deleted: ${contactInfo}`,
        entityType: 'contact',
        entityId: id,
        metadata: { deletedContact: contactInfo },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({ message: 'Contact deleted successfully' });
  })
);

export default router;
