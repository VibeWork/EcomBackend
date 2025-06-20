import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Unique,
  IsEmail,
  CreatedAt,
  UpdatedAt,
  Default,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid"; 
import { HasMany } from 'sequelize-typescript';
import UserAddress from './UserAddress.model';
@Table({
  tableName: "users",
  timestamps: true,
})
export default class User extends Model {
  @PrimaryKey
  @Unique
  @Column({
    type: DataType.UUID,
    defaultValue: uuidv4,
    allowNull: false,
  })
  userId!: string;

@Unique
@Column({
  type: DataType.STRING,
  allowNull: false,
})
firebaseId!: string;


  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Unique
  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  phone!: string | null;

  // @Column(DataType.STRING)
  // address!: string;

  @HasMany(() => UserAddress)
addresses!: UserAddress[];

  @Default("This is a default profile.")
  @Column(DataType.STRING(500))
  profile!: string;

  // @Column(DataType.STRING)
  // landmark!: string;

  // @Column(DataType.STRING)
  // pincode!: string;

  // @Column(DataType.STRING)
  // city!: string;

  // @Column(DataType.STRING)
  // state!: string;

  // @Column(DataType.STRING)
  // country!: string;

  @Column(DataType.STRING)
  profilePicture!: string;

  @Default("user")
  @Column({
    type: DataType.ENUM("admin", "user"),
  })
  role!: "admin" | "user";

  // @CreatedAt
  // @Column(DataType.DATE)
  // createdAt!: Date;

  // @UpdatedAt
  // @Column(DataType.DATE)
  // updatedAt!: Date;
  @CreatedAt
@Column(DataType.DATE)
createdAt!: Date;

@UpdatedAt
@Column(DataType.DATE)
updatedAt!: Date;

}
