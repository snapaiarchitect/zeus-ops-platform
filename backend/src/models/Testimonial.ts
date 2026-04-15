import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';

export interface TestimonialAttributes {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating: number;
  metrics?: {
    label: string;
    value: string;
  }[];
  isActive: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestimonialCreationAttributes extends Optional<TestimonialAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Testimonial extends Model<TestimonialAttributes, TestimonialCreationAttributes> implements TestimonialAttributes {
  public id!: string;
  public name!: string;
  public role!: string;
  public company!: string;
  public avatar!: string | undefined;
  public content!: string;
  public rating!: number;
  public metrics!: { label: string; value: string; }[] | undefined;
  public isActive!: boolean;
  public featured!: boolean;
  public displayOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Testimonial.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    avatar: DataTypes.STRING(500),
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: { min: 1, max: 5 }
    },
    metrics: DataTypes.JSONB,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'testimonials',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['featured'] },
      { fields: ['displayOrder'] }
    ]
  }
);

export default Testimonial;
