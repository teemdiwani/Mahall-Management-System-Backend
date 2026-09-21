"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIVILEGED_ROLES = exports.ALL_ROLES = exports.ROLES = void 0;
exports.ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    SECRETARY: 'SECRETARY',
    TREASURER: 'TREASURER',
    IMAM: 'IMAM',
    MADRASA_ADMIN: 'MADRASA_ADMIN',
    WELFARE_OFFICER: 'WELFARE_OFFICER',
    COMMITTEE_MEMBER: 'COMMITTEE_MEMBER',
    FAMILY_HEAD: 'FAMILY_HEAD',
    VOLUNTEER: 'VOLUNTEER',
    MEMBER: 'MEMBER',
};
exports.ALL_ROLES = Object.values(exports.ROLES);
exports.PRIVILEGED_ROLES = [
    exports.ROLES.SUPER_ADMIN,
    exports.ROLES.SECRETARY,
    exports.ROLES.TREASURER,
    exports.ROLES.IMAM,
    exports.ROLES.MADRASA_ADMIN,
    exports.ROLES.WELFARE_OFFICER,
    exports.ROLES.COMMITTEE_MEMBER,
];
