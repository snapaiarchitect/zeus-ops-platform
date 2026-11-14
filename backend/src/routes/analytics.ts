import { Router } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Lead, Contact, Booking, Task, Activity, Subscription, User } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { truncDate, hoursBetweenExpr, ageDaysExpr } from '../database/dialect.js';

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
    const closedWonLeads: any = leadsByStatus.find((s: any) => s.status === 'closed_won');
    const closedLostLeads: any = leadsByStatus.find((s: any) => s.status === 'closed_lost');
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
        [truncDate(groupBy, 'createdAt'), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['status', truncDate(groupBy, 'createdAt') as any],
      order: [[truncDate(groupBy, 'createdAt') as any, 'ASC']],
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
    const avgLeadValue: any = await (Lead as any).findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('estimatedValue')), 'avg']],
      where: {
        createdAt: { [Op.gte]: startDate },
        estimatedValue: { [Op.not]: null }
      },
      raw: true
    });

    // Total pipeline value
    const pipelineValue: any = await (Lead as any).findOne({
      attributes: [[Sequelize.fn('SUM', Sequelize.col('estimatedValue')), 'total']],
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
        [Sequelize.fn('AVG', Sequelize.literal(hoursBetweenExpr)), 'avgHours']
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
        [truncDate(groupBy, 'updatedAt'), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('estimatedValue')), 'value']
      ],
      where: {
        status: 'closed_won',
        updatedAt: { [Op.gte]: startDate }
      },
      group: [truncDate(groupBy, 'updatedAt') as any],
      order: [[truncDate(groupBy, 'updatedAt') as any, 'ASC']],
      raw: true
    });

    // Won deals by source
    const revenueBySource = await Lead.findAll({
      attributes: [
        'source',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('estimatedValue')), 'value']
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
      (Lead as any).findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('estimatedValue')), 'avg']],
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

    const avgLTV: any = await (Contact as any).findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('lifetimeValue')), 'avg']],
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
        avgDealSize: (avgDealSize as any)?.avg ? parseFloat((avgDealSize as any).avg) : 0,
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
        const stats: any = await (Lead as any).findOne({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            [Sequelize.fn('SUM', Sequelize.col('estimatedValue')), 'value'],
            [Sequelize.fn('AVG', Sequelize.literal(ageDaysExpr)), 'avgDays']
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

// GET /summary - Flat headline numbers used by the admin overview & analytics pages
router.get(
  '/summary',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [totalLeads, newLeadsThisMonth, totalContacts, won, mrrRaw, activeTasks, pendingTasks, upcomingBookings, totalTasks, doneTasks] = await Promise.all([
      Lead.count(),
      Lead.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
      Contact.count(),
      Lead.findAll({ where: { status: 'closed_won' }, raw: true }) as Promise<any[]>,
      Subscription.sum('amount', { where: { status: 'active' } }),
      Task.count({ where: { status: 'in_progress' } }),
      Task.count({ where: { status: { [Op.in]: ['todo', 'review', 'blocked'] } } }),
      Booking.count({ where: { status: 'scheduled', scheduledAt: { [Op.between]: [new Date(), new Date(Date.now() + 7 * 864e5)] } } }),
      Task.count(),
      Task.count({ where: { status: 'done' } }),
    ]);
    const totalRevenue = won.reduce((s, l) => s + Number(l.estimatedValue || 0), 0);
    const closed = await Lead.count({ where: { status: { [Op.in]: ['closed_won', 'closed_lost'] } } });
    const byStatusRows: any[] = (await Lead.findAll({ attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']], group: ['status'], raw: true })) as any[];
    const byStatus = byStatusRows.map((r) => ({ status: r.status, count: Number(r.count), percentage: totalLeads ? Math.round((Number(r.count) / totalLeads) * 100) : 0 }));
    const bySource: any[] = (await Lead.findAll({ attributes: ['source', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']], group: ['source'], raw: true })) as any[];

    // Revenue (won deal value) grouped by month
    const monthMap = new Map<string, number>();
    for (const l of won) {
      const key = new Date(l.updatedAt).toISOString().slice(0, 7);
      monthMap.set(key, (monthMap.get(key) || 0) + Number(l.estimatedValue || 0));
    }
    const revenueByMonth = [...monthMap.entries()].sort().map(([month, revenue]) => ({ month, revenue, newMrr: 0, churnedMrr: 0 }));

    const clients: any[] = (await Contact.findAll({ where: { isClient: true }, order: [['lifetimeValue', 'DESC']], limit: 5, raw: true })) as any[];
    const topClients = clients.map((c) => ({ name: c.company || c.email, revenue: Number(c.lifetimeValue || 0) }));

    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
    const open: any[] = (await Lead.findAll({ where: { status: { [Op.in]: stages } }, raw: true })) as any[];
    const pipelineByStage = stages.map((stage) => {
      const rows = open.filter((l) => l.status === stage);
      return { stage, count: rows.length, value: rows.reduce((s, l) => s + Number(l.estimatedValue || 0), 0) };
    });

    res.json({
      totalLeads, newLeadsThisMonth, totalContacts, totalRevenue,
      mrr: Number(mrrRaw || 0), activeTasks, pendingTasks, upcomingBookings,
      conversionRate: closed ? Math.round((won.length / closed) * 1000) / 10 : 0,
      avgDealSize: won.length ? Math.round(totalRevenue / won.length) : 0,
      leadsByStatus: byStatus,
      leadsBySource: bySource.map((r) => ({ source: r.source, count: Number(r.count) })),
      revenueByMonth, topClients,
      pipelineValue: pipelineByStage.reduce((s, p) => s + p.value, 0), pipelineByStage,
      taskStats: { total: totalTasks, completed: doneTasks, completionRate: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0 },
    });
  })
);

// GET /activity - Recent activity feed with actor names
router.get(
  '/activity',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req: AuthRequest, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));
    const activities = await Activity.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
    });
    res.json({ activities });
  })
);

export default router;
