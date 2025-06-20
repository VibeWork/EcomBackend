import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'products',
  timestamps: true,
})
export default class Product extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
  })
  id!: string;

  @Unique
  @Column(DataType.STRING)
  productCode!: string;

  @Column(DataType.STRING)
  productName!: string;

  @Column(DataType.ARRAY(DataType.STRING))
  productImages!: string[];

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.FLOAT)
  actualPrice!: number;

  @Column(DataType.FLOAT)
  discount!: number;

  @Column(DataType.FLOAT)
  finalPrice!: number;

  @Column({
  type: DataType.INTEGER,
  defaultValue: 0,
})
stock!: number;

 
  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.STRING)
  subCategory!: string;

  @Column(DataType.ARRAY(DataType.STRING))
tags!: string[];


  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  rating!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isFeatured!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isTrending!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isNew!: boolean;

  @Column(DataType.DATE)
  expiryDate!: Date;

  @Column(DataType.DATE)
  harvestDate!: Date;

@Column(DataType.INTEGER)
shelfLife!: number;

  @Column(DataType.BOOLEAN)
  returnable!: boolean;

  
  @Column(DataType.STRING)
  storageInstructions!: string;


  @Column(DataType.INTEGER)
  maxPurchaseLimit!: number;

  @Column(DataType.STRING)
  deliveryType!: 'Instant' | 'Scheduled' | 'Next Morning';

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
