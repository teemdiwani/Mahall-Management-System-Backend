import mongoose from 'mongoose';
import { Volunteer, type IVolunteer } from './volunteer.model.js';
import { Member } from '../members/member.model.js';
import { ApiError } from '../../utils/apiError.js';

export class VolunteersService {
  static async listVolunteers(query: { category?: string; emergencyOnly?: boolean; status?: string }) {
    const filter: Record<string, any> = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query.category && query.category !== 'ALL') {
      filter.categories = query.category;
    }
    if (query.emergencyOnly) {
      filter.emergencyVolunteer = true;
    }

    return Volunteer.find(filter).sort({ createdAt: -1, name: 1 });
  }

  static async registerVolunteer(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      categories: ('EMERGENCY' | 'EVENT' | 'WELFARE' | 'BLOOD_DONATION' | 'GENERAL')[];
      bloodGroup?: string;
      skills?: string;
      availability?: 'WEEKENDS' | 'EVENINGS' | 'ANYTIME' | 'ON_CALL';
      emergencyVolunteer?: boolean;
    }
  ) {
    const member = await Member.findOne({ userId });

    const volunteerName = data.name?.trim() || member?.name || 'Mahall Volunteer';
    const volunteerPhone = data.phone?.trim() || member?.phone || '+91 9847000000';

    // Check if volunteer with same phone or user already exists
    const conditions: Record<string, any>[] = [];
    if (data.phone) {
      conditions.push({ phone: data.phone.trim() });
    }
    if (userId && !data.name) {
      conditions.push({ userId });
    }

    const existing = conditions.length > 0 ? await Volunteer.findOne({ $or: conditions }) : null;
    if (existing) {
      existing.name = volunteerName;
      existing.phone = volunteerPhone;
      if (data.bloodGroup) existing.bloodGroup = data.bloodGroup;
      if (data.categories && data.categories.length > 0) existing.categories = data.categories;
      if (data.skills !== undefined) existing.skills = data.skills;
      if (data.availability) existing.availability = data.availability;
      if (data.emergencyVolunteer !== undefined) existing.emergencyVolunteer = data.emergencyVolunteer;
      existing.status = 'ACTIVE';
      await existing.save();
      return existing;
    }

    const volunteer = await Volunteer.create({
      userId: userId && mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
      memberId: member?._id,
      name: volunteerName,
      phone: volunteerPhone,
      bloodGroup: data.bloodGroup,
      categories: data.categories && data.categories.length > 0 ? data.categories : ['GENERAL'],
      skills: data.skills,
      availability: data.availability || 'ANYTIME',
      emergencyVolunteer: data.emergencyVolunteer || false,
      status: 'ACTIVE',
    });

    return volunteer;
  }
}
