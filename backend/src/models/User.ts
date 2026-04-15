import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/index.js';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'client';
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'operator' | 'client';
  public firstName!: string;
  public lastName!: string;
  public company!: string | undefined;
  public phone!: string | undefined;
  public avatar!: string | undefined;
  public isActive!: boolean;
  public lastLoginAt!: Date | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'client'),
      defaultValue: 'client'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    company: {
      type: DataTypes.STRING(200)
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    avatar: {
      type: DataTypes.STRING(500)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  }
);

export default User;
