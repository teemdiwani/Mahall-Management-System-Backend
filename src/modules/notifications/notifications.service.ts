import { Notification } from './notification.model.js';

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
}
