// import {
//   Table,
//   Column,
//   Model,
//   DataType,
//   ForeignKey,
//   PrimaryKey,
//   CreatedAt,
//   UpdatedAt,
//   BelongsTo,
//   Default,
// } from 'sequelize-typescript';
// import Coupon from './Coupon.model';
// import User from './User.model';

// @Table({
//   tableName: 'user_coupons',
//   timestamps: true,
// })
// export default class UserCoupon extends Model {
//   @PrimaryKey
//   @Column(DataType.UUID)
//   id!: string;

//   @ForeignKey(() => User)
//   @Column(DataType.UUID)
//   userId!: string;

//   @BelongsTo(() => User)
//   user!: User;

//   @ForeignKey(() => Coupon)
//   @Column(DataType.STRING)
//   couponCode!: string;

//   @BelongsTo(() => Coupon)
//   coupon!: Coupon;

//   @Default(false)
//   @Column(DataType.BOOLEAN)
//   isRedeemed!: boolean;

//   @Column(DataType.DATE)
//   issuedAt!: Date;

//   @Column(DataType.DATE)
//   redeemedAt!: Date;

//   @CreatedAt
//   createdAt!: Date;

//   @UpdatedAt
//   updatedAt!: Date;
// }

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Coupon from './Coupon.model';
import User from './User.model';

@Table({
  tableName: 'user_coupons',
  timestamps: true,
})
export default class UserCoupon extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Coupon)
  @Column(DataType.UUID)
  couponId!: string;

  @BelongsTo(() => Coupon)
  coupon!: Coupon;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isRedeemed!: boolean;

  @Column(DataType.DATE)
  issuedAt!: Date;

  @Column(DataType.DATE)
  redeemedAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
