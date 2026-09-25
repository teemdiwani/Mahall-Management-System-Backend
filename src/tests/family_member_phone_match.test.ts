import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../modules/auth/user.model.js';
import { Member } from '../modules/members/member.model.js';
import { Family } from '../modules/families/family.model.js';
import { FamiliesService } from '../modules/families/families.service.js';
import { DashboardService } from '../modules/dashboard/dashboard.service.js';

async function runTest() {
  console.log('🧪 Starting Family Any Member Phone Match Integration Tests...\n');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const testSuffix = Date.now().toString().slice(-5);

  const headPhone = `98471${testSuffix}`;
  const spousePhone = `98472${testSuffix}`;
  const sonPhone = `98473${testSuffix}`;
  const daughterPhone = `98474${testSuffix}`;

  // 1. Create a Family with Head
  const { family } = await FamiliesService.createFamily({
    name: `The Ali Family ${testSuffix}`,
    area: 'North Ward',
    address: `House 404, Sector ${testSuffix}`,
    phone: `+91 ${headPhone}`,
    headName: `Ali Father ${testSuffix}`,
    headPhone: `+91 ${headPhone}`,
    headGender: 'MALE',
  });

  const familyId = family._id.toString();
  console.log(`✅ 1. Created Family "${family.name}" (ID: ${familyId}) with Head`);

  // 2. Add Spouse, Son, and Daughter to the family
  await FamiliesService.addMemberToFamily(familyId, {
    name: `Fathima Mother ${testSuffix}`,
    gender: 'FEMALE',
    relationship: 'SPOUSE',
    phone: `+91 ${spousePhone}`,
  });

  await FamiliesService.addMemberToFamily(familyId, {
    name: `Zaid Son ${testSuffix}`,
    gender: 'MALE',
    relationship: 'SON',
    phone: `0${sonPhone}`, // formatted with leading 0
  });

  await FamiliesService.addMemberToFamily(familyId, {
    name: `Amina Daughter ${testSuffix}`,
    gender: 'FEMALE',
    relationship: 'DAUGHTER',
    phone: daughterPhone, // standard 10 digits
  });

  console.log('✅ 2. Added Spouse, Son, and Daughter to the family');

  // Verify family has 4 members
  const familyDetails = await FamiliesService.getFamilyById(familyId);
  console.log(`✅ 3. Family has ${familyDetails.members.length} members`);
  if (familyDetails.members.length !== 4) {
    throw new Error(`Expected 4 members, got ${familyDetails.members.length}`);
  }

  // 4. Create User 1: Father (logged in with Head phone)
  const userHead = await User.create({
    name: `Ali Head ${testSuffix}`,
    email: `head_${testSuffix}@example.com`,
    phone: headPhone,
    role: 'MEMBER',
  });

  // 5. Create User 2: Mother (logged in with Spouse phone formatted as +91...)
  const userSpouse = await User.create({
    name: `Fathima ${testSuffix}`,
    email: `spouse_${testSuffix}@example.com`,
    phone: `+91 ${spousePhone}`,
    role: 'MEMBER',
  });

  // 6. Create User 3: Son (logged in with Son phone, e.g. 10 digits without leading 0)
  const userSon = await User.create({
    name: `Zaid ${testSuffix}`,
    email: `son_${testSuffix}@example.com`,
    phone: sonPhone,
    role: 'MEMBER',
  });

  // 7. Create User 4: Daughter (logged in with Daughter phone)
  const userDaughter = await User.create({
    name: `Amina ${testSuffix}`,
    email: `daughter_${testSuffix}@example.com`,
    phone: `+91-${daughterPhone}`,
    role: 'MEMBER',
  });

  console.log('✅ 4. Created 4 user accounts with different family member phone numbers');

  // TEST MEMBER DASHBOARD FOR USER 1 (Head)
  const dashHead = await DashboardService.getMemberDashboard(userHead._id.toString(), userHead.email, userHead.phone);
  console.log(`🔍 Head User Dash - Family: ${dashHead.family?.name}, Members Count: ${dashHead.familyMembers?.length}`);
  if (!dashHead.family || dashHead.family._id.toString() !== familyId) {
    throw new Error('Head user failed to match family');
  }
  if (!dashHead.familyMembers || dashHead.familyMembers.length !== 4) {
    throw new Error(`Expected 4 family members in dashboard, got ${dashHead.familyMembers?.length}`);
  }

  // TEST MEMBER DASHBOARD FOR USER 2 (Spouse - matching by Spouse phone)
  const dashSpouse = await DashboardService.getMemberDashboard(userSpouse._id.toString(), userSpouse.email, userSpouse.phone);
  console.log(`🔍 Spouse User Dash - Family: ${dashSpouse.family?.name}, Members Count: ${dashSpouse.familyMembers?.length}`);
  if (!dashSpouse.family || dashSpouse.family._id.toString() !== familyId) {
    throw new Error('Spouse user failed to match family by spouse phone');
  }
  if (!dashSpouse.familyMembers || dashSpouse.familyMembers.length !== 4) {
    throw new Error(`Expected 4 family members for spouse, got ${dashSpouse.familyMembers?.length}`);
  }

  // TEST MEMBER DASHBOARD FOR USER 3 (Son - matching by Son phone)
  const dashSon = await DashboardService.getMemberDashboard(userSon._id.toString(), userSon.email, userSon.phone);
  console.log(`🔍 Son User Dash - Family: ${dashSon.family?.name}, Members Count: ${dashSon.familyMembers?.length}`);
  if (!dashSon.family || dashSon.family._id.toString() !== familyId) {
    throw new Error('Son user failed to match family by son phone');
  }
  if (!dashSon.familyMembers || dashSon.familyMembers.length !== 4) {
    throw new Error(`Expected 4 family members for son, got ${dashSon.familyMembers?.length}`);
  }

  // TEST MEMBER DASHBOARD FOR USER 4 (Daughter - matching by Daughter phone)
  const dashDaughter = await DashboardService.getMemberDashboard(userDaughter._id.toString(), userDaughter.email, userDaughter.phone);
  console.log(`🔍 Daughter User Dash - Family: ${dashDaughter.family?.name}, Members Count: ${dashDaughter.familyMembers?.length}`);
  if (!dashDaughter.family || dashDaughter.family._id.toString() !== familyId) {
    throw new Error('Daughter user failed to match family by daughter phone');
  }
  if (!dashDaughter.familyMembers || dashDaughter.familyMembers.length !== 4) {
    throw new Error(`Expected 4 family members for daughter, got ${dashDaughter.familyMembers?.length}`);
  }

  // TEST GET MY FAMILY (/my-family) FOR SON
  const myFamSon = await FamiliesService.getMyFamily(userSon._id.toString(), userSon.email, userSon.phone);
  console.log(`🔍 getMyFamily for Son: ${myFamSon.family.name}, Member relationship: ${myFamSon.myRelationship}`);
  if (!myFamSon.family || myFamSon.family._id.toString() !== familyId) {
    throw new Error('getMyFamily failed for son');
  }
  if (myFamSon.myRelationship !== 'SON') {
    throw new Error(`Expected Son relationship, got ${myFamSon.myRelationship}`);
  }

  // TEST PHONE SEARCH / LINK FOR UNLINKED USER
  const unlinkedUser = await User.create({
    name: `Visitor ${testSuffix}`,
    email: `visitor_${testSuffix}@example.com`,
    role: 'MEMBER',
  });

  const linkedResult = await DashboardService.getMemberDashboard(
    unlinkedUser._id.toString(),
    unlinkedUser.email,
    undefined,
    sonPhone // Providing Son's number to search/link
  );
  console.log(`🔍 Unlinked user provided Son's phone: Family matched: ${linkedResult.family?.name}`);
  if (!linkedResult.family || linkedResult.family._id.toString() !== familyId) {
    throw new Error('Failed to match family when searching by Son phone');
  }

  // CLEANUP
  await Family.findByIdAndDelete(familyId);
  await Member.deleteMany({ familyId });
  await User.deleteMany({
    _id: { $in: [userHead._id, userSpouse._id, userSon._id, userDaughter._id, unlinkedUser._id] },
  });

  console.log('\n============================================================');
  console.log('🎉 ALL ANY-MEMBER PHONE MATCHING TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================\n');
  await mongoose.disconnect();
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
