"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = void 0;
const roles_js_1 = require("./roles.js");
exports.PERMISSIONS = {
    // Members
    MEMBERS_VIEW: 'members.view',
    MEMBERS_CREATE: 'members.create',
    MEMBERS_UPDATE: 'members.update',
    MEMBERS_DELETE: 'members.delete',
    // Families
    FAMILIES_VIEW: 'families.view',
    FAMILIES_CREATE: 'families.create',
    FAMILIES_UPDATE: 'families.update',
    FAMILIES_DELETE: 'families.delete',
    FAMILIES_MANAGE_MEMBERS: 'families.manage_members',
    FAMILIES_APPROVE_REQUESTS: 'families.approve_requests',
    // Finance & Payments
    FINANCE_VIEW: 'finance.view',
    FINANCE_CREATE_PAYMENT: 'finance.create_payment',
    FINANCE_VERIFY_PAYMENT: 'finance.verify_payment',
    FINANCE_CREATE_EXPENSE: 'finance.create_expense',
    FINANCE_VIEW_REPORTS: 'finance.view_reports',
    // Applications
    APPLICATIONS_VIEW: 'applications.view',
    APPLICATIONS_CREATE: 'applications.create',
    APPLICATIONS_REVIEW: 'applications.review',
    APPLICATIONS_APPROVE: 'applications.approve',
    APPLICATIONS_REJECT: 'applications.reject',
    APPLICATIONS_COMPLETE: 'applications.complete',
    // Welfare & Zakat
    WELFARE_VIEW: 'welfare.view',
    WELFARE_MANAGE: 'welfare.manage',
    WELFARE_DISTRIBUTE: 'welfare.distribute',
    // Users & Roles
    USERS_VIEW: 'users.view',
    USERS_UPDATE_ROLE: 'users.update_role',
    USERS_UPDATE_STATUS: 'users.update_status',
    // Events & Volunteers
    EVENTS_VIEW: 'events.view',
    EVENTS_MANAGE: 'events.manage',
    VOLUNTEERS_MANAGE: 'volunteers.manage',
    // Madrasa
    MADRASA_MANAGE: 'madrasa.manage',
    MADRASA_ATTENDANCE: 'madrasa.attendance',
    MADRASA_GRADES: 'madrasa.grades',
    // Mosque & Services
    MOSQUE_MANAGE: 'mosque.manage',
    FUNERAL_MANAGE: 'funeral.manage',
    MARRIAGE_MANAGE: 'marriage.manage',
    // Assets & Committee
    ASSETS_MANAGE: 'assets.manage',
    COMMITTEE_MANAGE: 'committee.manage',
    // Announcements & Notifications
    ANNOUNCEMENTS_MANAGE: 'announcements.manage',
    // Hajj & Umrah
    HAJJ_UMRAH_VIEW: 'hajj_umrah.view',
    HAJJ_UMRAH_MANAGE: 'hajj_umrah.manage',
};
exports.ROLE_PERMISSIONS = {
    [roles_js_1.ROLES.SUPER_ADMIN]: Object.values(exports.PERMISSIONS),
    [roles_js_1.ROLES.SECRETARY]: [
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.MEMBERS_CREATE,
        exports.PERMISSIONS.MEMBERS_UPDATE,
        exports.PERMISSIONS.FAMILIES_VIEW,
        exports.PERMISSIONS.FAMILIES_CREATE,
        exports.PERMISSIONS.FAMILIES_UPDATE,
        exports.PERMISSIONS.FAMILIES_DELETE,
        exports.PERMISSIONS.FAMILIES_MANAGE_MEMBERS,
        exports.PERMISSIONS.FAMILIES_APPROVE_REQUESTS,
        exports.PERMISSIONS.APPLICATIONS_VIEW,
        exports.PERMISSIONS.APPLICATIONS_REVIEW,
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.EVENTS_MANAGE,
        exports.PERMISSIONS.VOLUNTEERS_MANAGE,
        exports.PERMISSIONS.COMMITTEE_MANAGE,
        exports.PERMISSIONS.ANNOUNCEMENTS_MANAGE,
        exports.PERMISSIONS.FUNERAL_MANAGE,
        exports.PERMISSIONS.MARRIAGE_MANAGE,
        exports.PERMISSIONS.USERS_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_MANAGE,
        exports.PERMISSIONS.MADRASA_MANAGE,
        exports.PERMISSIONS.MADRASA_ATTENDANCE,
        exports.PERMISSIONS.MADRASA_GRADES,
    ],
    [roles_js_1.ROLES.TREASURER]: [
        exports.PERMISSIONS.FINANCE_VIEW,
        exports.PERMISSIONS.FINANCE_CREATE_PAYMENT,
        exports.PERMISSIONS.FINANCE_VERIFY_PAYMENT,
        exports.PERMISSIONS.FINANCE_CREATE_EXPENSE,
        exports.PERMISSIONS.FINANCE_VIEW_REPORTS,
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.FAMILIES_VIEW,
        exports.PERMISSIONS.APPLICATIONS_VIEW,
        exports.PERMISSIONS.ASSETS_MANAGE,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
    [roles_js_1.ROLES.IMAM]: [
        exports.PERMISSIONS.MOSQUE_MANAGE,
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.ANNOUNCEMENTS_MANAGE,
        exports.PERMISSIONS.FUNERAL_MANAGE,
        exports.PERMISSIONS.MARRIAGE_MANAGE,
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
    [roles_js_1.ROLES.MADRASA_ADMIN]: [
        exports.PERMISSIONS.MADRASA_MANAGE,
        exports.PERMISSIONS.MADRASA_ATTENDANCE,
        exports.PERMISSIONS.MADRASA_GRADES,
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.FAMILIES_VIEW,
    ],
    [roles_js_1.ROLES.WELFARE_OFFICER]: [
        exports.PERMISSIONS.WELFARE_VIEW,
        exports.PERMISSIONS.WELFARE_MANAGE,
        exports.PERMISSIONS.WELFARE_DISTRIBUTE,
        exports.PERMISSIONS.APPLICATIONS_VIEW,
        exports.PERMISSIONS.APPLICATIONS_REVIEW,
        exports.PERMISSIONS.APPLICATIONS_APPROVE,
        exports.PERMISSIONS.APPLICATIONS_REJECT,
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.FAMILIES_VIEW,
    ],
    [roles_js_1.ROLES.COMMITTEE_MEMBER]: [
        exports.PERMISSIONS.COMMITTEE_MANAGE,
        exports.PERMISSIONS.MEMBERS_VIEW,
        exports.PERMISSIONS.FAMILIES_VIEW,
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.FINANCE_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
    [roles_js_1.ROLES.FAMILY_HEAD]: [
        exports.PERMISSIONS.APPLICATIONS_CREATE,
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
    [roles_js_1.ROLES.VOLUNTEER]: [
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
    [roles_js_1.ROLES.MEMBER]: [
        exports.PERMISSIONS.APPLICATIONS_CREATE,
        exports.PERMISSIONS.EVENTS_VIEW,
        exports.PERMISSIONS.HAJJ_UMRAH_VIEW,
    ],
};
