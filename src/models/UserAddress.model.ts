// models/UserAddress.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './User.model';

@Table({
  tableName: 'user_addresses',
  timestamps: true,
})
export default class UserAddress extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  addressId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.STRING)
  label!: string; // e.g. "Home", "Work"

  @Column(DataType.STRING)
  addressLine!: string;

  @Column(DataType.STRING)
  landmark!: string;

  @Column(DataType.STRING)
  pincode!: string;

  @Column(DataType.STRING)
  city!: string;

  @Column(DataType.STRING)
  state!: string;

  @Column(DataType.STRING)
  country!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
