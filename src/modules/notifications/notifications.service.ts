import { Notification } from './notification.model.js';
import { User } from '../auth/user.model.js';
import { Member } from '../members/member.model.js';

export class NotificationsService {
  static async getMyNotifications(userId: string) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30);
  }

  static async getUnreadCount(userId: string) {
    return Notification.countDocuments({ recipient: userId, read: false });
  }

  static async markAsRead(id: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    return { success: true };
  }

  /**
   * Broadcast notification to all active users or filtered by roles
   */
  static async broadcastNotification(data: {
    type: 'PAYMENT' | 'APPLICATION' | 'ANNOUNCEMENT' | 'EVENT' | 'GENERAL';
    title: string;
    message: string;
    link?: string;
    roleFilter?: string[];
  }) {
    try {
      const userFilter: any = { isActive: { $ne: false } };
      if (data.roleFilter && data.roleFilter.length > 0) {
        userFilter.role = { $in: data.roleFilter };
      }
      const users = await User.find(userFilter).select('_id');
      if (!users.length) return;

      const docs = users.map((u) => ({
        recipient: u._id,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        read: false,
      }));

      await Notification.insertMany(docs, { ordered: false });
    } catch (err) {
      console.error('Failed to broadcast notification:', err);
    }
  }

  /**
   * Send notification to all registered user accounts under a specific family
   */
  static async notifyFamilyMembers(
    familyId: any,
    data: {
      type: 'PAYMENT' | 'APPLICATION' | 'ANNOUNCEMENT' | 'EVENT' | 'GENERAL';
      title: string;
      message: string;
      link?: string;
    }
  ) {
    try {
      const members = await Member.find({ familyId, userId: { $exists: true, $ne: null } });
      for (const m of members) {
        if (m.userId) {
          await Notification.create({
            recipient: m.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            read: false,
          });
        }
      }
    } catch (err) {
      console.error('Failed to notify family members:', err);
    }
  }
}

