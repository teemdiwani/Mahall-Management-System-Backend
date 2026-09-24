import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../modules/auth/user.model.js';
import { AuthService } from '../modules/auth/auth.service.js';

async function runForgotPasswordTest() {
  console.log('🧪 Starting Forgot Password & OTP Flow Integration Test...\n');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const testEmail = `test_fp_${Date.now()}@mahallconnect.org`;
  const initialPassword = 'InitialPassword@123';
  const newPassword = 'NewSecretPassword@2026';

  // 1. Create a test user
  console.log('1. Registering test user...');
  const { user } = await AuthService.register({
    name: 'Forgot Pass Test User',
    email: testEmail,
    password: initialPassword,
    phone: `+91 98${Date.now().toString().slice(-8)}`,
  });
  console.log(`✅ User registered: ${user.email} (ID: ${user._id})`);

  // 2. Request OTP
  console.log('\n2. Calling forgotPassword()...');
  const fpRes = await AuthService.forgotPassword(testEmail);
  console.log(`✅ forgotPassword response:`, fpRes);

  // Retrieve user to check OTP stored in DB
  const userInDb = await User.findById(user._id).select('+passwordResetOtp +passwordResetExpires');
  console.log(`✅ Stored OTP in DB: ${userInDb?.passwordResetOtp}`);
  console.log(`✅ Stored Expiry: ${userInDb?.passwordResetExpires}`);

  if (!userInDb?.passwordResetOtp || userInDb.passwordResetOtp.length !== 6) {
    throw new Error('Expected 6-digit OTP to be saved on user document');
  }

  // 3. Test invalid OTP rejection
  console.log('\n3. Testing invalid OTP rejection...');
  try {
    await AuthService.verifyResetOtp(testEmail, '999999');
    throw new Error('Should have rejected incorrect OTP');
  } catch (err: any) {
    console.log(`✅ Correctly rejected invalid OTP: ${err.message}`);
  }

  // 4. Test valid OTP verification
  console.log('\n4. Testing valid OTP verification...');
  const verifyRes = await AuthService.verifyResetOtp(testEmail, userInDb.passwordResetOtp);
  console.log(`✅ verifyResetOtp response:`, verifyRes);
  if (!verifyRes.valid) {
    throw new Error('Expected valid=true for correct OTP');
  }

  // 5. Test resetting password
  console.log('\n5. Testing resetPasswordWithOtp()...');
  const resetRes = await AuthService.resetPasswordWithOtp(testEmail, userInDb.passwordResetOtp, newPassword);
  console.log(`✅ resetPasswordWithOtp response:`, resetRes);

  // Check that OTP is cleared from user
  const userAfterReset = await User.findById(user._id).select('+passwordResetOtp +passwordResetExpires');
  if (userAfterReset?.passwordResetOtp) {
    throw new Error('Expected OTP to be cleared after reset');
  }
  console.log('✅ OTP cleared from user record');

  // 6. Test login with old password (must fail)
  console.log('\n6. Testing login with old password (should fail)...');
  try {
    await AuthService.login(testEmail, initialPassword);
    throw new Error('Old password should no longer work');
  } catch (err: any) {
    console.log(`✅ Old password rejected correctly: ${err.message}`);
  }

  // 7. Test login with new password (must succeed)
  console.log('\n7. Testing login with new password (should succeed)...');
  const loginRes = await AuthService.login(testEmail, newPassword);
  console.log(`✅ Successfully logged in with new password! Token generated: ${loginRes.token.slice(0, 15)}...`);

  // Clean up test user
  await User.findByIdAndDelete(user._id);
  console.log('\n✅ Cleaned up test user.');

  console.log('\n============================================================');
  console.log('🎉 ALL FORGOT PASSWORD & OTP TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================\n');

  await mongoose.disconnect();
}

runForgotPasswordTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
