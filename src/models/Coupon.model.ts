//Coupon.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from "uuid";
@Table({
  tableName: 'coupons',
  timestamps: true,
})
export default class Coupon extends Model {

   @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  couponId!: string;

  
  @Column(DataType.STRING)
  code!: string; // e.g., "WELCOME10"

  @Column(DataType.STRING)
  description!: string;

  @Column(DataType.ENUM('flat', 'percentage'))
  discountType!: 'flat' | 'percentage';

  @Column(DataType.FLOAT)
  discountValue!: number;

  @Column(DataType.FLOAT)
  discountMaxLimit!: number; // applies only for percentage coupons

  @Column(DataType.DATE)
  expiryDate!: Date;

  @Column(DataType.INTEGER)
  minimumOrderValue!: number;

  @Column(DataType.ARRAY(DataType.STRING))
  applicableCategories!: string[]; // optional filter by product category

  @Default('active')
  @Column(DataType.ENUM('active', 'expired', 'inactive'))
  status!: 'active' | 'expired' | 'inactive';

  @Column(DataType.INTEGER)
  usageLimitPerUser!: number;

  @Column(DataType.INTEGER)
  usageLimitGlobal!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  usedCount!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
