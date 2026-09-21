import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../modules/auth/user.model';
import { Member } from '../modules/members/member.model';
import { Family } from '../modules/families/family.model';
import { FamilyMember } from '../modules/families/familyMember.model';
import { FamilyChangeRequest } from '../modules/families/familyChangeRequest.model';
import { FamiliesService } from '../modules/families/families.service';
import { FamilyChangeRequestService } from '../modules/families/familyChangeRequest.service';

async function runFamilyTests() {
  console.log('🧪 Starting Family & Member Management Integration Tests...\n');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const testSuffix = Date.now().toString().slice(-5);

  // 1. Create a User + Member to act as Family Head
  const headUser = await User.create({
    name: `Head Test ${testSuffix}`,
    email: `head${testSuffix}@test.com`,
    passwordHash: 'dummyhash',
    role: 'MEMBER',
    isActive: true,
  });

  const headMember = await Member.create({
    name: `Head Test ${testSuffix}`,
    memberCode: `MHL-MBR-T${testSuffix}`,
    gender: 'MALE',
    dateOfBirth: new Date('1982-05-14'),
    email: headUser.email,
    phone: `+91 99999${testSuffix}`,
    membershipStatus: 'ACTIVE',
    userId: headUser._id,
  });

  console.log('1. Created test User & Member for Head');

  // 2. Create Family with headMemberId
  const { family: familyDoc } = await FamiliesService.createFamily(
    {
      name: `Test Family ${testSuffix}`,
      area: 'North Ward',
      address: 'Test House 101',
      phone: `+91 99999${testSuffix}`,
      headMemberId: headMember._id.toString(),
    },
    headUser._id.toString()
  );

  const headId = (familyDoc.familyHead._id || familyDoc.familyHead).toString();
  if (!familyDoc.familyHead || headId !== headMember._id.toString()) {
    throw new Error('Family head was not set correctly');
  }

  // 3. Add a Member directly to Family
  const addedMemberRel = await FamiliesService.addMemberToFamily(
    familyDoc._id.toString(),
    {
      name: `Daughter Test ${testSuffix}`,
      gender: 'FEMALE',
      relationship: 'DAUGHTER',
      relatedToMemberId: headMember._id.toString(),
    },
    headUser._id.toString()
  );

  console.log(`3. Added Member to Family with relationship DAUGHTER: ${addedMemberRel._id}`);

  // 4. Retrieve Family by ID with populated relational members
  const retrieved = await FamiliesService.getFamilyById(familyDoc._id.toString());
  console.log(`4. Retrieved Family. Total household members: ${retrieved.members.length}`);
  if (retrieved.members.length !== 2) {
    throw new Error(`Expected 2 members, found ${retrieved.members.length}`);
  }

  // 5. Test getMyFamily for the member
  const myFam = await FamiliesService.getMyFamily(headMember._id.toString());
  console.log(`5. getMyFamily result: isFamilyHead=${myFam.isFamilyHead}, family=${myFam.family.name}`);
  if (!myFam.isFamilyHead) {
    throw new Error('Expected isFamilyHead to be true for this head member');
  }

  // 6. Submit a FamilyChangeRequest by Family Head
  const request = await FamilyChangeRequestService.createRequest(
    headUser._id.toString(),
    'MEMBER',
    {
      familyId: familyDoc._id.toString(),
      requestType: 'ADD_MEMBER',
      proposedData: {
        name: `Son Test ${testSuffix}`,
        gender: 'MALE',
        relationship: 'SON',
        occupation: 'Student',
      },
      reason: 'Newborn child census registration',
    }
  );

  console.log(`6. Submitted FamilyChangeRequest: ${request.requestCode} (Status: ${request.status})`);

  // 7. Approve FamilyChangeRequest by Admin
  const approvedReq = await FamilyChangeRequestService.approveRequest(
    request._id.toString(),
    headUser._id.toString(),
    'Approved by Secretary committee'
  );

  console.log(`7. Approved Request. New Status: ${approvedReq.status}`);
  if (approvedReq.status !== 'APPROVED') {
    throw new Error('Request was not marked APPROVED');
  }

  // Verify that the new member was actually inserted and linked in MongoDB!
  const updatedFamilyData = await FamiliesService.getFamilyById(familyDoc._id.toString());
  console.log(`8. Household members after approval: ${updatedFamilyData.members.length}`);
  if (updatedFamilyData.members.length !== 3) {
    throw new Error(`Expected 3 members after approval, found ${updatedFamilyData.members.length}`);
  }

  // 8. Test soft archiving family
  const archived = await FamiliesService.archiveFamily(familyDoc._id.toString(), true, headUser._id.toString());
  console.log(`9. Family archived successfully. Status: ${archived.family.status}`);
  if (archived.family.status !== 'ARCHIVED') {
    throw new Error('Family status was not ARCHIVED');
  }

  // Clean up test documents
  await FamilyChangeRequest.deleteMany({ familyId: familyDoc._id });
  await FamilyMember.deleteMany({ familyId: familyDoc._id });
  await Member.deleteMany({ _id: { $in: updatedFamilyData.members.map((m: any) => m.member._id) } });
  await Family.findByIdAndDelete(familyDoc._id);
  await User.findByIdAndDelete(headUser._id);
  console.log('10. Cleaned up test artifacts');

  console.log('\n============================================================');
  console.log('🎉 ALL FAMILY & MEMBER MANAGEMENT INTEGRATION TESTS PASSED!');
  console.log('============================================================\n');

  await mongoose.disconnect();
}

runFamilyTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
