import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface ActivityAttributes {
  id: string;
  userId?: string;
  type: 'lead_created' | 'lead_updated' | 'contact_created' | 'booking_scheduled' | 'booking_completed' | 'task_created' | 'task_completed' | 'email_sent' | 'note_added' | 'status_changed' | 'login' | 'logout';
  description: string;
  entityType?: 'lead' | 'contact' | 'booking' | 'task' | 'user';
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export interface ActivityCreationAttributes extends Optional<ActivityAttributes, 'id' | 'createdAt'> {}

class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  public id!: string;
  public userId!: string | undefined;
  public type!: 'lead_created' | 'lead_updated' | 'contact_created' | 'booking_scheduled' | 'booking_completed' | 'task_created' | 'task_completed' | 'email_sent' | 'note_added' | 'status_changed' | 'login' | 'logout';
  public description!: string;
  public entityType!: 'lead' | 'contact' | 'booking' | 'task' | 'user' | undefined;
  public entityId!: string | undefined;
  public metadata!: Record<string, any> | undefined;
  public ipAddress!: string | undefined;
  public userAgent!: string | undefined;
  public readonly createdAt!: Date;
}

Activity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    type: {
      type: DataTypes.ENUM('lead_created', 'lead_updated', 'contact_created', 'booking_scheduled', 'booking_completed', 'task_created', 'task_completed', 'email_sent', 'note_added', 'status_changed', 'login', 'logout'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    entityType: DataTypes.ENUM('lead', 'contact', 'booking', 'task', 'user'),
    entityId: DataTypes.UUID,
    metadata: DataTypes.JSONB,
    ipAddress: DataTypes.STRING(45),
    userAgent: DataTypes.TEXT
  },
  {
    sequelize,
    tableName: 'activities',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['entityType', 'entityId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default Activity;
