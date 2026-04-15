import { Router } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Lead, Contact, Booking, Task, Activity } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET /dashboard - Get dashboard summary data
router.get(
  '/dashboard',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period as string, 10);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Run all stats queries in parallel
    const [
      totalLeads,
      newLeads,
      leadsByStatus,
      totalContacts,
      newContacts,
      totalClients,
      upcomingBookings,
      completedBookings,
      pendingTasks,
      overdueTasks,
      tasksByStatus,
      recentActivities
    ] = await Promise.all([
      // Leads stats
      Lead.count(),
      Lead.count({ where: { createdAt: { [Op.gte]: startDate } } }),
      Lead.findAll({
        attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
      }),

      // Contacts stats
      Contact.count(),
      Contact.count({ where: { createdAt: { [Op.gte]: startDate } } }),
      Contact.count({ where: { isClient: true } }),

      // Bookings stats
      Booking.count({
        where: {
          scheduledAt: { [Op.gte]: new Date() },
          status: 'scheduled'
        }
      }),
      Booking.count({
        where: {
          status: 'completed',
          updatedAt: { [Op.gte]: startDate }
        }
      }),

      // Tasks stats
      Task.count({
        where: {
          status: {
            [Op.notIn]: ['done', 'blocked']
          }
        }
      }),
      Task.count({
        where: {
          dueDate: { [Op.lt]: new Date() },
          status: {
            [Op.notIn]: ['done', 'blocked']
          }
        }
      }),
      Task.findAll({
        attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
      }),

      // Recent activities
      Activity.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    // Calculate lead conversion rate
    const closedWonLeads = leadsByStatus.find((s: any) => s.status === 'closed_won');
    const closedLostLeads = leadsByStatus.find((s: any) => s.status === 'closed_lost');
    const totalClosed = (parseInt(closedWonLeads?.count || 0) + parseInt(closedLostLeads?.count || 0));
    const conversionRate = totalClosed > 0
      ? (parseInt(closedWonLeads?.count || 0) / totalClosed * 100).toFixed(1)
      : '0';

    // Format response
    res.json({
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      },
      leads: {
        total: totalLeads,
        new: newLeads,
        byStatus: leadsByStatus.reduce((acc: any, curr: any) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        }, {}),
        conversionRate: parseFloat(conversionRate)
      },
      contacts: {
        total: totalContacts,
        new: newContacts,
        clients: totalClients,
        clientRate: totalContacts > 0
          ? ((totalClients / totalContacts) * 100).toFixed(1)
          : '0'
      },
      bookings: {
        upcoming: upcomingBookings,
        completed: completedBookings
      },
      tasks: {
        pending: pendingTasks,
        overdue: overdueTasks,
        byStatus: tasksByStatus.reduce((acc: any, curr: any) => {
          acc[curr.status] = parseInt(curr.count);
          return acc;
        }, {})
      },
      recentActivity: recentActivities.map(a => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt
      }))
    });
  })
);

// GET /leads - Get lead analytics
router.get(
  '/leads',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = '30', groupBy = 'day' } = req.query;
    const daysAgo = parseInt(period as string, 10);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Leads by source
    const leadsBySource = await Lead.findAll({
      attributes: ['source', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['source'],
      raw: true
    });

    // Leads by status over time
    const leadsByStatus = await Lead.findAll({
      attributes: [
        'status',
        [Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['status', Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Leads by priority
    const leadsByPriority = await Lead.findAll({
      attributes: ['priority', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['priority'],
      raw: true
    });

    // Average lead value
    const avgLeadValue = await Lead.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('estimated_value')), 'avg']],
      where: {
        createdAt: { [Op.gte]: startDate },
        estimatedValue: { [Op.not]: null }
      },
      raw: true
    });

    // Total pipeline value
    const pipelineValue = await Lead.findOne({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('estimated_value')), 'total']],
      where: {
        status: {
          [Op.notIn]: ['closed_won', 'closed_lost']
        },
        estimatedValue: { [Op.not]: null }
      },
      raw: true
    });

    // Response time analysis (time from new to contacted)
    // This is a simplified version - real implementation would track status change timestamps
    const responseTimeData = await Lead.findAll({
      attributes: [
        'status',
        [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM ("updated_at" - "created_at")) / 3600')), 'avgHours']
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
        status: { [Op.not]: 'new' }
      },
      group: ['status'],
      raw: true
    });

    res.json({
      period: {
        days: daysAgo,
        startDate: startDate.toISOString()
      },
      bySource: leadsBySource.map((s: any) => ({
        source: s.source,
        count: parseInt(s.count)
      })),
      byStatus: leadsByStatus.map((s: any) => ({
        status: s.status,
        date: s.date,
        count: parseInt(s.count)
      })),
      byPriority: leadsByPriority.map((p: any) => ({
        priority: p.priority,
        count: parseInt(p.count)
      })),
      avgValue: avgLeadValue?.avg ? parseFloat(avgLeadValue.avg) : 0,
      pipelineValue: pipelineValue?.total ? parseFloat(pipelineValue.total) : 0,
      responseTime: responseTimeData.map((r: any) => ({
        status: r.status,
        avgHours: r.avgHours ? parseFloat(r.avgHours).toFixed(1) : 0
      }))
    });
  })
);

