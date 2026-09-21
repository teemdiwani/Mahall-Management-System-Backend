"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteersController = void 0;
const volunteers_service_js_1 = require("./volunteers.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const volunteer_model_js_1 = require("./volunteer.model.js");
class VolunteersController {
    static async list(req, res, next) {
        try {
            const volunteers = await volunteers_service_js_1.VolunteersService.listVolunteers(req.query);
            return apiResponse_js_1.ApiResponse.success(res, volunteers);
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const volunteer = await volunteers_service_js_1.VolunteersService.registerVolunteer(req.user._id.toString(), req.body);
            return apiResponse_js_1.ApiResponse.success(res, volunteer, 201, 'Volunteer registration successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAvailability(req, res, next) {
        try {
            const updated = await volunteer_model_js_1.Volunteer.findByIdAndUpdate(req.params.id, { availability: req.body.availability, emergencyVolunteer: req.body.emergencyVolunteer }, { new: true });
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Availability updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const updated = await volunteer_model_js_1.Volunteer.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Status updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VolunteersController = VolunteersController;
