"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteeService = void 0;
const committee_model_js_1 = require("./committee.model.js");
class CommitteeService {
    static async listMembers() {
        let members = await committee_model_js_1.CommitteeMember.find().sort({ designation: 1 });
        if (members.length === 0) {
            const defaultMembers = [
                {
                    name: 'Haji Abdul Kareem',
                    designation: 'PRESIDENT',
                    phone: '+91 9847001122',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
                {
                    name: 'Dr. Tariq Jamil',
                    designation: 'VICE_PRESIDENT',
                    phone: '+91 9847005566',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
                {
                    name: 'Zubair Al-Katib',
                    designation: 'SECRETARY',
                    phone: '+91 9847002233',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
                {
                    name: 'K. Mohammed Shafeeq',
                    designation: 'JOINT_SECRETARY',
                    phone: '+91 9847333444',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
                {
                    name: 'Mustafa Al-Amin',
                    designation: 'TREASURER',
                    phone: '+91 9847003344',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
                {
                    name: 'Sayyid Munawwar Thangal',
                    designation: 'MEMBER',
                    phone: '+91 9847111024',
                    termStart: new Date('2025-01-01'),
                    termEnd: new Date('2027-01-01'),
                    status: 'ACTIVE',
                },
            ];
            await committee_model_js_1.CommitteeMember.create(defaultMembers);
            members = await committee_model_js_1.CommitteeMember.find().sort({ designation: 1 });
        }
        return members;
    }
    static async listMeetings() {
        let meetings = await committee_model_js_1.CommitteeMeeting.find().sort({ meetingDate: -1 });
        if (meetings.length === 0) {
            await committee_model_js_1.CommitteeMeeting.create([
                {
                    title: 'Executive Council General Review Meeting',
                    meetingDate: new Date(),
                    location: 'Committee Boardroom',
                    agenda: [
                        'Review monthly maintenance and treasury accounts',
                        'Finalize Ramadan Iftar and Taraweeh arrangements',
                        'Assess pending welfare and Zakat applications',
                    ],
                    resolutions: [
                        'Approved budget allocation for Ramadan community programs',
                        'Passed resolution for digital Razorpay fee collections',
                    ],
                    status: 'COMPLETED',
                },
            ]);
            meetings = await committee_model_js_1.CommitteeMeeting.find().sort({ meetingDate: -1 });
        }
        return meetings;
    }
    static async createMember(data) {
        return committee_model_js_1.CommitteeMember.create({
            ...data,
            termStart: data.termStart || new Date('2025-01-01'),
            termEnd: data.termEnd || new Date('2027-01-01'),
            status: 'ACTIVE',
        });
    }
    static async deleteMember(id) {
        return committee_model_js_1.CommitteeMember.findByIdAndDelete(id);
    }
    static async scheduleMeeting(data) {
        return committee_model_js_1.CommitteeMeeting.create(data);
    }
    static async updateMeetingMinutes(id, data) {
        return committee_model_js_1.CommitteeMeeting.findByIdAndUpdate(id, data, { new: true });
    }
}
exports.CommitteeService = CommitteeService;
