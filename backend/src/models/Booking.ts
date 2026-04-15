import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface BookingAttributes {
  id: string;
  leadId?: string;
  contactId?: string;
  calendlyEventId?: string;
  calendlyInviteeId?: string;
  eventType: 'discovery' | 'strategy' | 'demo' | 'consultation' | 'check_in';
  scheduledAt: Date;
  timezone: string;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  meetingUrl?: string;
  notes?: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public leadId!: string | undefined;
  public contactId!: string | undefined;
  public calendlyEventId!: string | undefined;
  public calendlyInviteeId!: string | undefined;
  public eventType!: 'discovery' | 'strategy' | 'demo' | 'consultation' | 'check_in';
  public scheduledAt!: Date;
  public timezone!: string;
  public duration!: number;
  public status!: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  public meetingUrl!: string | undefined;
  public notes!: string | undefined;
  public outcome!: string | undefined;
  public followUpRequired!: boolean;
  public followUpNotes!: string | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leadId: DataTypes.UUID,
    contactId: DataTypes.UUID,
    calendlyEventId: DataTypes.STRING(100),
    calendlyInviteeId: DataTypes.STRING(100),
    eventType: {
      type: DataTypes.ENUM('discovery', 'strategy', 'demo', 'consultation', 'check_in'),
      defaultValue: 'discovery'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'America/New_York'
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'scheduled'
    },
    meetingUrl: DataTypes.STRING(500),
    notes: DataTypes.TEXT,
    outcome: DataTypes.TEXT,
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpNotes: DataTypes.TEXT
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      { fields: ['leadId'] },
      { fields: ['contactId'] },
      { fields: ['scheduledAt'] },
      { fields: ['status'] }
    ]
  }
);

export default Booking;
