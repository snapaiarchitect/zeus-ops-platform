import { Router } from 'express';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { Lead, User, Activity } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validateLead } from '../middleware/validators.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET / - List all leads with filtering and pagination
router.get(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      status,
      priority,
      assignedTo,
      source,
      search,
      tags,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = {};

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }
    if (source) {
      where.source = source;
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { [Op.overlap]: tagArray };
    }

    // Search across email, firstName, lastName, company
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Build order
    const order: any[] = [[sortBy as string, sortOrder === 'asc' ? 'ASC' : 'DESC']];

    // Execute query
    const { count, rows: leads } = await Lead.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
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
      leads,
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

// POST / - Create new lead
router.post(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  validateLead,
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
      phone,
      source,
      status,
      priority,
      estimatedValue,
      notes,
      assignedTo,
      nextFollowUpAt,
      tags,
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Check if lead with email already exists
    const existingLead = await Lead.findOne({ where: { email } });
    if (existingLead) {
      throw new AppError('Lead with this email already exists', 409);
    }

    // Create lead
    const lead = await Lead.create({
      email,
      firstName,
      lastName,
      company,
      phone,
      source: source || 'website',
      status: status || 'new',
      priority: priority || 'medium',
      estimatedValue,
      notes,
      assignedTo,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : undefined,
      tags: tags || [],
      utmSource,
      utmMedium,
      utmCampaign
    });

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'lead_created',
        description: `Lead created: ${firstName || ''} ${lastName || ''} (${email})`,
        entityType: 'lead',
        entityId: lead.id,
        metadata: { source, status, priority },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return lead with assignee info
    const leadWithAssignee = await Lead.findByPk(lead.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      message: 'Lead created successfully',
      lead: leadWithAssignee
    });
  })
);

// GET /:id - Get lead by ID
router.get(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    res.json({ lead });
  })
);

// PATCH /:id - Update lead
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Track status change for activity log
    const oldStatus = lead.status;
    const newStatus = updates.status;

    // Update lead
    await lead.update(updates);

    // Log activity
    if (req.user) {
      const activityData: any = {
        userId: req.user.id,
        type: 'lead_updated',
        description: `Lead updated: ${lead.firstName || ''} ${lead.lastName || ''}`,
        entityType: 'lead',
        entityId: lead.id,
        metadata: { updatedFields: Object.keys(updates) },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };

      if (newStatus && newStatus !== oldStatus) {
        activityData.type = 'status_changed';
        activityData.description = `Lead status changed from ${oldStatus} to ${newStatus}`;
        activityData.metadata = { oldStatus, newStatus };
      }

      await Activity.create(activityData);
    }

    // Return updated lead
    const updatedLead = await Lead.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        }
      ]
    });

    res.json({
      message: 'Lead updated successfully',
      lead: updatedLead
    });
  })
);

// DELETE /:id - Delete lead
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    const leadInfo = `${lead.firstName || ''} ${lead.lastName || ''} (${lead.email})`;

    // Delete lead
    await lead.destroy();

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'lead_updated',
        description: `Lead deleted: ${leadInfo}`,
        entityType: 'lead',
        entityId: id,
        metadata: { deletedLead: leadInfo },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({ message: 'Lead deleted successfully' });
  })
);

export default router;
