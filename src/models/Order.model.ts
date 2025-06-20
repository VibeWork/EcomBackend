import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './User.model';
import OrderItem from "./OrderItem.model"

@Table({
  tableName: 'orders',
  timestamps: true,
})
export default class Order extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  orderId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.FLOAT)
  totalAmount!: number;

  @Column(DataType.FLOAT)
  discountAmount!: number;

  @Column(DataType.STRING)
  couponCode!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isPaid!: boolean;
  
  @Column(DataType.FLOAT)
paidAmount!: number;

  @Column(DataType.STRING)
  paymentStatus!: 'Pending' | 'Paid' | 'Failed';


// @Column(DataType.DATE)
// refundInitiatedAt!: Date;
@Column(DataType.DATE)
refundInitiatedAt?: Date | null;

// @Column(DataType.STRING)
// refundStatus!: 'Pending' | 'Approved' | 'Refunded';
@Column(DataType.STRING)
refundStatus?: 'Pending' | 'Approved' | 'Refunded' | null;



  @Column(DataType.STRING)
  transactionId!: string;

  @Column(DataType.STRING)
  paymentMethod!: 'Card' | 'Cash' | 'UPI' | 'Wallet';

  @Column(DataType.STRING)
  orderStatus!: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';

  @Column(DataType.STRING)
  deliveryType!: 'Instant' | 'Scheduled' | 'Next Morning';

  @Column(DataType.STRING)
  deliveryPartner!: string;

  @Column(DataType.STRING)
  trackingNumber!: string;

  @Column(DataType.STRING)
  deliveryAddress!: string;

  @Column(DataType.DATE)
  scheduledTime!: Date;

  @Column(DataType.TEXT)
  orderNotes!: string;

  @Column(DataType.TEXT)
  userInstructions!: string;

  @HasMany(() => OrderItem)
  items!: OrderItem[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
