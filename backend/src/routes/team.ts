import { Router } from 'express';
import { Op } from 'sequelize';
import { User, Task } from '../models/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// GET / - Team members with real workload stats derived from tasks
router.get(
  '/',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (_req: AuthRequest, res) => {
    const members = await User.findAll({
      where: { role: { [Op.in]: ['admin', 'operator'] }, isActive: true },
      order: [['firstName', 'ASC']],
    });
    const now = new Date();

    const team = await Promise.all(
      members.map(async (m) => {
        const tasks = await Task.findAll({ where: { assignedTo: m.id }, order: [['dueDate', 'ASC']] });
        const done = tasks.filter((t) => t.status === 'done');
        const open = tasks.filter((t) => t.status !== 'done');
        const overdue = open.filter((t) => t.dueDate && new Date(t.dueDate) < now);
        const hours = tasks.reduce((sum, t) => sum + Number(t.actualHours || 0), 0);
        return {
          user: m.toJSON(),
          totalTasks: tasks.length,
          openTasks: open.length,
          completedTasks: done.length,
          inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
          overdueTasks: overdue.length,
          hoursLogged: hours,
          efficiency: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
          currentWorkload: open.slice(0, 5),
        };
      })
    );
    res.json({ team });
  })
);

export default router;
