"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const event_model_js_1 = require("./event.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
class EventsService {
    static async listEvents(query) {
        const filter = {};
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toUpperCase();
        }
        if (query.category && query.category !== 'all') {
            filter.category = query.category.toUpperCase();
        }
        if (query.upcomingOnly) {
            filter.startDate = { $gte: new Date() };
        }
        const events = await event_model_js_1.Event.find(filter)
            .populate('createdBy', 'name email')
            .sort({ startDate: 1 });
        return events;
    }
    static async getEventById(id) {
        const event = await event_model_js_1.Event.findById(id).populate('registeredAttendees', 'name email');
        if (!event)
            throw apiError_js_1.ApiError.notFound('Event not found');
        return event;
    }
    static async createEvent(data, createdByUserId) {
        const event = await event_model_js_1.Event.create({
            ...data,
            createdBy: createdByUserId,
            status: 'UPCOMING',
        });
        // Notify all active users
        notifications_service_js_1.NotificationsService.broadcastNotification({
            type: 'EVENT',
            title: `🗓️ New Event: ${event.title}`,
            message: `${event.description ? event.description.slice(0, 130) : 'Al-Noor Mahall community event'} (Date: ${event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Upcoming'})`,
            link: '/app/events',
        }).catch(() => { });
        return event;
    }
    static async registerForEvent(eventId, userId) {
        const event = await event_model_js_1.Event.findById(eventId);
        if (!event)
            throw apiError_js_1.ApiError.notFound('Event not found');
        if (event.capacity && event.registeredAttendees.length >= event.capacity) {
            throw apiError_js_1.ApiError.badRequest('This event is at full capacity');
        }
        const alreadyRegistered = event.registeredAttendees.some((id) => id.toString() === userId);
        if (alreadyRegistered) {
            throw apiError_js_1.ApiError.badRequest('You are already registered for this event');
        }
        event.registeredAttendees.push(userId);
        await event.save();
        return event;
    }
}
exports.EventsService = EventsService;
