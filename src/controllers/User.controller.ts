// controllers/User.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import UserAddress from '../models/UserAddress.model';
  import { Op } from 'sequelize';


const SECRET_KEY = process.env.JWT_SECRET_KEY!;

export class UserController {
  // ✅ Get current user's profile
// ✅ Get current user's profile with addresses
async getMe(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    const user = await User.findByPk(decoded.userId, {
      include: [UserAddress], // 👈 Include address list
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('❌ Error getting user:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


  // ✅ Update user's profile
async updateProfile(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      name,
      phone,
      profile,
      profilePicture,
    } = req.body;

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.profile = profile ?? user.profile;
    user.profilePicture = profilePicture ?? user.profilePicture;

    await user.save();

    return res.status(200).json({ message: '✅ Profile updated', user });
  } catch (error: any) {
    console.error('❌ Error updating profile:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


  // ✅ (Admin) Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);

      const requester = await User.findByPk(decoded.userId);
      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const users = await User.findAll();
      return res.status(200).json({ users });
    } catch (error: any) {
      console.error('❌ Error fetching users:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  // ✅ (Admin) Promote user to admin
  async promoteToAdmin(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);

      const requester = await User.findByPk(decoded.userId);
      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const { userId } = req.params;
      const targetUser = await User.findByPk(userId);

      if (!targetUser) return res.status(404).json({ message: 'User not found' });

      targetUser.role = 'admin';
      await targetUser.save();

      return res.status(200).json({ message: '✅ User promoted to admin', user: targetUser });
    } catch (error: any) {
      console.error('❌ Error promoting user:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }


async getCustomerStats(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    const adminUser = await User.findByPk(decoded.userId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total customers
    const totalCustomers = await User.count({ where: { role: 'user' } });

    // Customers registered this month
    const monthlyCustomers = await User.count({
      where: {
        role: 'user',
        createdAt: {
          [Op.gte]: firstDayOfMonth,
          [Op.lte]: today,
        }
      }
    });

    return res.status(200).json({
      totalCustomers,
      monthlyCustomers,
    });
  } catch (error: any) {
    console.error('❌ Error getting customer stats:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async getCustomersByDate(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // const adminUser = await User.findByPk(decoded.userId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate as string) : new Date();

    const whereCondition = {
      role: 'user',
      createdAt: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    };

    // Fetch users
    const users = await User.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
    });

    // Count total
    const totalCount = await User.count({ where: whereCondition });

    return res.status(200).json({
      totalUsers: totalCount,
      users,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  } catch (error: any) {
    console.error('❌ Error getting users by date:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



}
