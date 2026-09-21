"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteersService = void 0;
const volunteer_model_js_1 = require("./volunteer.model.js");
const member_model_js_1 = require("../members/member.model.js");
class VolunteersService {
    static async listVolunteers(query) {
        const filter = { status: 'ACTIVE' };
        if (query.category)
            filter.categories = query.category;
        if (query.emergencyOnly)
            filter.emergencyVolunteer = true;
        return volunteer_model_js_1.Volunteer.find(filter).sort({ name: 1 });
    }
    static async registerVolunteer(userId, data) {
        const member = await member_model_js_1.Member.findOne({ userId });
        const existing = await volunteer_model_js_1.Volunteer.findOne({ userId });
        if (existing) {
            Object.assign(existing, data);
            await existing.save();
            return existing;
        }
        const volunteer = await volunteer_model_js_1.Volunteer.create({
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
exports.VolunteersService = VolunteersService;
