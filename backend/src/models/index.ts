import User from './User.js';
import Lead from './Lead.js';
import Contact from './Contact.js';
import Booking from './Booking.js';
import Task from './Task.js';
import Activity from './Activity.js';
import Subscription from './Subscription.js';
import Testimonial from './Testimonial.js';

// Define associations
User.hasMany(Lead, { foreignKey: 'assignedTo', as: 'assignedLeads' });
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

User.hasMany(Contact, { foreignKey: 'userId', as: 'contacts' });
Contact.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Subscription, { foreignKey: 'userId', as: 'subscription' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Lead.hasMany(Booking, { foreignKey: 'leadId', as: 'bookings' });
Booking.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Lead.hasMany(Task, { foreignKey: 'leadId', as: 'tasks' });
Task.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

Contact.hasMany(Booking, { foreignKey: 'contactId', as: 'bookings' });
Booking.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

export {
  User,
  Lead,
  Contact,
  Booking,
  Task,
  Activity,
  Subscription,
  Testimonial
};

export default {
  User,
  Lead,
  Contact,
  Booking,
  Task,
  Activity,
  Subscription,
  Testimonial
};
