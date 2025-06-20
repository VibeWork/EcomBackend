"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddressController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserAddress_model_1 = __importDefault(require("../models/UserAddress.model"));
const SECRET_KEY = process.env.JWT_SECRET_KEY;
class UserAddressController {
    // ✅ Get all addresses for current user
    getMyAddresses(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const addresses = yield UserAddress_model_1.default.findAll({ where: { userId: decoded.userId } });
                return res.status(200).json({ addresses });
            }
            catch (err) {
                return res.status(500).json({ message: 'Failed to get addresses', error: err.message });
            }
        });
    }
    // ✅ Add new address
    addAddress(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const { label, addressLine, landmark, pincode, city, state, country, isDefault } = req.body;
                if (isDefault) {
                    yield UserAddress_model_1.default.update({ isDefault: false }, { where: { userId: decoded.userId } });
                }
                const address = yield UserAddress_model_1.default.create({
                    userId: decoded.userId,
                    label,
                    addressLine,
                    landmark,
                    pincode,
                    city,
                    state,
                    country,
                    isDefault: isDefault || false,
                });
                return res.status(201).json({ message: 'Address added', address });
            }
            catch (err) {
                return res.status(500).json({ message: 'Failed to add address', error: err.message });
            }
        });
    }
    // ✅ Delete address
    deleteAddress(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const { addressId } = req.params;
                const address = yield UserAddress_model_1.default.findOne({ where: { addressId, userId: decoded.userId } });
                if (!address)
                    return res.status(404).json({ message: 'Address not found' });
                yield address.destroy();
                return res.status(200).json({ message: 'Address deleted' });
            }
            catch (err) {
                return res.status(500).json({ message: 'Failed to delete address', error: err.message });
            }
        });
    }
    // ✅ Update address by addressId
    updateAddress(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const { addressId } = req.params;
                const address = yield UserAddress_model_1.default.findOne({ where: { addressId, userId } });
                if (!address) {
                    return res.status(404).json({ message: 'Address not found' });
                }
                const { label, addressLine, landmark, pincode, city, state, country, isDefault } = req.body;
                if (isDefault) {
                    // unset previous default address
                    yield UserAddress_model_1.default.update({ isDefault: false }, { where: { userId } });
                }
                address.label = label !== null && label !== void 0 ? label : address.label;
                address.addressLine = addressLine !== null && addressLine !== void 0 ? addressLine : address.addressLine;
                address.landmark = landmark !== null && landmark !== void 0 ? landmark : address.landmark;
                address.pincode = pincode !== null && pincode !== void 0 ? pincode : address.pincode;
                address.city = city !== null && city !== void 0 ? city : address.city;
                address.state = state !== null && state !== void 0 ? state : address.state;
                address.country = country !== null && country !== void 0 ? country : address.country;
                address.isDefault = isDefault !== null && isDefault !== void 0 ? isDefault : address.isDefault;
                yield address.save();
                return res.status(200).json({ message: '✅ Address updated', address });
            }
            catch (err) {
                return res.status(500).json({ message: 'Failed to update address', error: err.message });
            }
        });
    }
}
exports.UserAddressController = UserAddressController;
