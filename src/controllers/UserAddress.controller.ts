// controllers/UserAddress.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserAddress from '../models/UserAddress.model';
import User from '../models/User.model';

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

export class UserAddressController {
  // ✅ Get all addresses for current user
  async getMyAddresses(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const addresses = await UserAddress.findAll({ where: { userId: decoded.userId } });

      return res.status(200).json({ addresses });
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to get addresses', error: err.message });
    }
  }

  // ✅ Add new address
  async addAddress(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);

      const { label, addressLine, landmark, pincode, city, state, country, isDefault } = req.body;

      if (isDefault) {
        await UserAddress.update({ isDefault: false }, { where: { userId: decoded.userId } });
      }

      const address = await UserAddress.create({
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
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to add address', error: err.message });
    }
  }

  // ✅ Delete address
  async deleteAddress(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);

      const { addressId } = req.params;
      const address = await UserAddress.findOne({ where: { addressId, userId: decoded.userId } });

      if (!address) return res.status(404).json({ message: 'Address not found' });

      await address.destroy();

      return res.status(200).json({ message: 'Address deleted' });
    } catch (err: any) {
      return res.status(500).json({ message: 'Failed to delete address', error: err.message });
    }
  }

  // ✅ Update address by addressId
async updateAddress(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;
    const { addressId } = req.params;

    const address = await UserAddress.findOne({ where: { addressId, userId } });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { label, addressLine, landmark, pincode, city, state, country, isDefault } = req.body;

    if (isDefault) {
      // unset previous default address
      await UserAddress.update({ isDefault: false }, { where: { userId } });
    }

    address.label = label ?? address.label;
    address.addressLine = addressLine ?? address.addressLine;
    address.landmark = landmark ?? address.landmark;
    address.pincode = pincode ?? address.pincode;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.country = country ?? address.country;
    address.isDefault = isDefault ?? address.isDefault;

    await address.save();

    return res.status(200).json({ message: '✅ Address updated', address });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update address', error: err.message });
  }
}

}
