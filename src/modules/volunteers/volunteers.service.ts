import { Volunteer, type IVolunteer } from './volunteer.model.js';
import { Member } from '../members/member.model.js';
import { ApiError } from '../../utils/apiError.js';

export class VolunteersService {
  static async listVolunteers(query: { category?: string; emergencyOnly?: boolean }) {
    const filter: Record<string, any> = { status: 'ACTIVE' };
    if (query.category) filter.categories = query.category;
    if (query.emergencyOnly) filter.emergencyVolunteer = true;

    return Volunteer.find(filter).sort({ name: 1 });
  }

  static async registerVolunteer(
    userId: string,
    data: {
      categories: ('EMERGENCY' | 'EVENT' | 'WELFARE' | 'BLOOD_DONATION' | 'GENERAL')[];
      bloodGroup?: string;
      skills?: string;
      availability?: 'WEEKENDS' | 'EVENINGS' | 'ANYTIME' | 'ON_CALL';
      emergencyVolunteer?: boolean;
    }
  ) {
    const member = await Member.findOne({ userId });

    const existing = await Volunteer.findOne({ userId });
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return existing;
    }

    const volunteer = await Volunteer.create({
      userId,
      memberId: member?._id,
      name: member?.name || 'Mahall Volunteer',
      phone: member?.phone || '+91 9847000000',
      bloodGroup: data.bloodGroup,
      categories: data.categories || ['GENERAL'],
      skills: data.skills,
      availability: data.availability || 'ANYTIME',
      emergencyVolunteer: data.emergencyVolunteer || false,
      status: 'ACTIVE',
    });

    return volunteer;
  }
}
