import { Router } from 'express';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { Booking, Lead, Contact, Activity } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validateBooking } from '../middleware/validators.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET / - List all bookings with filtering and pagination
router.get(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      status,
      eventType,
      leadId,
      contactId,
      from,
      to,
      page = '1',
      limit = '20'
    } = req.query;

    const where: any = {};

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (eventType) {
      where.eventType = eventType;
    }
    if (leadId) {
      where.leadId = leadId;
    }
    if (contactId) {
      where.contactId = contactId;
    }
    if (from || to) {
      where.scheduledAt = {};
      if (from) {
        where.scheduledAt[Op.gte] = new Date(from as string);
      }
      if (to) {
        where.scheduledAt[Op.lte] = new Date(to as string);
      }
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Execute query
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ],
      order: [['scheduledAt', 'ASC']],
      limit: limitNum,
      offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      bookings,
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

// POST / - Create new booking
router.post(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  validateBooking,
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      leadId,
      contactId,
      eventType,
      scheduledAt,
      timezone,
      duration,
      meetingUrl,
      notes
    } = req.body;

    // Validate that either leadId or contactId is provided
    if (!leadId && !contactId) {
      throw new AppError('Either leadId or contactId must be provided', 400);
    }

    // Verify lead or contact exists
    if (leadId) {
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        throw new AppError('Lead not found', 404);
      }
    }
    if (contactId) {
      const contact = await Contact.findByPk(contactId);
      if (!contact) {
        throw new AppError('Contact not found', 404);
      }
    }

    // Create booking
    const booking = await Booking.create({
      leadId,
      contactId,
      eventType,
      scheduledAt: new Date(scheduledAt),
      timezone: timezone || 'America/New_York',
      duration: duration || 30,
      status: 'scheduled',
      meetingUrl,
      notes,
      followUpRequired: false
    });

    // Log activity
    if (req.user) {
      await Activity.create({
        userId: req.user.id,
        type: 'booking_scheduled',
        description: `Booking scheduled: ${eventType} meeting`,
        entityType: 'booking',
        entityId: booking.id,
        metadata: { eventType, scheduledAt, leadId, contactId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Return booking with relations
    const bookingWithRelations = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        },
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'email', 'firstName', 'lastName', 'company']
        }
      ]
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingWithRelations
    });
  })
);

// GET /availability - Get booking availability for a date range
router.get(
  '/availability',
  authenticate,
  requireRole('admin', 'operator', 'client'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError('from and to dates are required', 400);
    }

    const startDate = new Date(from as string);
    const endDate = new Date(to as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // Get all bookings in the date range
    const bookings = await Booking.findAll({
      where: {
        scheduledAt: {
          [Op.between]: [startDate, endDate]
        },
        status: {
          [Op.in]: ['scheduled', 'completed']
        }
      },
      attributes: ['scheduledAt', 'duration', 'eventType', 'status'],
      order: [['scheduledAt', 'ASC']]
    });

    // Generate available time slots (simplified - assumes 9 AM to 5 PM business hours)
    const slots = generateAvailableSlots(startDate, endDate, bookings);

    res.json({
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      bookedSlots: bookings.map(b => ({
        time: b.scheduledAt,
        duration: b.duration,
        type: b.eventType,
        status: b.status
      })),
      availableSlots: slots
    });
  })
);

// PATCH /:id/status - Update booking status
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status, outcome, followUpRequired, followUpNotes } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const oldStatus = booking.status;
    const updates: any = { status };

    if (outcome) {
      updates.outcome = outcome;
    }
    if (followUpRequired !== undefined) {
      updates.followUpRequired = followUpRequired;
    }
    if (followUpNotes) {
      updates.followUpNotes = followUpNotes;
    }

    await booking.update(updates);

    // Log activity
    if (req.user) {
      const activityType = status === 'completed' ? 'booking_completed' : 'status_changed';
      await Activity.create({
        userId: req.user.id,
        type: activityType,
        description: `Booking status changed from ${oldStatus} to ${status}`,
        entityType: 'booking',
        entityId: booking.id,
        metadata: { oldStatus, newStatus: status, outcome },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: await Booking.findByPk(id, {
        include: [
          {
            model: Lead,
            as: 'lead',
            attributes: ['id', 'email', 'firstName', 'lastName', 'company']
          },
          {
            model: Contact,
            as: 'contact',
            attributes: ['id', 'email', 'firstName', 'lastName', 'company']
          }
        ]
      })
    });
  })
);

// Helper function to generate available time slots
function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  bookings: Booking[]
): Array<{ time: string; available: boolean }> {
  const slots: Array<{ time: string; available: boolean }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Generate slots for business hours (9 AM - 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      const slotTime = new Date(currentDate);
      slotTime.setHours(hour, 0, 0, 0);

      // Check if this slot overlaps with any booking
      const isBooked = bookings.some(booking => {
        const bookingStart = new Date(booking.scheduledAt);
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
        return slotTime >= bookingStart && slotTime < bookingEnd;
      });

      slots.push({
        time: slotTime.toISOString(),
        available: !isBooked
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

export default router;
