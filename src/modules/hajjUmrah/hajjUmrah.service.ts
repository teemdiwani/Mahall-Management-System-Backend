import mongoose from 'mongoose';
import { HajjUmrahPost, type IHajjUmrahPost } from './hajjUmrahPost.model.js';
import { HajjUmrahRegistration, type IHajjUmrahRegistration } from './hajjUmrahRegistration.model.js';
import { Notification } from '../notifications/notification.model.js';
import { mailService } from '../../utils/mailService.js';
import { ApiError } from '../../utils/apiError.js';
import { logger } from '../../utils/logger.js';

export interface CreatePostDTO {
  title: string;
  type: 'HAJJ' | 'UMRAH';
  travelsName: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  totalSlots: number;
  estimatedPrice?: string;
  departureDate?: string | Date;
  returnDate?: string | Date;
  registrationDeadline?: string | Date;
  description: string;
  features?: string[];
}

export interface RegisterDTO {
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  seats?: number;
  passportNumber?: string;
  notes?: string;
  familyId?: string;
}

export class HajjUmrahService {
  /**
   * List all Hajj/Umrah posts
   */
  static async listPosts(query: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<IHajjUmrahPost[]> {
    const filter: Record<string, any> = {};

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

    const totalExisting = await HajjUmrahPost.countDocuments();
    if (totalExisting === 0) {
      await HajjUmrahPost.create([
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
          description:
            'Experience the blessed days of Ramadan in Makkah and Madinah with 5-star accommodation within walking distance from Haram Sharif.',
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
          description:
            'Complete Hajj package with Category-A air-conditioned tents in Mina and Arafat, guided by senior religious scholars.',
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

    const posts = await HajjUmrahPost.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return posts;
  }

  /**
   * Get single post by ID
   */
  static async getPostById(id: string): Promise<IHajjUmrahPost> {
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid post ID');
    }

    const post = await HajjUmrahPost.findById(id).populate('createdBy', 'name email');
    if (!post) {
      throw ApiError.notFound('Hajj/Umrah package post not found');
    }

    return post;
  }

  /**
   * Secretary / Admin: Create a new Hajj/Umrah travel post
   */
  static async createPost(
    data: CreatePostDTO,
    userId?: mongoose.Types.ObjectId | string
  ): Promise<IHajjUmrahPost> {
    const totalSlots = Number(data.totalSlots) || 20;

    const post = await HajjUmrahPost.create({
      ...data,
      totalSlots,
      bookedSlots: 0,
      status: 'OPEN',
      createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    });

    logger.info(
      { postId: post._id, title: post.title, totalSlots },
      '🕋 New Hajj/Umrah registration post created'
    );

    return post;
  }

  /**
   * Secretary / Admin: Update an existing post
   */
  static async updatePost(
    id: string,
    data: Partial<CreatePostDTO> & { status?: 'OPEN' | 'FULL' | 'CLOSED' }
  ): Promise<IHajjUmrahPost> {
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid post ID');
    }

    const post = await HajjUmrahPost.findById(id);
    if (!post) {
      throw ApiError.notFound('Hajj/Umrah package post not found');
    }

    // If totalSlots is modified, adjust status if necessary
    if (data.totalSlots !== undefined) {
      const newTotal = Number(data.totalSlots);
      post.totalSlots = newTotal;
      if (post.bookedSlots >= newTotal) {
        post.status = 'FULL';
      } else if (post.status === 'FULL' && post.bookedSlots < newTotal) {
        post.status = 'OPEN';
      }
    }

    if (data.status) {
      post.status = data.status;
    }

    if (data.title) post.title = data.title;
    if (data.type) post.type = data.type;
    if (data.travelsName) post.travelsName = data.travelsName;
    if (data.contactPerson !== undefined) post.contactPerson = data.contactPerson;
    if (data.contactPhone) post.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) post.contactEmail = data.contactEmail;
    if (data.estimatedPrice !== undefined) post.estimatedPrice = data.estimatedPrice;
    if (data.departureDate !== undefined) post.departureDate = data.departureDate ? new Date(data.departureDate) : undefined;
    if (data.returnDate !== undefined) post.returnDate = data.returnDate ? new Date(data.returnDate) : undefined;
    if (data.registrationDeadline !== undefined) post.registrationDeadline = data.registrationDeadline ? new Date(data.registrationDeadline) : undefined;
    if (data.description) post.description = data.description;
    if (data.features) post.features = data.features;

    await post.save();
    return post;
  }

  /**
   * Secretary / Admin: Delete a post
   */
  static async deletePost(id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid post ID');
    }

    const post = await HajjUmrahPost.findByIdAndDelete(id);
    if (!post) {
      throw ApiError.notFound('Hajj/Umrah package post not found');
    }

    // Also remove associated registrations
    await HajjUmrahRegistration.deleteMany({ postId: id });
  }

