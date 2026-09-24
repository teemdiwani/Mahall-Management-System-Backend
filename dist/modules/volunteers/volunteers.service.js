"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteersService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const volunteer_model_js_1 = require("./volunteer.model.js");
const member_model_js_1 = require("../members/member.model.js");
class VolunteersService {
    static async listVolunteers(query) {
        const filter = {};
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status;
        }
        if (query.category && query.category !== 'ALL') {
            filter.categories = query.category;
        }
        if (query.emergencyOnly) {
            filter.emergencyVolunteer = true;
        }
        return volunteer_model_js_1.Volunteer.find(filter).sort({ createdAt: -1, name: 1 });
    }
    static async registerVolunteer(userId, data) {
        const member = await member_model_js_1.Member.findOne({ userId });
        const volunteerName = data.name?.trim() || member?.name || 'Mahall Volunteer';
        const volunteerPhone = data.phone?.trim() || member?.phone || '+91 9847000000';
        // Check if volunteer with same phone or user already exists
        const conditions = [];
        if (data.phone) {
            conditions.push({ phone: data.phone.trim() });
        }
        if (userId && !data.name) {
            conditions.push({ userId });
        }
        const existing = conditions.length > 0 ? await volunteer_model_js_1.Volunteer.findOne({ $or: conditions }) : null;
        if (existing) {
            existing.name = volunteerName;
            existing.phone = volunteerPhone;
            if (data.bloodGroup)
                existing.bloodGroup = data.bloodGroup;
            if (data.categories && data.categories.length > 0)
                existing.categories = data.categories;
            if (data.skills !== undefined)
                existing.skills = data.skills;
            if (data.availability)
                existing.availability = data.availability;
            if (data.emergencyVolunteer !== undefined)
                existing.emergencyVolunteer = data.emergencyVolunteer;
            existing.status = 'ACTIVE';
            await existing.save();
            return existing;
        }
        const volunteer = await volunteer_model_js_1.Volunteer.create({
            userId: userId && mongoose_1.default.isValidObjectId(userId) ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
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
exports.VolunteersService = VolunteersService;
