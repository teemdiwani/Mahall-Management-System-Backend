import { CommitteeMember, CommitteeMeeting } from './committee.model.js';

export class CommitteeService {
  static async listMembers() {
    return CommitteeMember.find({ status: 'ACTIVE' }).sort({ designation: 1 });
  }

  static async listMeetings() {
    return CommitteeMeeting.find().sort({ meetingDate: -1 });
  }

  static async scheduleMeeting(data: {
    title: string;
    meetingDate: Date | string;
    location?: string;
    agenda?: string[];
  }) {
    return CommitteeMeeting.create(data);
  }

  static async updateMeetingMinutes(
    id: string,
    data: {
      minutes: string;
      resolutions: string[];
      status: 'COMPLETED' | 'CANCELLED';
    }
  ) {
    return CommitteeMeeting.findByIdAndUpdate(id, data, { new: true });
  }
}
