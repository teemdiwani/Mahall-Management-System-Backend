"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const events_service_js_1 = require("./events.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class EventsController {
    static async list(req, res, next) {
        try {
            const events = await events_service_js_1.EventsService.listEvents(req.query);
            return apiResponse_js_1.ApiResponse.success(res, events);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const event = await events_service_js_1.EventsService.getEventById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, event);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const event = await events_service_js_1.EventsService.createEvent(req.body, req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, event, 201, 'Event created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const event = await events_service_js_1.EventsService.registerForEvent(req.params.id, req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, event, 200, 'Registered for event');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EventsController = EventsController;
