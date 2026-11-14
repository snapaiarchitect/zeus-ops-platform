import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface TaskAttributes {
  id: string;
  userId: string;
  assignedTo?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'client_work' | 'internal' | 'business_dev' | 'admin';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  clientId?: string;
  leadId?: string;
  tags: string[];
  attachments: string[];
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority' | 'category' | 'tags' | 'attachments'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: string;
  public userId!: string;
  public assignedTo!: string | undefined;
  public title!: string;
  public description!: string | undefined;
  public status!: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public category!: 'client_work' | 'internal' | 'business_dev' | 'admin';
  public dueDate!: Date | undefined;
  public estimatedHours!: number | undefined;
  public actualHours!: number | undefined;
  public clientId!: string | undefined;
  public leadId!: string | undefined;
  public tags!: string[];
  public attachments!: string[];
  public completedAt!: Date | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    assignedTo: DataTypes.UUID,
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done', 'blocked'),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.ENUM('client_work', 'internal', 'business_dev', 'admin'),
      defaultValue: 'internal'
    },
    dueDate: DataTypes.DATE,
    estimatedHours: DataTypes.DECIMAL(4, 1),
    actualHours: DataTypes.DECIMAL(4, 1),
    clientId: DataTypes.UUID,
    leadId: DataTypes.UUID,
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    completedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['assignedTo'] },
      { fields: ['status'] },
      { fields: ['dueDate'] },
      { fields: ['priority'] }
    ]
  }
);

export default Task;
