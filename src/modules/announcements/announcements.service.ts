import { Announcement, type IAnnouncement } from './announcement.model.js';
import { ROLES, type UserRole } from '../../constants/roles.js';
import { NotificationsService } from '../notifications/notifications.service.js';

export class AnnouncementsService {
  static async listAnnouncements(userRole?: UserRole) {
    const filter: Record<string, any> = { status: 'ACTIVE' };

    if (userRole && userRole !== ROLES.SUPER_ADMIN && userRole !== ROLES.SECRETARY) {
      filter.targetAudience = { $in: ['ALL', 'MEMBERS', userRole] };
    }

    return Announcement.find(filter).sort({ isPinned: -1, publishedAt: -1 });
  }

  static async createAnnouncement(data: Partial<IAnnouncement>) {
    const ann = await Announcement.create({
      ...data,
      publishedAt: new Date(),
      status: 'ACTIVE',
    });

    // Notify all active users
    NotificationsService.broadcastNotification({
      type: 'ANNOUNCEMENT',
      title: `📢 Announcement: ${ann.title}`,
      message: ann.content ? ann.content.slice(0, 150) : 'New Mahall announcement published.',
      link: '/app/announcements',
    }).catch(() => {});

    return ann;
  }

  static async archiveAnnouncement(id: string) {
    return Announcement.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
  }
}
