import { Router } from 'express';
import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { Task, User, Lead, Activity } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Validation rules for tasks
const validateTask = [
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
    .isFloat({ min: 0, max: 999 }),
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid user ID')
];

// GET / - List all tasks with filtering and pagination
router.get(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      status,
      priority,
      category,
      assignedTo,
      leadId,
      dueBefore,
      dueAfter,
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
    if (category) {
      where.category = category;
    }
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }
    if (leadId) {
      where.leadId = leadId;
    }
    if (dueBefore) {
      where.dueDate = { ...where.dueDate, [Op.lte]: new Date(dueBefore as string) };
    }
    if (dueAfter) {
      where.dueDate = { ...where.dueDate, [Op.gte]: new Date(dueAfter as string) };
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { [Op.overlap]: tagArray };
    }

    // Search in title and description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Build order - prioritize urgent priority and due dates
    const order: any[] = [];
    if (sortBy === 'priority') {
      order.push([
        Task.sequelize!.literal(
          `CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`
        ),
        sortOrder === 'asc' ? 'ASC' : 'DESC'
      ]);
    } else {
      order.push([sortBy as string, sortOrder === 'asc' ? 'ASC' : 'DESC']);
    }

    // Execute query
    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ],
      order,
      limit: limitNum,
      offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      tasks,
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

// POST / - Create new task
router.post(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  validateTask,
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      estimatedHours,
      actualHours,
      assignedTo,
      leadId,
      clientId,
      tags,
      attachments
    } = req.body;

    // Validate assigned user exists
    if (assignedTo) {
      const user = await User.findByPk(assignedTo);
      if (!user) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    // Validate lead exists if provided
    if (leadId) {
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        throw new AppError('Lead not found', 404);
      }
    }

    // Create task
    const task = await Task.create({
      userId: req.user!.id,
      assignedTo,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      category: category || 'internal',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      actualHours,
      clientId,
      leadId,
      tags: tags || [],
      attachments: attachments || [],
      completedAt: status === 'done' ? new Date() : undefined
    });

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'task_created',
        description: `Task created: ${title}`,
        entityType: 'task',
        entityId: task.id,
        metadata: { priority, category, assignedTo },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return task with relations
    const taskWithRelations = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ]
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: taskWithRelations
    });
  })
);

// GET /:id - Get task by ID
router.get(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ]
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json({ task });
  })
);

// PATCH /:id - Update task
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Validate assigned user exists if being updated
    if (updates.assignedTo) {
      const user = await User.findByPk(updates.assignedTo);
      if (!user) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    // Handle status change to done
    const oldStatus = task.status;
    const newStatus = updates.status;

    if (newStatus === 'done' && oldStatus !== 'done') {
      updates.completedAt = new Date();
    } else if (newStatus && newStatus !== 'done') {
      updates.completedAt = null;
    }

    await task.update(updates);

    // Log activity
    if (req.user) {
      let activityType = 'task_created';
      let description = `Task updated: ${task.title}`;

      if (newStatus === 'done' && oldStatus !== 'done') {
        activityType = 'task_completed';
        description = `Task completed: ${task.title}`;
      } else if (newStatus && newStatus !== oldStatus) {
        activityType = 'status_changed';
        description = `Task status changed from ${oldStatus} to ${newStatus}: ${task.title}`;
      } else if (updates.assignedTo && updates.assignedTo !== task.assignedTo) {
        description = `Task reassigned: ${task.title}`;
      }

      await Activity.create({
        userId: req.user.id,
        type: activityType,
        description,
        entityType: 'task',
        entityId: task.id,
        metadata: {
          oldStatus,
          newStatus,
          updatedFields: Object.keys(updates)
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return updated task
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ]
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  })
);

// DELETE /:id - Delete task
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const taskInfo = task.title;

    await task.destroy();

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'task_created',
        description: `Task deleted: ${taskInfo}`,
        entityType: 'task',
        entityId: id,
        metadata: { deletedTask: taskInfo },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({ message: 'Task deleted successfully' });
  })
);

// POST /:id/assign - Assign task to user
router.post(
  '/:id/assign',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const task = await Task.findByPk(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const previousAssignee = task.assignedTo;
    await task.update({ assignedTo: userId });

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'task_created',
        description: `Task reassigned to ${user.firstName} ${user.lastName}: ${task.title}`,
        entityType: 'task',
        entityId: task.id,
        metadata: {
          previousAssignee,
          newAssignee: userId,
          assigneeName: `${user.firstName} ${user.lastName}`
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({
      message: `Task assigned to ${user.firstName} ${user.lastName}`,
      task: await Task.findByPk(id, {
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
          }
        ]
      })
    });
  })
);

// GET /my-tasks - Get current user's assigned tasks
router.get(
  '/my/tasks',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {
      assignedTo: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ],
      order: [
        [
          Task.sequelize!.literal(
            `CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`
          ),
          'ASC'
        ],
        ['dueDate', 'ASC']
      ],
      limit: limitNum,
      offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      tasks,
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

export default router;
