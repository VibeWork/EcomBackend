"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/UserAddress.route.ts
const express_1 = __importDefault(require("express"));
const UserAddress_controller_1 = require("../controllers/UserAddress.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const controller = new UserAddress_controller_1.UserAddressController();
router.get('/my', auth_middleware_1.authenticateJWT, controller.getMyAddresses);
router.post('/add', auth_middleware_1.authenticateJWT, controller.addAddress);
router.delete('/:addressId', auth_middleware_1.authenticateJWT, controller.deleteAddress);
router.put('/:addressId', auth_middleware_1.authenticateJWT, controller.updateAddress);
exports.default = router;
