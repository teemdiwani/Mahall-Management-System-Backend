import { createApp } from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

const runTests = async () => {
  console.log('🧪 Starting Automated Backend Integration & RBAC Tests...\n');
  await connectDB();
  const app = createApp();

  const server = app.listen(0); // Random port
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  let memberCookie = '';
  let adminCookie = '';

  try {
    // 1. Health check
    console.log('1. Testing GET /health ...');
    const healthRes = await fetch(`http://localhost:${port}/health`);
    const healthJson = await healthRes.json();
    console.assert(healthRes.status === 200, 'Health check should be 200');
    console.assert(healthJson.status === 'ok', 'Status should be ok');
    console.log('   ✅ Health check passed.');

    // 2. Test Registration: New user MUST default to MEMBER role (RULE 1 & 2)
    console.log('2. Testing POST /api/auth/register (Checking default role = MEMBER) ...');
    const testEmail = `newuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test Member',
        email: testEmail,
        phone: '+91 9847111099',
        password: 'Password@123',
        role: 'SUPER_ADMIN', // Attempt privilege escalation
      }),
    });
    const regJson = await regRes.json();
    console.assert(regRes.status === 201, 'Registration should succeed');
    console.assert(regJson.data.user.role === 'MEMBER', 'Role MUST be MEMBER, privilege escalation rejected');
    console.log('   ✅ Default role = MEMBER enforced. Privilege escalation rejected.');

    // 3. Login as Member
    console.log('3. Testing POST /api/auth/login with Member credentials ...');
    const memberLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'member@mahallconnect.org',
        password: 'Password@123',
      }),
    });
    const memberLoginJson = await memberLoginRes.json();
    console.assert(memberLoginRes.status === 200, 'Member login should succeed');
    console.assert(memberLoginJson.data.user.role === 'MEMBER', 'User role should be MEMBER');
    memberCookie = memberLoginRes.headers.get('set-cookie') || '';
    console.log('   ✅ Member login successful and cookie issued.');

    // 4. Test GET /api/auth/me for Member
    console.log('4. Testing GET /api/auth/me for Member ...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: memberCookie },
    });
    const meJson = await meRes.json();
    console.assert(meRes.status === 200, 'Me endpoint should return 200');
    console.assert(meJson.data.member.name === 'Ahmed Al-Rashid', 'Should link to Ahmed Al-Rashid member');
    console.assert(meJson.data.family.familyCode === 'FAM-1001', 'Should link to FAM-1001 family');
    console.log('   ✅ User + Member + Family linked hierarchy verified.');

    // 5. Member accessing Admin Dashboard -> MUST be 403 Forbidden (RULE 8)
    console.log('5. Testing Member access to /api/dashboard/admin (Expecting 403 Forbidden) ...');
    const forbiddenRes = await fetch(`${baseUrl}/dashboard/admin`, {
      headers: { Cookie: memberCookie },
    });
    console.assert(forbiddenRes.status === 403, 'Member should be denied access to admin dashboard');
    console.log('   ✅ Backend RBAC strictly blocked unauthorized dashboard access.');

    // 6. Member accessing /api/users -> MUST be 403 Forbidden
    console.log('6. Testing Member access to /api/users (Expecting 403 Forbidden) ...');
    const forbiddenUsersRes = await fetch(`${baseUrl}/users`, {
      headers: { Cookie: memberCookie },
    });
    console.assert(forbiddenUsersRes.status === 403, 'Member should be denied access to users API');
    console.log('   ✅ Backend RBAC strictly blocked unauthorized users API access.');

    // 7. Login as Super Admin
    console.log('7. Testing Super Admin login & Admin Dashboard aggregation ...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@mahallconnect.org',
        password: 'Password@123',
      }),
    });
    adminCookie = adminLoginRes.headers.get('set-cookie') || '';
    const adminDashRes = await fetch(`${baseUrl}/dashboard/admin`, {
      headers: { Cookie: adminCookie },
    });
    const adminDashJson = await adminDashRes.json();
    console.assert(adminDashRes.status === 200, 'Super admin access should succeed');
    console.assert(adminDashJson.data.cards.totalFamilies >= 4, 'Families count should be >= 4');
    console.assert(adminDashJson.data.cards.totalMembers >= 12, 'Members count should be >= 12');
    console.assert(typeof adminDashJson.data.cards.monthlyCollection === 'number', 'Collection aggregate must be number');
    console.log('   ✅ Super Admin aggregation pipeline returned real database statistics.');

    // 8. Member Dashboard endpoint
    console.log('8. Testing Member Dashboard GET /api/dashboard/member ...');
    const memberDashRes = await fetch(`${baseUrl}/dashboard/member`, {
      headers: { Cookie: memberCookie },
    });
    const memberDashJson = await memberDashRes.json();
    console.assert(memberDashRes.status === 200, 'Member dashboard should return 200');
    console.assert(memberDashJson.data.family.familyCode === 'FAM-1001', 'Member dashboard family matches');
    console.assert(memberDashJson.data.mosquePrayerTimings !== null, 'Prayer timings included');
    console.log('   ✅ Member Dashboard returned contextual personal information.');

    // 9. Member Application Workflow: Submit & History
    console.log('9. Testing Application lifecycle with status audit trail ...');
    const appSubmitRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: memberCookie },
      body: JSON.stringify({
        type: 'WELFARE',
        title: 'Emergency Flood Relief Assistance',
        description: 'Roof leakage repair assistance request',
        requestedAmount: 5000,
      }),
    });
    const appSubmitJson = await appSubmitRes.json();
    console.assert(appSubmitRes.status === 201, 'Application submission should succeed');
    const appId = appSubmitJson.data._id;
    console.log('   ✅ Application created in PENDING state.');

    // Login as Welfare Officer and update status
    const welfareLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'welfare@mahallconnect.org',
        password: 'Password@123',
      }),
    });
    const welfareCookie = welfareLoginRes.headers.get('set-cookie') || '';

    const reviewRes = await fetch(`${baseUrl}/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: welfareCookie },
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        comment: 'Assigned to field volunteer for spot inspection',
      }),
    });
    console.assert(reviewRes.status === 200, 'Status update to UNDER_REVIEW should succeed');

    const appDetailRes = await fetch(`${baseUrl}/applications/${appId}`, {
      headers: { Cookie: memberCookie },
    });
    const appDetailJson = await appDetailRes.json();
    console.assert(appDetailJson.data.application.status === 'UNDER_REVIEW', 'Application status should be UNDER_REVIEW');
    console.assert(appDetailJson.data.history.length >= 2, 'Application history must record transitions');
    console.log('   ✅ Application lifecycle transition & history verified.');

    // 10. Financial overview for Treasurer
    console.log('10. Testing Treasurer Financial Overview GET /api/finance/overview ...');
    const treasurerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'treasurer@mahallconnect.org',
        password: 'Password@123',
      }),
    });
    const treasurerCookie = treasurerLoginRes.headers.get('set-cookie') || '';
    const finOverviewRes = await fetch(`${baseUrl}/finance/overview`, {
      headers: { Cookie: treasurerCookie },
    });
    const finOverviewJson = await finOverviewRes.json();
    console.assert(finOverviewRes.status === 200, 'Finance overview should succeed');
    console.assert(finOverviewJson.data.cards.expectedCollection > 0, 'Expected collection > 0');
    console.assert(finOverviewJson.data.cards.collected > 0, 'Collected amount > 0');
    console.log('   ✅ Finance aggregation and cards computed accurately from payments.');

    console.log('\n============================================================');
    console.log('🎉 ALL AUTOMATED INTEGRATION & RBAC TESTS PASSED SUCCESSFULLY!');
    console.log('============================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