  /**
   * Member / Public: Register for a Hajj/Umrah package
   * Deducts slots and sends Nodemailer confirmation email with travels contact info
   */
  static async register(
    postId: string,
    data: RegisterDTO,
    userId?: mongoose.Types.ObjectId | string
  ): Promise<{
    registration: IHajjUmrahRegistration;
    post: IHajjUmrahPost;
    travelsContact: {
      travelsName: string;
      contactPerson?: string;
      contactPhone: string;
      contactEmail?: string;
    };
  }> {
    if (!mongoose.isValidObjectId(postId)) {
      throw ApiError.badRequest('Invalid package ID');
    }

    const post = await HajjUmrahPost.findById(postId);
    if (!post) {
      throw ApiError.notFound('Package post not found');
    }

    if (post.status === 'CLOSED') {
      throw ApiError.badRequest('Registration for this package is currently closed');
    }

    const requestedSeats = Math.max(1, Number(data.seats) || 1);
    const availableSlots = Math.max(0, post.totalSlots - post.bookedSlots);

    if (availableSlots <= 0 || post.status === 'FULL') {
      throw ApiError.badRequest('Sorry, all slots for this package have already been filled');
    }

    if (requestedSeats > availableSlots) {
      throw ApiError.badRequest(
        `Only ${availableSlots} seat${availableSlots > 1 ? 's are' : ' is'} currently available for this package.`
      );
    }

    // Generate unique reference ID
    const refCode = `${post.type}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create registration record
    const registration = new HajjUmrahRegistration({
      postId: post._id,
      applicantName: data.applicantName,
      applicantPhone: data.applicantPhone,
      applicantEmail: data.applicantEmail,
      seats: requestedSeats,
      passportNumber: data.passportNumber,
      notes: data.notes,
      familyId: data.familyId && mongoose.isValidObjectId(data.familyId) ? new mongoose.Types.ObjectId(data.familyId) : undefined,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
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
      const emailResult = await mailService.sendHajjRegistrationConfirmationEmail({
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
    } catch (err) {
      logger.error({ err }, 'Failed to dispatch Nodemailer registration email');
      // Registration still succeeds; secretary can resend later
    }

    // Also trigger in-app notification if user is authenticated
    if (userId) {
      try {
        await Notification.create({
          recipient: new mongoose.Types.ObjectId(userId),
          type: 'EVENT',
          title: `Hajj/Umrah Registration Confirmed [${post.title}]`,
          message: `Your registration for ${post.title} (${requestedSeats} seat${requestedSeats > 1 ? 's' : ''}) is confirmed. Please contact ${post.travelsName} at ${post.contactPhone} to finalize your seats.`,
          link: '/app/hajj-umrah',
        });
      } catch (notifErr) {
        logger.error({ notifErr }, 'Failed to create in-app notification');
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
  static async listRegistrations(query: {
    postId?: string;
    status?: string;
    search?: string;
  }): Promise<IHajjUmrahRegistration[]> {
    const filter: Record<string, any> = {};

    if (query.postId && mongoose.isValidObjectId(query.postId)) {
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

    return HajjUmrahRegistration.find(filter)
      .sort({ createdAt: -1 })
      .populate('postId', 'title type travelsName contactPhone totalSlots bookedSlots status');
  }

  /**
   * Member: Get own registrations
   */
  static async getMyRegistrations(
    userId?: mongoose.Types.ObjectId | string,
    email?: string
  ): Promise<IHajjUmrahRegistration[]> {
    const conditions: Record<string, any>[] = [];

    if (userId) {
      conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
    }
    if (email) {
      conditions.push({ applicantEmail: email.toLowerCase() });
    }

    if (conditions.length === 0) {
      return [];
    }

    return HajjUmrahRegistration.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .populate('postId');
  }

  /**
   * Secretary / Admin: Update registration status (CONFIRMED or CANCELLED)
   */
  static async updateRegistrationStatus(
    id: string,
    status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED'
  ): Promise<IHajjUmrahRegistration> {
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid registration ID');
    }

    const reg = await HajjUmrahRegistration.findById(id);
    if (!reg) {
      throw ApiError.notFound('Registration not found');
    }

    const oldStatus = reg.status;
    if (oldStatus === status) {
      return reg;
    }

    const post = await HajjUmrahPost.findById(reg.postId);

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
        throw ApiError.badRequest(`Cannot restore registration: Only ${remaining} slots available`);
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
  static async resendRegistrationEmail(id: string): Promise<IHajjUmrahRegistration> {
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid registration ID');
    }

    const reg = await HajjUmrahRegistration.findById(id);
    if (!reg) {
      throw ApiError.notFound('Registration not found');
    }

    const post = await HajjUmrahPost.findById(reg.postId);
    if (!post) {
      throw ApiError.notFound('Associated package post not found');
    }

    const result = await mailService.sendHajjRegistrationConfirmationEmail({
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
      throw ApiError.internal('Failed to resend confirmation email');
    }

    reg.emailSent = true;
    reg.emailSentAt = new Date();
    await reg.save();

    return reg;
  }

  /**
   * Aggregate statistics for dashboard summary
   */
  static async getStats(): Promise<{
    totalPosts: number;
    openPosts: number;
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    totalRegistrations: number;
  }> {
    const posts = await HajjUmrahPost.find({});
    const totalRegistrations = await HajjUmrahRegistration.countDocuments({
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
