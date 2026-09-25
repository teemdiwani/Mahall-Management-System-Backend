"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HajjUmrahService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const hajjUmrahPost_model_js_1 = require("./hajjUmrahPost.model.js");
const hajjUmrahRegistration_model_js_1 = require("./hajjUmrahRegistration.model.js");
const notification_model_js_1 = require("../notifications/notification.model.js");
const mailService_js_1 = require("../../utils/mailService.js");
const apiError_js_1 = require("../../utils/apiError.js");
const logger_js_1 = require("../../utils/logger.js");
class HajjUmrahService {
    /**
     * List all Hajj/Umrah posts
     */
    static async listPosts(query) {
        const filter = {};
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status;
        }
        if (query.type && query.type !== 'ALL') {
            filter.type = query.type;
        }
        if (query.search) {
            const searchRegex = new RegExp(query.search, 'i');
            filter.$or = [
                { title: searchRegex },
                { travelsName: searchRegex },
                { description: searchRegex },
            ];
        }
        const totalExisting = await hajjUmrahPost_model_js_1.HajjUmrahPost.countDocuments();
        if (totalExisting === 0) {
            await hajjUmrahPost_model_js_1.HajjUmrahPost.create([
                {
                    title: 'Ramadan Umrah Executive Package 1447 AH',
                    type: 'UMRAH',
                    travelsName: 'Al-Haramain Global Travels Calicut',
                    contactPerson: 'Br. Faisal Manzil',
                    contactPhone: '+91 9847112233',
                    contactEmail: 'info@alharamaintravels.in',
                    totalSlots: 35,
                    bookedSlots: 12,
                    estimatedPrice: '₹1,25,000',
                    departureDate: new Date('2026-03-01'),
                    returnDate: new Date('2026-03-18'),
                    registrationDeadline: new Date('2026-02-15'),
                    description: 'Experience the blessed days of Ramadan in Makkah and Madinah with 5-star accommodation within walking distance from Haram Sharif.',
                    features: [
                        'Direct flights from Calicut International Airport',
                        'Clock Tower 5-star hotel in Makkah',
                        'Full board buffet meals (Sehri & Iftar)',
                        'Experienced scholars guided Ziyarat',
                        'Visa processing & Umrah kit provided',
                    ],
                    status: 'OPEN',
                },
                {
                    title: 'Official Mahall Hajj 2026 Delegated Group',
                    type: 'HAJJ',
                    travelsName: 'Malabar Central Hajj Group',
                    contactPerson: 'Haji Sulaiman Faizy',
                    contactPhone: '+91 9447009988',
                    contactEmail: 'hajjdesk@alnoormahall.org',
                    totalSlots: 25,
                    bookedSlots: 8,
                    estimatedPrice: '₹4,20,000',
                    departureDate: new Date('2026-05-15'),
                    returnDate: new Date('2026-06-25'),
                    registrationDeadline: new Date('2026-04-01'),
                    description: 'Complete Hajj package with Category-A air-conditioned tents in Mina and Arafat, guided by senior religious scholars.',
                    features: [
                        'Category-A Mina & Arafat tents near Jamarat',
                        'Direct Saudia / Air India charter flights',
                        'Dedicated doctors & volunteer support desk',
                        'Comprehensive Hajj training camp at Mahall',
                    ],
                    status: 'OPEN',
                },
            ]);
        }
        const posts = await hajjUmrahPost_model_js_1.HajjUmrahPost.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');
        return posts;
    }
    /**
     * Get single post by ID
     */
    static async getPostById(id) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw apiError_js_1.ApiError.badRequest('Invalid post ID');
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findById(id).populate('createdBy', 'name email');
        if (!post) {
            throw apiError_js_1.ApiError.notFound('Hajj/Umrah package post not found');
        }
        return post;
    }
    /**
     * Secretary / Admin: Create a new Hajj/Umrah travel post
     */
    static async createPost(data, userId) {
        const totalSlots = Number(data.totalSlots) || 20;
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.create({
            ...data,
            totalSlots,
            bookedSlots: 0,
            status: 'OPEN',
            createdBy: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
        });
        logger_js_1.logger.info({ postId: post._id, title: post.title, totalSlots }, '🕋 New Hajj/Umrah registration post created');
        return post;
    }
    /**
     * Secretary / Admin: Update an existing post
     */
    static async updatePost(id, data) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw apiError_js_1.ApiError.badRequest('Invalid post ID');
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findById(id);
        if (!post) {
            throw apiError_js_1.ApiError.notFound('Hajj/Umrah package post not found');
        }
        // If totalSlots is modified, adjust status if necessary
        if (data.totalSlots !== undefined) {
            const newTotal = Number(data.totalSlots);
            post.totalSlots = newTotal;
            if (post.bookedSlots >= newTotal) {
                post.status = 'FULL';
            }
            else if (post.status === 'FULL' && post.bookedSlots < newTotal) {
                post.status = 'OPEN';
            }
        }
        if (data.status) {
            post.status = data.status;
        }
        if (data.title)
            post.title = data.title;
        if (data.type)
            post.type = data.type;
        if (data.travelsName)
            post.travelsName = data.travelsName;
        if (data.contactPerson !== undefined)
            post.contactPerson = data.contactPerson;
        if (data.contactPhone)
            post.contactPhone = data.contactPhone;
        if (data.contactEmail !== undefined)
            post.contactEmail = data.contactEmail;
        if (data.estimatedPrice !== undefined)
            post.estimatedPrice = data.estimatedPrice;
        if (data.departureDate !== undefined)
            post.departureDate = data.departureDate ? new Date(data.departureDate) : undefined;
        if (data.returnDate !== undefined)
            post.returnDate = data.returnDate ? new Date(data.returnDate) : undefined;
        if (data.registrationDeadline !== undefined)
            post.registrationDeadline = data.registrationDeadline ? new Date(data.registrationDeadline) : undefined;
        if (data.description)
            post.description = data.description;
        if (data.features)
            post.features = data.features;
        await post.save();
        return post;
    }
    /**
     * Secretary / Admin: Delete a post
     */
    static async deletePost(id) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw apiError_js_1.ApiError.badRequest('Invalid post ID');
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findByIdAndDelete(id);
        if (!post) {
            throw apiError_js_1.ApiError.notFound('Hajj/Umrah package post not found');
        }
        // Also remove associated registrations
        await hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.deleteMany({ postId: id });
    }
    /**
     * Member / Public: Register for a Hajj/Umrah package
     * Deducts slots and sends Nodemailer confirmation email with travels contact info
     */
    static async register(postId, data, userId) {
        if (!mongoose_1.default.isValidObjectId(postId)) {
            throw apiError_js_1.ApiError.badRequest('Invalid package ID');
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findById(postId);
        if (!post) {
            throw apiError_js_1.ApiError.notFound('Package post not found');
        }
        if (post.status === 'CLOSED') {
            throw apiError_js_1.ApiError.badRequest('Registration for this package is currently closed');
        }
        const requestedSeats = Math.max(1, Number(data.seats) || 1);
        const availableSlots = Math.max(0, post.totalSlots - post.bookedSlots);
        if (availableSlots <= 0 || post.status === 'FULL') {
            throw apiError_js_1.ApiError.badRequest('Sorry, all slots for this package have already been filled');
        }
        if (requestedSeats > availableSlots) {
            throw apiError_js_1.ApiError.badRequest(`Only ${availableSlots} seat${availableSlots > 1 ? 's are' : ' is'} currently available for this package.`);
        }
        // Generate unique reference ID
        const refCode = `${post.type}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        // Create registration record
        const registration = new hajjUmrahRegistration_model_js_1.HajjUmrahRegistration({
            postId: post._id,
            applicantName: data.applicantName,
            applicantPhone: data.applicantPhone,
            applicantEmail: data.applicantEmail,
            seats: requestedSeats,
            passportNumber: data.passportNumber,
            notes: data.notes,
            familyId: data.familyId && mongoose_1.default.isValidObjectId(data.familyId) ? new mongoose_1.default.Types.ObjectId(data.familyId) : undefined,
            userId: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
            registrationRef: refCode,
            status: 'REGISTERED',
            travelsContactShared: true,
            emailSent: false,
        });
        // Update booked slots on the post atomically
        post.bookedSlots += requestedSeats;
        if (post.bookedSlots >= post.totalSlots) {
            post.status = 'FULL';
        }
        await post.save();
        await registration.save();
        // Send confirmation email via Nodemailer
        try {
            const emailResult = await mailService_js_1.mailService.sendHajjRegistrationConfirmationEmail({
                applicantName: registration.applicantName,
                applicantEmail: registration.applicantEmail,
                postTitle: post.title,
                type: post.type,
                travelsName: post.travelsName,
                contactPerson: post.contactPerson,
                contactPhone: post.contactPhone,
                contactEmail: post.contactEmail,
                seats: registration.seats,
                registrationRef: registration.registrationRef,
                departureDate: post.departureDate,
                estimatedPrice: post.estimatedPrice,
            });
            if (emailResult.success) {
                registration.emailSent = true;
                registration.emailSentAt = new Date();
                await registration.save();
            }
        }
        catch (err) {
            logger_js_1.logger.error({ err }, 'Failed to dispatch Nodemailer registration email');
            // Registration still succeeds; secretary can resend later
        }
        // Also trigger in-app notification if user is authenticated
        if (userId) {
            try {
                await notification_model_js_1.Notification.create({
                    recipient: new mongoose_1.default.Types.ObjectId(userId),
                    type: 'EVENT',
                    title: `Hajj/Umrah Registration Confirmed [${post.title}]`,
                    message: `Your registration for ${post.title} (${requestedSeats} seat${requestedSeats > 1 ? 's' : ''}) is confirmed. Please contact ${post.travelsName} at ${post.contactPhone} to finalize your seats.`,
                    link: '/app/hajj-umrah',
                });
            }
            catch (notifErr) {
                logger_js_1.logger.error({ notifErr }, 'Failed to create in-app notification');
            }
        }
        return {
            registration,
            post,
            travelsContact: {
                travelsName: post.travelsName,
                contactPerson: post.contactPerson,
                contactPhone: post.contactPhone,
                contactEmail: post.contactEmail,
            },
        };
    }
    /**
     * Secretary / Admin: List registrations (optionally filtered by postId)
     */
    static async listRegistrations(query) {
        const filter = {};
        if (query.postId && mongoose_1.default.isValidObjectId(query.postId)) {
            filter.postId = query.postId;
        }
        if (query.status && query.status !== 'ALL') {
            filter.status = query.status;
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            filter.$or = [
                { applicantName: regex },
                { applicantPhone: regex },
                { applicantEmail: regex },
                { registrationRef: regex },
            ];
        }
        return hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.find(filter)
            .sort({ createdAt: -1 })
            .populate('postId', 'title type travelsName contactPhone totalSlots bookedSlots status');
    }
    /**
     * Member: Get own registrations
     */
    static async getMyRegistrations(userId, email) {
        const conditions = [];
        if (userId) {
            conditions.push({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        }
        if (email) {
            conditions.push({ applicantEmail: email.toLowerCase() });
        }
        if (conditions.length === 0) {
            return [];
        }
        return hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.find({ $or: conditions })
            .sort({ createdAt: -1 })
            .populate('postId');
    }
    /**
     * Secretary / Admin: Update registration status (CONFIRMED or CANCELLED)
     */
    static async updateRegistrationStatus(id, status) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw apiError_js_1.ApiError.badRequest('Invalid registration ID');
        }
        const reg = await hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.findById(id);
        if (!reg) {
            throw apiError_js_1.ApiError.notFound('Registration not found');
        }
        const oldStatus = reg.status;
        if (oldStatus === status) {
            return reg;
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findById(reg.postId);
        // If cancelling an active registration, restore seats
        if (status === 'CANCELLED' && oldStatus !== 'CANCELLED' && post) {
            post.bookedSlots = Math.max(0, post.bookedSlots - reg.seats);
            if (post.status === 'FULL' && post.bookedSlots < post.totalSlots) {
                post.status = 'OPEN';
            }
            await post.save();
        }
        // If reactivating a cancelled registration, check slot availability
        else if (oldStatus === 'CANCELLED' && status !== 'CANCELLED' && post) {
            const remaining = post.totalSlots - post.bookedSlots;
            if (remaining < reg.seats) {
                throw apiError_js_1.ApiError.badRequest(`Cannot restore registration: Only ${remaining} slots available`);
            }
            post.bookedSlots += reg.seats;
            if (post.bookedSlots >= post.totalSlots) {
                post.status = 'FULL';
            }
            await post.save();
        }
        reg.status = status;
        await reg.save();
        return reg;
    }
    /**
     * Secretary / Admin: Resend confirmation email via Nodemailer
     */
    static async resendRegistrationEmail(id) {
        if (!mongoose_1.default.isValidObjectId(id)) {
            throw apiError_js_1.ApiError.badRequest('Invalid registration ID');
        }
        const reg = await hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.findById(id);
        if (!reg) {
            throw apiError_js_1.ApiError.notFound('Registration not found');
        }
        const post = await hajjUmrahPost_model_js_1.HajjUmrahPost.findById(reg.postId);
        if (!post) {
            throw apiError_js_1.ApiError.notFound('Associated package post not found');
        }
        const result = await mailService_js_1.mailService.sendHajjRegistrationConfirmationEmail({
            applicantName: reg.applicantName,
            applicantEmail: reg.applicantEmail,
            postTitle: post.title,
            type: post.type,
            travelsName: post.travelsName,
            contactPerson: post.contactPerson,
            contactPhone: post.contactPhone,
            contactEmail: post.contactEmail,
            seats: reg.seats,
            registrationRef: reg.registrationRef,
            departureDate: post.departureDate,
            estimatedPrice: post.estimatedPrice,
        });
        if (!result.success) {
            throw apiError_js_1.ApiError.internal('Failed to resend confirmation email');
        }
        reg.emailSent = true;
        reg.emailSentAt = new Date();
        await reg.save();
        return reg;
    }
    /**
     * Aggregate statistics for dashboard summary
     */
    static async getStats() {
        const posts = await hajjUmrahPost_model_js_1.HajjUmrahPost.find({});
        const totalRegistrations = await hajjUmrahRegistration_model_js_1.HajjUmrahRegistration.countDocuments({
            status: { $ne: 'CANCELLED' },
        });
        let totalSlots = 0;
        let bookedSlots = 0;
        let openPosts = 0;
        posts.forEach((p) => {
            totalSlots += p.totalSlots || 0;
            bookedSlots += p.bookedSlots || 0;
            if (p.status === 'OPEN') {
                openPosts += 1;
            }
        });
        return {
            totalPosts: posts.length,
            openPosts,
            totalSlots,
            bookedSlots,
            availableSlots: Math.max(0, totalSlots - bookedSlots),
            totalRegistrations,
        };
    }
}
exports.HajjUmrahService = HajjUmrahService;
