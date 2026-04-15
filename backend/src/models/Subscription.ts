import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface SubscriptionAttributes {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: 'starter' | 'growth' | 'enterprise' | 'pilot';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string;
  public userId!: string;
  public stripeCustomerId!: string;
  public stripeSubscriptionId!: string;
  public plan!: 'starter' | 'growth' | 'enterprise' | 'pilot';
  public status!: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  public currentPeriodStart!: Date;
  public currentPeriodEnd!: Date;
  public cancelAtPeriodEnd!: boolean;
  public amount!: number;
  public currency!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
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
    stripeCustomerId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    plan: {
      type: DataTypes.ENUM('starter', 'growth', 'enterprise', 'pilot'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'past_due', 'trialing', 'paused'),
      defaultValue: 'trialing'
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    }
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['stripeCustomerId'] },
      { fields: ['status'] },
      { fields: ['currentPeriodEnd'] }
    ]
  }
);

export default Subscription;
