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
import Order from './Order.model';
import Product from './Product.Model';

@Table({
  tableName: 'order_items',
  timestamps: true,
})
export default class OrderItem extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  id!: string;

  @ForeignKey(() => Order)
  @Column(DataType.UUID)
  orderId!: string;

  @BelongsTo(() => Order)
  order!: Order;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  @Column(DataType.STRING)
  productName!: string;

  @Column(DataType.STRING)
  productImage!: string;

  @Column(DataType.FLOAT)
  unitPrice!: number;

  @Column(DataType.INTEGER)
  quantity!: number;

  @Column(DataType.FLOAT)
  totalPrice!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
