import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface ContactAttributes {
  id: string;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  linkedinUrl?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  tags: string[];
  notes?: string;
  isClient: boolean;
  clientSince?: Date;
  lifetimeValue?: number;
  lastInteractionAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactCreationAttributes extends Optional<ContactAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Contact extends Model<ContactAttributes, ContactCreationAttributes> implements ContactAttributes {
  public id!: string;
  public userId!: string | undefined;
  public email!: string;
  public firstName!: string | undefined;
  public lastName!: string | undefined;
  public company!: string | undefined;
  public jobTitle!: string | undefined;
  public phone!: string | undefined;
  public linkedinUrl!: string | undefined;
  public website!: string | undefined;
  public address!: string | undefined;
  public city!: string | undefined;
  public state!: string | undefined;
  public zipCode!: string | undefined;
  public country!: string | undefined;
  public tags!: string[];
  public notes!: string | undefined;
  public isClient!: boolean;
  public clientSince!: Date | undefined;
  public lifetimeValue!: number | undefined;
  public lastInteractionAt!: Date | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: DataTypes.UUID,
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true }
    },
    firstName: DataTypes.STRING(100),
    lastName: DataTypes.STRING(100),
    company: DataTypes.STRING(200),
    jobTitle: DataTypes.STRING(100),
    phone: DataTypes.STRING(20),
    linkedinUrl: DataTypes.STRING(500),
    website: DataTypes.STRING(500),
    address: DataTypes.STRING(500),
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(50),
    zipCode: DataTypes.STRING(20),
    country: DataTypes.STRING(100),
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: DataTypes.TEXT,
    isClient: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    clientSince: DataTypes.DATE,
    lifetimeValue: DataTypes.DECIMAL(12, 2),
    lastInteractionAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['company'] },
      { fields: ['isClient'] },
      { fields: ['tags'] }
    ]
  }
);

export default Contact;
