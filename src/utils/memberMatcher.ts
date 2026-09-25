import mongoose from 'mongoose';
import { User, type IUser } from '../modules/auth/user.model.js';
import { Member, type IMember } from '../modules/members/member.model.js';
import { Family, type IFamily } from '../modules/families/family.model.js';
import { FamilyMember } from '../modules/families/familyMember.model.js';
import { FamiliesService } from '../modules/families/families.service.js';

export function getPhoneSearchVariants(rawPhone?: string): {
  variants: string[];
  regex: RegExp | null;
  tenDigits: string | null;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return { variants: [], regex: null, tenDigits: null };
  }

  const trimmed = rawPhone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const variants = new Set<string>();

  variants.add(trimmed);
  if (digitsOnly) {
    variants.add(digitsOnly);
  }

  if (digitsOnly.length >= 10) {
    const ten = digitsOnly.slice(-10);
    variants.add(ten);
    variants.add(`+91${ten}`);
    variants.add(`+91 ${ten}`);
    variants.add(`0${ten}`);
    variants.add(`91${ten}`);
    variants.add(`${ten.slice(0, 5)} ${ten.slice(5)}`);
    variants.add(`${ten.slice(0, 5)}-${ten.slice(5)}`);

    // Flexible regex allowing spaces, hyphens, and country code between any digits of the 10-digit number
    const spacedDigitsPattern = ten.split('').join('[\\s-]*');
    const regex = new RegExp(`(\\+?91|0)?[\\s-]*${spacedDigitsPattern}$`, 'i');

    return {
      variants: Array.from(variants),
      regex,
      tenDigits: ten,
    };
  }

  return {
    variants: Array.from(variants),
    regex: digitsOnly.length >= 4 ? new RegExp(`${digitsOnly}$`, 'i') : null,
    tenDigits: null,
  };
}

export function buildPhoneOrCodeConditions(fieldNames: string[], rawInputs: (string | undefined | null)[]): any[] {
  const conditions: any[] = [];

  for (const raw of rawInputs) {
    if (!raw || !raw.trim()) continue;
    const trimmed = raw.trim();

    // Check as code (e.g. memberCode, familyCode)
    if (trimmed.length >= 3) {
      for (const field of fieldNames) {
        conditions.push({ [field]: trimmed });
        conditions.push({ [field]: trimmed.toUpperCase() });
      }
    }

    // Check as phone
    const { variants, regex } = getPhoneSearchVariants(trimmed);
    for (const field of fieldNames) {
      if (variants.length > 0) {
        conditions.push({ [field]: { $in: variants } });
      }
      if (regex) {
        conditions.push({ [field]: { $regex: regex } });
      }
    }
  }

  return conditions;
}

export interface MatchFamilyResult {
  family: any | null;
  familyHead: any | null;
  familyMembers: any[];
  familyMembersCount: number;
  currentMember: any | null;
}