// GET /revenue - Get revenue analytics
router.get(
  '/revenue',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { period = '30', groupBy = 'day' } = req.query;
    const daysAgo = parseInt(period as string, 10);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Won deals over time
    const wonDeals = await Lead.findAll({
      attributes: [
        [Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('updated_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('estimated_value')), 'value']
      ],
      where: {
        status: 'closed_won',
        updatedAt: { [Op.gte]: startDate }
      },
      group: [Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('updated_at'))],
      order: [[Sequelize.fn('DATE_TRUNC', groupBy as string, Sequelize.col('updated_at')), 'ASC']],
      raw: true
    });

    // Won deals by source
    const revenueBySource = await Lead.findAll({
      attributes: [
        'source',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('estimated_value')), 'value']
      ],
      where: {
        status: 'closed_won',
        updatedAt: { [Op.gte]: startDate }
      },
      group: ['source'],
      raw: true
    });

    // Total metrics
    const [totalWon, totalRevenue, avgDealSize] = await Promise.all([
      Lead.count({
        where: {
          status: 'closed_won',
          updatedAt: { [Op.gte]: startDate }
        }
      }),
      Lead.sum('estimatedValue', {
        where: {
          status: 'closed_won',
          updatedAt: { [Op.gte]: startDate }
        }
      }),
      Lead.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('estimated_value')), 'avg']],
        where: {
          status: 'closed_won',
          updatedAt: { [Op.gte]: startDate }
        },
        raw: true
      })
    ]);

    // Client lifetime value (from contacts)
    const totalLTV = await Contact.sum('lifetimeValue', {
      where: { isClient: true }
    });

    const avgLTV = await Contact.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('lifetime_value')), 'avg']],
      where: { isClient: true, lifetimeValue: { [Op.not]: null } },
      raw: true
    });

    res.json({
      period: {
        days: daysAgo,
        startDate: startDate.toISOString()
      },
      overview: {
        totalWon,
        totalRevenue: totalRevenue || 0,
        avgDealSize: avgDealSize?.avg ? parseFloat(avgDealSize.avg) : 0,
        totalClientLTV: totalLTV || 0,
        avgClientLTV: avgLTV?.avg ? parseFloat(avgLTV.avg) : 0
      },
      byTime: wonDeals.map((d: any) => ({
        date: d.date,
        count: parseInt(d.count),
        value: d.value ? parseFloat(d.value) : 0
      })),
      bySource: revenueBySource.map((s: any) => ({
        source: s.source,
        count: parseInt(s.count),
        value: s.value ? parseFloat(s.value) : 0
      }))
    });
  })
);

// GET /pipeline - Get pipeline analytics
router.get(
  '/pipeline',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const pipelineStages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

    // Get pipeline data for each stage
    const pipelineData = await Promise.all(
      pipelineStages.map(async (stage) => {
        const stats = await Lead.findOne({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            [Sequelize.fn('SUM', Sequelize.col('estimated_value')), 'value'],
            [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM (NOW() - "created_at")) / 86400')), 'avgDays']
          ],
          where: { status: stage },
          raw: true
        });

        const leads = await Lead.findAll({
          where: { status: stage },
          attributes: ['id', 'email', 'firstName', 'lastName', 'company', 'estimatedValue', 'priority', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 5
        });

        return {
          stage,
          count: parseInt(stats?.count || '0'),
          value: stats?.value ? parseFloat(stats.value) : 0,
          avgDaysInStage: stats?.avgDays ? parseFloat(stats.avgDays).toFixed(1) : '0',
          leads
        };
      })
    );

    // Calculate conversion rates between stages
    const conversionRates = [];
    for (let i = 0; i < pipelineStages.length - 1; i++) {
      const currentStage = pipelineData[i];
      const nextStage = pipelineData[i + 1];
      const rate = currentStage.count > 0
        ? ((nextStage.count / currentStage.count) * 100).toFixed(1)
        : '0';
      conversionRates.push({
        from: pipelineStages[i],
        to: pipelineStages[i + 1],
        rate: parseFloat(rate)
      });
    }

    // Win/loss ratio
    const [wonCount, lostCount] = await Promise.all([
      Lead.count({ where: { status: 'closed_won' } }),
      Lead.count({ where: { status: 'closed_lost' } })
    ]);

    const winRate = (wonCount + lostCount) > 0
      ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1)
      : '0';

    res.json({
      stages: pipelineData,
      conversionRates,
      winLossRatio: {
        won: wonCount,
        lost: lostCount,
        winRate: parseFloat(winRate)
      }
    });
  })
);

export default router;
