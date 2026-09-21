"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteeService = void 0;
const committee_model_js_1 = require("./committee.model.js");
class CommitteeService {
    static async listMembers() {
        return committee_model_js_1.CommitteeMember.find({ status: 'ACTIVE' }).sort({ designation: 1 });
    }
    static async listMeetings() {
        return committee_model_js_1.CommitteeMeeting.find().sort({ meetingDate: -1 });
    }
    static async scheduleMeeting(data) {
        return committee_model_js_1.CommitteeMeeting.create(data);
    }
    static async updateMeetingMinutes(id, data) {
        return committee_model_js_1.CommitteeMeeting.findByIdAndUpdate(id, data, { new: true });
    }
}
exports.CommitteeService = CommitteeService;