export async function findFamilyAndMemberForUser(options: {
  userId?: string;
  email?: string;
  phone?: string;
  searchNumber?: string;
}): Promise<MatchFamilyResult> {
  const { userId, email, phone, searchNumber } = options;

  let currentMember: any = null;
  let familyId: mongoose.Types.ObjectId | string | null = null;

  // 1. Direct match by userId if valid
  if (userId && mongoose.isValidObjectId(userId)) {
    currentMember = await Member.findOne({ userId });
    if (currentMember?.familyId) {
      familyId = currentMember.familyId;
    }
  }

  // 2. If no familyId yet, search Member collection for ANY member match
  // Matches if ANY member's phone number, email, or memberCode matches:
  // - user's phone
  // - user's email
  // - searchNumber (entered phone/code)
  if (!familyId) {
    const rawPhonesAndCodes = [phone, searchNumber].filter(Boolean) as string[];
    const memberOrConditions: any[] = [];

    if (userId && mongoose.isValidObjectId(userId)) {
      memberOrConditions.push({ userId });
    }
    if (email && email.trim()) {
      memberOrConditions.push({ email: email.trim().toLowerCase() });
    }

    // Add phone & memberCode conditions for Member collection
    if (rawPhonesAndCodes.length > 0) {
      memberOrConditions.push(...buildPhoneOrCodeConditions(['phone'], rawPhonesAndCodes));
      for (const input of rawPhonesAndCodes) {
        const trimmed = input.trim();
        if (trimmed.length >= 3) {
          memberOrConditions.push({ memberCode: trimmed.toUpperCase() });
        }
      }
    }

    if (memberOrConditions.length > 0) {
      // Find members matching ANY of these conditions
      const matchingMembers = await Member.find({ $or: memberOrConditions });

      // Look for a member that already has a familyId
      const memberWithFamily = matchingMembers.find((m) => m.familyId != null);
      if (memberWithFamily && memberWithFamily.familyId) {
        familyId = memberWithFamily.familyId;
        if (!currentMember) {
          currentMember = memberWithFamily;
        }
      }

      // If matching members don't have familyId on Member doc, check FamilyMember collection
      if (!familyId && matchingMembers.length > 0) {
        const memberIds = matchingMembers.map((m) => m._id);
        const fm = await FamilyMember.findOne({ memberId: { $in: memberIds }, status: 'ACTIVE' });
        if (fm?.familyId) {
          familyId = fm.familyId;
          if (!currentMember) {
            currentMember = matchingMembers.find((m) => m._id.toString() === fm.memberId.toString());
          }
        }
      }

      // If we found a member but no currentMember assigned yet
      if (!currentMember && matchingMembers.length > 0) {
        currentMember = matchingMembers[0];
      }
    }
  }

  // 3. If still no familyId, check Family collection directly by phone, email, or familyCode
  if (!familyId) {
    const rawPhonesAndCodes = [phone, searchNumber].filter(Boolean) as string[];
    const familyOrConditions: any[] = [];

    if (email && email.trim()) {
      familyOrConditions.push({ email: email.trim().toLowerCase() });
    }

    if (rawPhonesAndCodes.length > 0) {
      familyOrConditions.push(...buildPhoneOrCodeConditions(['phone'], rawPhonesAndCodes));
      for (const input of rawPhonesAndCodes) {
        const trimmed = input.trim();
        if (trimmed.length >= 3) {
          familyOrConditions.push({ familyCode: trimmed.toUpperCase() });
        }
      }
    }

    if (familyOrConditions.length > 0) {
      const matchedFamily = await Family.findOne({ $or: familyOrConditions });
      if (matchedFamily) {
        familyId = matchedFamily._id;
      }
    }
  }

  // 4. If familyId is found, fetch full family details and ALL members
  if (familyId) {
    try {
      const details = await FamiliesService.getFamilyById(familyId.toString());

      // If currentMember is still null or not linked to user, see if any member matches
      if (!currentMember && details.members.length > 0) {
        // Try to find the member that matched user's phone or email
        const targetMember = details.members.find((m: any) => {
          if (email && m.email && m.email.toLowerCase() === email.toLowerCase()) return true;
          if (phone) {
            const { variants } = getPhoneSearchVariants(phone);
            if (m.phone && variants.includes(m.phone)) return true;
          }
          if (searchNumber) {
            const { variants } = getPhoneSearchVariants(searchNumber);
            if (m.phone && variants.includes(m.phone)) return true;
            if (m.memberCode && m.memberCode.toUpperCase() === searchNumber.toUpperCase()) return true;
          }
          return false;
        });

        currentMember = targetMember ? targetMember.member : details.members[0].member;
      }

      // Auto-link Member.userId to User if not already linked
      if (currentMember && !currentMember.userId && userId && mongoose.isValidObjectId(userId)) {
        await Member.findByIdAndUpdate(currentMember._id, { userId });
        currentMember.userId = userId as any;
      }

      // If user had no phone, save the phone number from member or search input
      if (userId && mongoose.isValidObjectId(userId)) {
        const phoneToSave =
          searchNumber && searchNumber.replace(/\D/g, '').length >= 10
            ? searchNumber.trim()
            : currentMember?.phone || (details.family as any)?.phone;
        if (phoneToSave) {
          const userDoc = await User.findById(userId);
          if (userDoc && !userDoc.phone) {
            userDoc.phone = phoneToSave;
            await userDoc.save();
          }
        }
      }

      return {
        family: details.family,
        familyHead: details.familyHead,
        familyMembers: details.members,
        familyMembersCount: details.memberCount,
        currentMember,
      };
    } catch {
      // If error fetching details, fall back to null
    }
  }

  return {
    family: null,
    familyHead: null,
    familyMembers: [],
    familyMembersCount: 0,
    currentMember,
  };
}
