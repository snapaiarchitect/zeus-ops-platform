import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface LeadAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  notes?: string;
  estimatedValue?: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  tags: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'source' | 'status' | 'priority'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  public id!: string;
  public email!: string;
  public firstName!: string | undefined;
  public lastName!: string | undefined;
  public company!: string | undefined;
  public phone!: string | undefined;
  public source!: string;
  public status!: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  public notes!: string | undefined;
  public estimatedValue!: number | undefined;
  public priority!: 'low' | 'medium' | 'high';
  public assignedTo!: string | undefined;
  public lastContactedAt!: Date | undefined;
  public nextFollowUpAt!: Date | undefined;
  public tags!: string[];
  public utmSource!: string | undefined;
  public utmMedium!: string | undefined;
  public utmCampaign!: string | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true }
    },
    firstName: DataTypes.STRING(100),
    lastName: DataTypes.STRING(100),
    company: DataTypes.STRING(200),
    phone: DataTypes.STRING(20),
    source: {
      type: DataTypes.STRING(50),
      defaultValue: 'website'
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
      defaultValue: 'new'
    },
    notes: DataTypes.TEXT,
    estimatedValue: DataTypes.DECIMAL(10, 2),
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    assignedTo: DataTypes.UUID,
    lastContactedAt: DataTypes.DATE,
    nextFollowUpAt: DataTypes.DATE,
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    utmSource: DataTypes.STRING(50),
    utmMedium: DataTypes.STRING(50),
    utmCampaign: DataTypes.STRING(100)
  },
  {
    sequelize,
    tableName: 'leads',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['assignedTo'] },
      { fields: ['createdAt'] },
      { fields: ['email'] }
    ]
  }
);

export default Lead;
