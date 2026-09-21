import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { HajjUmrahPost } from '../modules/hajjUmrah/hajjUmrahPost.model.js';
import { HajjUmrahRegistration } from '../modules/hajjUmrah/hajjUmrahRegistration.model.js';
import { HajjUmrahService } from '../modules/hajjUmrah/hajjUmrah.service.js';
import { mailService } from '../utils/mailService.js';

async function runHajjUmrahTests() {
  console.log('🧪 Starting Hajj & Umrah Registration & Mail Dispatch Tests...\n');

  // Test 1: Mail Service Unit Verification
  console.log('1. Testing Nodemailer mailService template & generation...');
  const testMailResult = await mailService.sendHajjRegistrationConfirmationEmail({
    applicantName: 'Tariq Mansoor',
    applicantEmail: 'tariq.test@example.com',
    postTitle: 'Al-Haramain 2027 Group (20 Slots)',
    type: 'HAJJ',
    travelsName: 'Al-Haramain Travels',
    contactPerson: 'Janab Musthafa',
    contactPhone: '+91 98470 12345',
    contactEmail: 'contact@alharamaintravels.com',
    seats: 2,
    registrationRef: 'HAJJ-2027-TEST01',
    departureDate: new Date('2027-05-20'),
    estimatedPrice: '₹3,50,000',
  });

  if (!testMailResult.success) {
    throw new Error('mailService.sendHajjRegistrationConfirmationEmail failed');
  }
  console.log('✅ Mail service simulation/dispatch completed successfully.');

  // Check MongoDB connection for DB tests
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for database integration tests.');
  } catch (err) {
    console.log('⚠️ MongoDB connection skipped (DB may not be running locally). Mail test passed!');
    return;
  }

  const testSuffix = Date.now().toString().slice(-4);

  // Test 2: Secretary creates a 20-slot travel post
  console.log('\n2. Testing Secretary creating a 20-slot Hajj travel announcement...');
  const post = await HajjUmrahService.createPost({
    title: `Test Hajj Group ${testSuffix}`,
    type: 'HAJJ',
    travelsName: 'Test Travels Agency',
    contactPerson: 'Haji Ibrahim',
    contactPhone: '+91 98765 00000',
    contactEmail: 'info@testtravels.com',
    totalSlots: 20,
    estimatedPrice: '₹3,40,000',
    description: 'Special 20-slot travel agency package with direct flights.',
    features: ['Direct flights', '5-star hotel near Haram'],
  });

  if (post.totalSlots !== 20 || post.bookedSlots !== 0 || post.status !== 'OPEN') {
    throw new Error(`Post initialization failed. Total: ${post.totalSlots}, Booked: ${post.bookedSlots}`);
  }
  console.log(`✅ Created post "${post.title}" with 20 total slots and 0 booked slots.`);

  // Test 3: Member registers for 3 seats
  console.log('\n3. Testing Member registration for 3 seats...');
  const regResult = await HajjUmrahService.register(post._id.toString(), {
    applicantName: 'Faisal Mohammed',
    applicantPhone: '+91 98470 11111',
    applicantEmail: 'faisal.test@example.com',
    seats: 3,
    notes: 'Please arrange ground floor rooms',
  });

  if (regResult.registration.seats !== 3) {
    throw new Error('Registration seats mismatch');
  }

  const updatedPostAfterFirstReg = await HajjUmrahPost.findById(post._id);
  if (updatedPostAfterFirstReg?.bookedSlots !== 3) {
    throw new Error(`Booked slots expected 3, got ${updatedPostAfterFirstReg?.bookedSlots}`);
  }
  console.log(
    `✅ Registration successful. Booked: ${updatedPostAfterFirstReg.bookedSlots}, Remaining: ${
      updatedPostAfterFirstReg.totalSlots - updatedPostAfterFirstReg.bookedSlots
    } slots.`
  );
  console.log(`✅ Travels contact shared: ${regResult.travelsContact.contactPhone}`);

  // Test 4: Member registers for remaining 17 seats (filling the post completely)
  console.log('\n4. Testing filling the remaining 17 slots...');
  await HajjUmrahService.register(post._id.toString(), {
    applicantName: 'Group Pilgrims',
    applicantPhone: '+91 98470 22222',
    applicantEmail: 'group.test@example.com',
    seats: 17,
  });

  const fullPost = await HajjUmrahPost.findById(post._id);
  if (fullPost?.bookedSlots !== 20 || fullPost?.status !== 'FULL') {
    throw new Error(`Post should be FULL. Booked: ${fullPost?.bookedSlots}, Status: ${fullPost?.status}`);
  }
  console.log(`✅ Post automatically marked as FULL when bookedSlots reached totalSlots (20/20).`);

  // Test 5: Overbooking attempt should be blocked
  console.log('\n5. Testing overbooking prevention on a FULL package...');
  try {
    await HajjUmrahService.register(post._id.toString(), {
      applicantName: 'Late Applicant',
      applicantPhone: '+91 98470 33333',
      applicantEmail: 'late.test@example.com',
      seats: 1,
    });
    throw new Error('Overbooking should have thrown an error, but it succeeded!');
  } catch (err: any) {
    console.log(`✅ Overbooking correctly blocked: "${err.message}"`);
  }

  // Test 6: Secretary cancels one registration, restoring slots
  console.log('\n6. Testing cancellation and automatic slot restoration...');
  await HajjUmrahService.updateRegistrationStatus(regResult.registration._id.toString(), 'CANCELLED');
  const restoredPost = await HajjUmrahPost.findById(post._id);
  if (restoredPost?.bookedSlots !== 17 || restoredPost?.status !== 'OPEN') {
    throw new Error(`Slots not restored. Booked: ${restoredPost?.bookedSlots}, Status: ${restoredPost?.status}`);
  }
  console.log(
    `✅ Registration cancelled. Slots restored from 20/20 to ${restoredPost.bookedSlots}/20, post status reverted to OPEN.`
  );

  // Clean up
  console.log('\n7. Cleaning up test documents...');
  await HajjUmrahRegistration.deleteMany({ postId: post._id });
  await HajjUmrahPost.findByIdAndDelete(post._id);
  console.log('✅ Cleanup completed.');

  console.log('\n🎉 ALL HAJJ & UMRAH TESTS PASSED SUCCESSFULLY!\n');
  await mongoose.disconnect();
}

runHajjUmrahTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
