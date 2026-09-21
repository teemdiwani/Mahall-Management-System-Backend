import { Announcement, type IAnnouncement } from './announcement.model.js';
import { ROLES, type UserRole } from '../../constants/roles.js';

export class AnnouncementsService {
  static async listAnnouncements(userRole?: UserRole) {
    const filter: Record<string, any> = { status: 'ACTIVE' };

    if (userRole && userRole !== ROLES.SUPER_ADMIN && userRole !== ROLES.SECRETARY) {
      filter.targetAudience = { $in: ['ALL', 'MEMBERS', userRole] };
    }

    return Announcement.find(filter).sort({ isPinned: -1, publishedAt: -1 });
  }

  static async createAnnouncement(data: Partial<IAnnouncement>) {
    return Announcement.create({
      ...data,
      publishedAt: new Date(),
      status: 'ACTIVE',
    });
  }

  static async archiveAnnouncement(id: string) {
    return Announcement.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
  }
}
