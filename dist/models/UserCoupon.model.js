"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Coupon_model_1 = __importDefault(require("./Coupon.model"));
const User_model_1 = __importDefault(require("./User.model"));
let UserCoupon = class UserCoupon extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], UserCoupon.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_model_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], UserCoupon.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_model_1.default),
    __metadata("design:type", User_model_1.default)
], UserCoupon.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Coupon_model_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], UserCoupon.prototype, "couponId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Coupon_model_1.default),
    __metadata("design:type", Coupon_model_1.default)
], UserCoupon.prototype, "coupon", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], UserCoupon.prototype, "isRedeemed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], UserCoupon.prototype, "issuedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], UserCoupon.prototype, "redeemedAt", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], UserCoupon.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], UserCoupon.prototype, "updatedAt", void 0);
UserCoupon = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'user_coupons',
        timestamps: true,
    })
], UserCoupon);
exports.default = UserCoupon;
