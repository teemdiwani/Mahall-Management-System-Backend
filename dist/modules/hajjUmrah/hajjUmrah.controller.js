"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HajjUmrahController = void 0;
const hajjUmrah_service_js_1 = require("./hajjUmrah.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class HajjUmrahController {
    static async listPosts(req, res, next) {
        try {
            const posts = await hajjUmrah_service_js_1.HajjUmrahService.listPosts({
                status: req.query.status,
                type: req.query.type,
                search: req.query.search,
            });
            return apiResponse_js_1.ApiResponse.success(res, posts);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPostById(req, res, next) {
        try {
            const post = await hajjUmrah_service_js_1.HajjUmrahService.getPostById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, post);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPost(req, res, next) {
        try {
            const post = await hajjUmrah_service_js_1.HajjUmrahService.createPost(req.body, req.user?._id);
            return apiResponse_js_1.ApiResponse.success(res, post, 201, 'Hajj/Umrah registration post created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePost(req, res, next) {
        try {
            const post = await hajjUmrah_service_js_1.HajjUmrahService.updatePost(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, post, 200, 'Package post updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePost(req, res, next) {
        try {
            await hajjUmrah_service_js_1.HajjUmrahService.deletePost(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Package post deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const result = await hajjUmrah_service_js_1.HajjUmrahService.register(req.params.id, req.body, req.user?._id);
            return apiResponse_js_1.ApiResponse.success(res, result, 201, 'Registration successful! Confirmation email has been sent. Please contact the travels partner to grab your seats.');
        }
        catch (error) {
            next(error);
        }
    }
    static async listRegistrations(req, res, next) {
        try {
            const registrations = await hajjUmrah_service_js_1.HajjUmrahService.listRegistrations({
                postId: req.query.postId,
                status: req.query.status,
                search: req.query.search,
            });
            return apiResponse_js_1.ApiResponse.success(res, registrations);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyRegistrations(req, res, next) {
        try {
            const registrations = await hajjUmrah_service_js_1.HajjUmrahService.getMyRegistrations(req.user?._id, req.user?.email);
            return apiResponse_js_1.ApiResponse.success(res, registrations);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRegistrationStatus(req, res, next) {
        try {
            const registration = await hajjUmrah_service_js_1.HajjUmrahService.updateRegistrationStatus(req.params.id, req.body.status);
            return apiResponse_js_1.ApiResponse.success(res, registration, 200, 'Registration status updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async resendEmail(req, res, next) {
        try {
            const registration = await hajjUmrah_service_js_1.HajjUmrahService.resendRegistrationEmail(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, registration, 200, 'Confirmation email resent successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(_req, res, next) {
        try {
            const stats = await hajjUmrah_service_js_1.HajjUmrahService.getStats();
            return apiResponse_js_1.ApiResponse.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.HajjUmrahController = HajjUmrahController;
