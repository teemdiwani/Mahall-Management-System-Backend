import { Event, type IEvent } from './event.model.js';
import { ApiError } from '../../utils/apiError.js';

export class EventsService {
  static async listEvents(query: { status?: string; category?: string; upcomingOnly?: boolean }) {
    const filter: Record<string, any> = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status.toUpperCase();
    }
    if (query.category && query.category !== 'all') {
      filter.category = query.category.toUpperCase();
    }
    if (query.upcomingOnly) {
      filter.startDate = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    return events;
  }

  static async getEventById(id: string) {
    const event = await Event.findById(id).populate('registeredAttendees', 'name email');
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  }

  static async createEvent(data: Partial<IEvent>, createdByUserId: string) {
    const event = await Event.create({
      ...data,
      createdBy: createdByUserId,
      status: 'UPCOMING',
    });
    return event;
  }

  static async registerForEvent(eventId: string, userId: string) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Event not found');

    if (event.capacity && event.registeredAttendees.length >= event.capacity) {
      throw ApiError.badRequest('This event is at full capacity');
    }

    const alreadyRegistered = event.registeredAttendees.some(
      (id) => id.toString() === userId
    );
    if (alreadyRegistered) {
      throw ApiError.badRequest('You are already registered for this event');
    }

    event.registeredAttendees.push(userId as any);
    await event.save();

    return event;
  }
}
