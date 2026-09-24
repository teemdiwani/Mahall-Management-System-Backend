import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../modules/auth/user.model.js';
import { Member } from '../modules/members/member.model.js';
import { Family } from '../modules/families/family.model.js';
import { FamilyMember } from '../modules/families/familyMember.model.js';
import { FamilyChangeRequest } from '../modules/families/familyChangeRequest.model.js';
import { Payment } from '../modules/payments/payment.model.js';
import { Expense } from '../modules/finance/expense.model.js';
import { Application } from '../modules/applications/application.model.js';
import { ApplicationHistory } from '../modules/applications/applicationHistory.model.js';
import { Madrasa, MadrasaStudent } from '../modules/madrasa/madrasa.model.js';
import {
  MadrasaTeacher,
  MadrasaClass,
  MadrasaTimetable,
  MadrasaExamResult,
  MadrasaFee,
  MadrasaAttendance,
  MadrasaAnnouncement,
} from '../modules/madrasa/madrasa.extra.model.js';
import { Mosque } from '../modules/mosque/mosque.model.js';
import { Event } from '../modules/events/event.model.js';
import { Volunteer } from '../modules/volunteers/volunteer.model.js';
import { Asset } from '../modules/assets/asset.model.js';
import { CommitteeMember, CommitteeMeeting } from '../modules/committee/committee.model.js';
import { Funeral } from '../modules/funeral/funeral.model.js';
import { Marriage } from '../modules/marriage/marriage.model.js';
import { Announcement } from '../modules/announcements/announcement.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { HajjUmrahPost } from '../modules/hajjUmrah/hajjUmrahPost.model.js';
import { HajjUmrahRegistration } from '../modules/hajjUmrah/hajjUmrahRegistration.model.js';
import { ROLES } from '../constants/roles.js';

const seedDatabase = async () => {
  console.log('🌱 Starting database seed...');
  await connectDB();

  // Clear existing collections
  console.log('🧹 Clearing old collections...');
  await Promise.all([
    User.deleteMany({}),
    Member.deleteMany({}),
    Family.deleteMany({}),
    FamilyMember.deleteMany({}),
    FamilyChangeRequest.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    Application.deleteMany({}),
    ApplicationHistory.deleteMany({}),
    Madrasa.deleteMany({}),
    MadrasaStudent.deleteMany({}),
    MadrasaTeacher.deleteMany({}),
    MadrasaClass.deleteMany({}),
    MadrasaTimetable.deleteMany({}),
    MadrasaExamResult.deleteMany({}),
    MadrasaFee.deleteMany({}),
    MadrasaAttendance.deleteMany({}),
    MadrasaAnnouncement.deleteMany({}),
    Mosque.deleteMany({}),
    Event.deleteMany({}),
    Volunteer.deleteMany({}),
    Asset.deleteMany({}),
    CommitteeMember.deleteMany({}),
    CommitteeMeeting.deleteMany({}),
    Funeral.deleteMany({}),
    Marriage.deleteMany({}),
    Announcement.deleteMany({}),
    Notification.deleteMany({}),
    HajjUmrahPost.deleteMany({}),
    HajjUmrahRegistration.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password@123', salt);

  console.log('👤 Creating Users across all 8 roles...');
  const users = await User.create([
    {
      name: 'Super Admin User',
      email: 'admin@mahallconnect.org',
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    },
    {
      name: 'Zubair Al-Katib',
      email: 'secretary@mahallconnect.org',
      passwordHash,
      role: ROLES.SECRETARY,
      isActive: true,
    },
    {
      name: 'Mustafa Al-Amin',
      email: 'treasurer@mahallconnect.org',
      passwordHash,
      role: ROLES.TREASURER,
      isActive: true,
    },
    {
      name: 'Usthad Abdullah Faizy',
      email: 'imam@mahallconnect.org',
      passwordHash,
      role: ROLES.IMAM,
      isActive: true,
    },
    {
      name: 'Umar Farooq',
      email: 'madrasa@mahallconnect.org',
      passwordHash,
      role: ROLES.MADRASA_ADMIN,
      isActive: true,
    },
    {
      name: 'Dr. Tariq Jamil',
      email: 'welfare@mahallconnect.org',
      passwordHash,
      role: ROLES.WELFARE_OFFICER,
      isActive: true,
    },
    {
      name: 'Haji Abdul Kareem',
      email: 'committee@mahallconnect.org',
      passwordHash,
      role: ROLES.COMMITTEE_MEMBER,
      isActive: true,
    },
    {
      name: 'Ahmed Al-Rashid',
      email: 'member@mahallconnect.org',
      passwordHash,
      role: ROLES.MEMBER,
      isActive: true,
    },
  ]);

  const [adminUser, secretaryUser, treasurerUser, imamUser, madrasaAdminUser, welfareOfficerUser, committeeUser, memberUser] = users;

  console.log('🏡 Creating Families...');
  const familiesData = [
    { familyCode: 'FAM-1001', name: 'Al-Rashid Family', address: 'Baitul Noor, 4th Cross, North Ward', area: 'North Ward', phone: '+91 9847111001', status: 'ACTIVE' },
    { familyCode: 'FAM-1002', name: 'Ba-Hammam Family', address: 'Darul Salam, Green Valley, East Ward', area: 'East Ward', phone: '+91 9847111002', status: 'ACTIVE' },
    { familyCode: 'FAM-1003', name: 'Hassan Family', address: 'Al-Falah Villa, South Main Road', area: 'South Ward', phone: '+91 9847111003', status: 'ACTIVE' },
    { familyCode: 'FAM-1004', name: 'Kutty Family', address: 'Kutty Manzil, West Beach Road', area: 'West Ward', phone: '+91 9847111004', status: 'ACTIVE' },
    { familyCode: 'FAM-1005', name: 'Al-Qasimi Family', address: 'Qasr Al-Noor, North Ward', area: 'North Ward', phone: '+91 9847111005', status: 'ACTIVE' },
    { familyCode: 'FAM-1006', name: 'Rahman Family', address: 'Rahmaniya Villa, North Ward', area: 'North Ward', phone: '+91 9847111006', status: 'ACTIVE' },
    { familyCode: 'FAM-1007', name: 'Siddiqui Family', address: 'Baitul Aman, East Ward', area: 'East Ward', phone: '+91 9847111007', status: 'ACTIVE' },
    { familyCode: 'FAM-1008', name: 'Ansari Family', address: 'Ansari Heights, East Ward', area: 'East Ward', phone: '+91 9847111008', status: 'ACTIVE' },
    { familyCode: 'FAM-1009', name: 'Al-Farooq Family', address: 'Farooq Nagar, South Ward', area: 'South Ward', phone: '+91 9847111009', status: 'ACTIVE' },
    { familyCode: 'FAM-1010', name: 'Thangal Family', address: 'Sadath Manzil, South Ward', area: 'South Ward', phone: '+91 9847111010', status: 'ACTIVE' },
    { familyCode: 'FAM-1011', name: 'Moulavi Family', address: 'Darul Irshad, West Ward', area: 'West Ward', phone: '+91 9847111011', status: 'ACTIVE' },
    { familyCode: 'FAM-1012', name: 'Marakkar Family', address: 'Marakkar Manzil, West Ward', area: 'West Ward', phone: '+91 9847111012', status: 'ACTIVE' },
    { familyCode: 'FAM-1013', name: 'Usman Family', address: 'Baitul Firdous, Bilal Nagar', area: 'Bilal Nagar', phone: '+91 9847111013', status: 'ACTIVE' },
    { familyCode: 'FAM-1014', name: 'Koyakutty Family', address: 'Koyakutty Villa, Bilal Nagar', area: 'Bilal Nagar', phone: '+91 9847111014', status: 'ACTIVE' },
    { familyCode: 'FAM-1015', name: 'Shafeeque Family', address: 'Noor Mahal, Bilal Nagar', area: 'Bilal Nagar', phone: '+91 9847111015', status: 'ACTIVE' },
    { familyCode: 'FAM-1016', name: 'Al-Madani Family', address: 'Madani Garden, Central Ward', area: 'Central Ward', phone: '+91 9847111016', status: 'ACTIVE' },
    { familyCode: 'FAM-1017', name: 'Koya Family', address: 'Koya Manzil, Central Ward', area: 'Central Ward', phone: '+91 9847111017', status: 'ACTIVE' },
    { familyCode: 'FAM-1018', name: 'Firozkhan Family', address: 'Khan Manzil, Central Ward', area: 'Central Ward', phone: '+91 9847111018', status: 'ACTIVE' },
  ];
  const families = await Family.create(familiesData);
  const [familyRashid, familyHammam, familyHassan, familyKutty] = families;

  console.log('👨‍👩‍👧‍👦 Creating Members linked to Families and Users...');
  const membersData: any[] = [
    // 1. Rashid Family (FAM-1001)
    { name: 'Ahmed Al-Rashid', dateOfBirth: new Date('1982-05-14'), gender: 'MALE', phone: '+91 9847111001', email: 'member@mahallconnect.org', familyId: families[0]._id, relationship: 'HEAD', occupation: 'Civil Engineer', education: 'B.Tech', membershipStatus: 'ACTIVE', userId: memberUser._id },
    { name: 'Fatima Al-Rashid', dateOfBirth: new Date('1985-09-22'), gender: 'FEMALE', phone: '+91 9847111005', familyId: families[0]._id, relationship: 'SPOUSE', occupation: 'Teacher', education: 'M.Sc B.Ed', membershipStatus: 'ACTIVE' },
    { name: 'Zaid Al-Rashid', dateOfBirth: new Date('2014-03-10'), gender: 'MALE', familyId: families[0]._id, relationship: 'SON', education: 'Grade 6', membershipStatus: 'ACTIVE' },
    { name: 'Maryam Al-Rashid', dateOfBirth: new Date('2017-08-18'), gender: 'FEMALE', familyId: families[0]._id, relationship: 'DAUGHTER', education: 'Grade 3', membershipStatus: 'ACTIVE' },
    { name: 'Rashid Al-Noor', dateOfBirth: new Date('1950-01-01'), gender: 'MALE', familyId: families[0]._id, relationship: 'GRANDFATHER', occupation: 'Retired Merchant', membershipStatus: 'ACTIVE' },
    { name: 'Khadija Umm Ahmed', dateOfBirth: new Date('1954-11-04'), gender: 'FEMALE', familyId: families[0]._id, relationship: 'GRANDMOTHER', occupation: 'Homemaker', membershipStatus: 'ACTIVE' },

    // 2. Ba-Hammam Family (FAM-1002)
    { name: 'Ibrahim Ba-Hammam', dateOfBirth: new Date('1976-02-28'), gender: 'MALE', phone: '+91 9847111002', email: 'ibrahim@bahammam.org', familyId: families[1]._id, relationship: 'HEAD', occupation: 'Merchant', membershipStatus: 'ACTIVE' },
    { name: 'Aisha Ba-Hammam', dateOfBirth: new Date('1980-06-12'), gender: 'FEMALE', familyId: families[1]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Bilal Ba-Hammam', dateOfBirth: new Date('2011-12-05'), gender: 'MALE', familyId: families[1]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },
    { name: 'Zahra Ba-Hammam', dateOfBirth: new Date('2015-04-18'), gender: 'FEMALE', familyId: families[1]._id, relationship: 'DAUGHTER', membershipStatus: 'ACTIVE' },

    // 3. Hassan Family (FAM-1003)
    { name: 'Tariq Hassan', dateOfBirth: new Date('1989-07-19'), gender: 'MALE', phone: '+91 9847111003', familyId: families[2]._id, relationship: 'HEAD', occupation: 'Software Consultant', membershipStatus: 'ACTIVE' },
    { name: 'Amina Hassan', dateOfBirth: new Date('1992-04-25'), gender: 'FEMALE', familyId: families[2]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Yusuf Hassan', dateOfBirth: new Date('2019-01-15'), gender: 'MALE', familyId: families[2]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 4. Kutty Family (FAM-1004)
    { name: 'Usman Kutty', dateOfBirth: new Date('1965-01-10'), gender: 'MALE', phone: '+91 9847111004', familyId: families[3]._id, relationship: 'HEAD', occupation: 'Retired Public Servant', membershipStatus: 'ACTIVE' },
    { name: 'Zainab Kutty', dateOfBirth: new Date('1970-10-15'), gender: 'FEMALE', familyId: families[3]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Musthafa Kutty', dateOfBirth: new Date('1996-03-21'), gender: 'MALE', familyId: families[3]._id, relationship: 'SON', occupation: 'Accountant', membershipStatus: 'ACTIVE' },

    // 5. Al-Qasimi Family (FAM-1005)
    { name: 'Mahmood Al-Qasimi', dateOfBirth: new Date('1978-08-11'), gender: 'MALE', phone: '+91 9847111019', familyId: families[4]._id, relationship: 'HEAD', occupation: 'Exporter', membershipStatus: 'ACTIVE' },
    { name: 'Haseena Qasimi', dateOfBirth: new Date('1982-12-04'), gender: 'FEMALE', familyId: families[4]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Hassan Qasimi', dateOfBirth: new Date('2008-05-19'), gender: 'MALE', familyId: families[4]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 6. Rahman Family (FAM-1006)
    { name: 'Abdul Rahman', dateOfBirth: new Date('1972-04-14'), gender: 'MALE', phone: '+91 9847111020', familyId: families[5]._id, relationship: 'HEAD', occupation: 'Architect', membershipStatus: 'ACTIVE' },
    { name: 'Ruqiyya Rahman', dateOfBirth: new Date('1976-09-30'), gender: 'FEMALE', familyId: families[5]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Nabeel Rahman', dateOfBirth: new Date('2003-11-12'), gender: 'MALE', familyId: families[5]._id, relationship: 'SON', occupation: 'Medical Student', membershipStatus: 'ACTIVE' },

    // 7. Siddiqui Family (FAM-1007)
    { name: 'Kashif Siddiqui', dateOfBirth: new Date('1984-06-25'), gender: 'MALE', phone: '+91 9847111021', familyId: families[6]._id, relationship: 'HEAD', occupation: 'Pharmacist', membershipStatus: 'ACTIVE' },
    { name: 'Suhaira Siddiqui', dateOfBirth: new Date('1988-02-14'), gender: 'FEMALE', familyId: families[6]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Hamza Siddiqui', dateOfBirth: new Date('2016-07-29'), gender: 'MALE', familyId: families[6]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 8. Ansari Family (FAM-1008)
    { name: 'Salim Ansari', dateOfBirth: new Date('1980-01-19'), gender: 'MALE', phone: '+91 9847111022', familyId: families[7]._id, relationship: 'HEAD', occupation: 'Automobile Dealer', membershipStatus: 'ACTIVE' },
    { name: 'Farzana Ansari', dateOfBirth: new Date('1983-08-08'), gender: 'FEMALE', familyId: families[7]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Irfan Ansari', dateOfBirth: new Date('2012-10-10'), gender: 'MALE', familyId: families[7]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 9. Al-Farooq Family (FAM-1009)
    { name: 'Farooq Al-Baqir', dateOfBirth: new Date('1975-03-03'), gender: 'MALE', phone: '+91 9847111023', familyId: families[8]._id, relationship: 'HEAD', occupation: 'Contractor', membershipStatus: 'ACTIVE' },
    { name: 'Sabira Farooq', dateOfBirth: new Date('1979-11-15'), gender: 'FEMALE', familyId: families[8]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Salman Farooq', dateOfBirth: new Date('2007-06-02'), gender: 'MALE', familyId: families[8]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 10. Thangal Family (FAM-1010)
    { name: 'Sayyid Munawwar Thangal', dateOfBirth: new Date('1981-12-12'), gender: 'MALE', phone: '+91 9847111024', familyId: families[9]._id, relationship: 'HEAD', occupation: 'Professor', membershipStatus: 'ACTIVE' },
    { name: 'Sharifa Thangal', dateOfBirth: new Date('1986-04-18'), gender: 'FEMALE', familyId: families[9]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Sayyid Haidar', dateOfBirth: new Date('2014-09-09'), gender: 'MALE', familyId: families[9]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 11. Moulavi Family (FAM-1011)
    { name: 'Musthafa Moulavi', dateOfBirth: new Date('1968-07-22'), gender: 'MALE', phone: '+91 9847111025', familyId: families[10]._id, relationship: 'HEAD', occupation: 'Scholar & Writer', membershipStatus: 'ACTIVE' },
    { name: 'Kulsum Moulavi', dateOfBirth: new Date('1974-03-17'), gender: 'FEMALE', familyId: families[10]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Anas Moulavi', dateOfBirth: new Date('2001-08-30'), gender: 'MALE', familyId: families[10]._id, relationship: 'SON', occupation: 'Teacher', membershipStatus: 'ACTIVE' },

    // 12. Marakkar Family (FAM-1012)
    { name: 'Hussain Marakkar', dateOfBirth: new Date('1973-10-05'), gender: 'MALE', phone: '+91 9847111026', familyId: families[11]._id, relationship: 'HEAD', occupation: 'Fisheries Businessman', membershipStatus: 'ACTIVE' },
    { name: 'Maimoona Marakkar', dateOfBirth: new Date('1977-05-24'), gender: 'FEMALE', familyId: families[11]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Rashid Marakkar', dateOfBirth: new Date('2006-01-14'), gender: 'MALE', familyId: families[11]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 13. Usman Family (FAM-1013)
    { name: 'Usman Ali', dateOfBirth: new Date('1985-02-18'), gender: 'MALE', phone: '+91 9847111027', familyId: families[12]._id, relationship: 'HEAD', occupation: 'Electrician', membershipStatus: 'ACTIVE' },
    { name: 'Rehana Ali', dateOfBirth: new Date('1989-09-12'), gender: 'FEMALE', familyId: families[12]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Asma Ali', dateOfBirth: new Date('2018-05-04'), gender: 'FEMALE', familyId: families[12]._id, relationship: 'DAUGHTER', membershipStatus: 'ACTIVE' },

    // 14. Koyakutty Family (FAM-1014)
    { name: 'Koyakutty Haji', dateOfBirth: new Date('1958-09-09'), gender: 'MALE', phone: '+91 9847111028', familyId: families[13]._id, relationship: 'HEAD', occupation: 'Retired Merchant', membershipStatus: 'ACTIVE' },
    { name: 'Pathumma Haji', dateOfBirth: new Date('1964-11-20'), gender: 'FEMALE', familyId: families[13]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },

    // 15. Shafeeque Family (FAM-1015)
    { name: 'Shafeeque Rahman', dateOfBirth: new Date('1987-11-23'), gender: 'MALE', phone: '+91 9847111029', familyId: families[14]._id, relationship: 'HEAD', occupation: 'Graphic Designer', membershipStatus: 'ACTIVE' },
    { name: 'Nazreen Shafeeque', dateOfBirth: new Date('1991-03-15'), gender: 'FEMALE', familyId: families[14]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Rayan Shafeeque', dateOfBirth: new Date('2020-08-11'), gender: 'MALE', familyId: families[14]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 16. Al-Madani Family (FAM-1016)
    { name: 'Shamsudheen Madani', dateOfBirth: new Date('1970-08-15'), gender: 'MALE', phone: '+91 9847111030', familyId: families[15]._id, relationship: 'HEAD', occupation: 'Lecturer', membershipStatus: 'ACTIVE' },
    { name: 'Rabiya Madani', dateOfBirth: new Date('1975-01-28'), gender: 'FEMALE', familyId: families[15]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Muhammed Madani', dateOfBirth: new Date('2005-04-12'), gender: 'MALE', familyId: families[15]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },

    // 17. Koya Family (FAM-1017)
    { name: 'Cheriya Koya', dateOfBirth: new Date('1966-04-05'), gender: 'MALE', phone: '+91 9847111031', familyId: families[16]._id, relationship: 'HEAD', occupation: 'Transport Owner', membershipStatus: 'ACTIVE' },
    { name: 'Nabeesa Koya', dateOfBirth: new Date('1972-12-19'), gender: 'FEMALE', familyId: families[16]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },

    // 18. Firozkhan Family (FAM-1018)
    { name: 'Firoz Khan', dateOfBirth: new Date('1983-10-10'), gender: 'MALE', phone: '+91 9847111032', familyId: families[17]._id, relationship: 'HEAD', occupation: 'Civil Surveyor', membershipStatus: 'ACTIVE' },
    { name: 'Shahina Khan', dateOfBirth: new Date('1987-07-07'), gender: 'FEMALE', familyId: families[17]._id, relationship: 'SPOUSE', membershipStatus: 'ACTIVE' },
    { name: 'Ayaan Khan', dateOfBirth: new Date('2017-02-22'), gender: 'MALE', familyId: families[17]._id, relationship: 'SON', membershipStatus: 'ACTIVE' },
  ];

  const members = await Member.create(membersData);

  // Link family heads
  for (let i = 0; i < families.length; i++) {
    const headMember = members.find((m) => m.familyId?.toString() === families[i]._id.toString() && m.relationship === 'HEAD');
    if (headMember) {
      families[i].familyHead = headMember._id as any;
      await families[i].save();
    }
  }

  console.log('🔗 Creating FamilyMember relational records...');
  const familyMemberDocs = members
    .filter((m) => m.familyId)
    .map((m) => {
      const fam = families.find((f) => f._id.toString() === m.familyId?.toString());
      const head = members.find((h) => h.familyId?.toString() === m.familyId?.toString() && h.relationship === 'HEAD');
      return {
        familyId: m.familyId,
        memberId: m._id,
        relationship: m.relationship || 'OTHER',
        relatedToMemberId: head && head._id.toString() !== m._id.toString() ? head._id : undefined,
        isFamilyHead: m.relationship === 'HEAD',
        status: 'ACTIVE',
        joinedAt: new Date(),
      };
    });
  await FamilyMember.create(familyMemberDocs);

  console.log('💳 Creating Payments & Financial Transactions (Past 9 Months)...');
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const currentMonth = '2026-09';
  const paymentsToInsert: any[] = [];

  months.forEach((m, mIdx) => {
    families.forEach((fam, fIdx) => {
      // Current month has some pending payments to create realistic receivables
      const isPending = (m === currentMonth && fIdx % 3 === 1) || (m === '2026-08' && fIdx === 7);
      const isPaid = !isPending;
      const methods = ['ONLINE', 'UPI', 'CASH', 'BANK_TRANSFER'];
      const method = methods[(fIdx + mIdx) % methods.length];

      paymentsToInsert.push({
        paymentNumber: `PAY-${m}-${fam.familyCode}`,
        familyId: fam._id,
        amount: 250,
        month: m,
        type: 'MONTHLY',
        status: isPaid ? 'PAID' : 'PENDING',
        paymentMethod: method,
        transactionId: isPaid ? `TXN-${m.replace('-', '')}-${fIdx + 100}` : undefined,
        receiptNumber: isPaid ? `RCP-${m.replace('-', '')}-${String(fIdx + 1).padStart(3, '0')}` : undefined,
        verifiedBy: isPaid ? treasurerUser._id : undefined,
        paidAt: isPaid ? new Date(`${m}-08T10:30:00.000Z`) : undefined,
      });
    });
  });

  // Donations & Zakat contributions across months
  paymentsToInsert.push(
    {
      paymentNumber: 'DON-2026-00101',
      familyId: families[0]._id,
      memberId: members[0]._id,
      amount: 10000,
      month: '2026-03',
      type: 'DONATION',
      status: 'PAID',
      paymentMethod: 'ONLINE',
      transactionId: 'TXN-DON-94812',
      receiptNumber: 'RCP-2026-00383',
      notes: 'Masjid Ramadan Iftar fund donation',
      paidAt: new Date('2026-03-15'),
    },
    {
      paymentNumber: 'ZAK-2026-00054',
      familyId: families[2]._id,
      amount: 25000,
      month: '2026-04',
      type: 'ZAKAT',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'IMPS-28491823',
      receiptNumber: 'RCP-2026-00384',
      notes: 'Annual Zakat Al-Mal distribution pool',
      paidAt: new Date('2026-04-02'),
    },
    {
      paymentNumber: 'DON-2026-00205',
      familyId: families[4]._id,
      amount: 15000,
      month: '2026-06',
      type: 'DONATION',
      status: 'PAID',
      paymentMethod: 'UPI',
      transactionId: 'UPI-984712093',
      receiptNumber: 'RCP-2026-00512',
      notes: 'Madrasa smart classroom upgrade contribution',
      paidAt: new Date('2026-06-18'),
    },
    {
      paymentNumber: 'DON-2026-00301',
      familyId: families[9]._id,
      amount: 5000,
      month: '2026-09',
      type: 'DONATION',
      status: 'PAID',
      paymentMethod: 'ONLINE',
      transactionId: 'TXN-98412891',
      receiptNumber: 'RCP-2026-00891',
      notes: 'Community flood relief contribution',
      paidAt: new Date(),
    }
  );

  await Payment.create(paymentsToInsert);

  console.log('📊 Creating Expenses (Past 9 Months)...');
  const expensesData = [
    { expenseNumber: 'EXP-1001', title: 'Masjid Power & Utilities (Sep)', category: 'UTILITIES', amount: 4850, description: 'Electricity and water board charges for Masjid complex', recordedBy: treasurerUser._id, date: new Date('2026-09-05') },
    { expenseNumber: 'EXP-1002', title: 'Madrasa Teachers Honorarium (Aug)', category: 'SALARIES', amount: 18000, description: 'Monthly teaching allowance for 3 Usthad staff', recordedBy: treasurerUser._id, date: new Date('2026-08-31') },
    { expenseNumber: 'EXP-1003', title: 'Medical Aid Disbursement', category: 'WELFARE', amount: 10000, description: 'Surgery grant for Khadija Umm Ahmed', recordedBy: treasurerUser._id, date: new Date('2026-08-15') },
    { expenseNumber: 'EXP-1004', title: 'Masjid Sound System & Mic Replacement', category: 'MAINTENANCE', amount: 3500, description: 'Ahuja cordless mic and repair', recordedBy: treasurerUser._id, date: new Date('2026-07-20') },
    { expenseNumber: 'EXP-1005', title: 'Madrasa Books & Syllabus Materials', category: 'MADRASA', amount: 6200, description: 'Textbooks and attendance registers for academic year', recordedBy: treasurerUser._id, date: new Date('2026-06-10') },
    { expenseNumber: 'EXP-1006', title: 'Eid-ul-Fitr Community Gathering', category: 'EVENTS', amount: 12500, description: 'Post-Eid community sweets and tent rental', recordedBy: treasurerUser._id, date: new Date('2026-04-12') },
    { expenseNumber: 'EXP-1007', title: 'Ramadan Daily Community Iftar Supplies', category: 'EVENTS', amount: 22000, description: 'Dates, rice, and cooking ingredients for 30 days', recordedBy: treasurerUser._id, date: new Date('2026-03-25') },
    { expenseNumber: 'EXP-1008', title: 'Masjid Carpet Deep Cleaning', category: 'MAINTENANCE', amount: 4500, description: 'Annual pre-Ramadan prayer hall shampoo cleaning', recordedBy: treasurerUser._id, date: new Date('2026-02-18') },
    { expenseNumber: 'EXP-1009', title: 'Masjid Power Bill (Jan)', category: 'UTILITIES', amount: 4100, description: 'Commercial KSEB bill', recordedBy: treasurerUser._id, date: new Date('2026-01-28') },
  ];
  await Expense.create(expensesData);

  console.log('📝 Creating Applications with Workflow History...');
  const app1 = await Application.create({
    applicationNumber: 'APP-2026-01001',
    applicant: memberUser._id,
    member: members[5]._id, // Khadija
    family: familyRashid._id,
    type: 'WELFARE',
    status: 'APPROVED',
    title: 'Medical Assistance for Cataract Surgery',
    description: 'Financial support requested for elderly mother cataract surgery at Al-Salama Eye Hospital.',
    requestedAmount: 12000,
    reviewer: welfareOfficerUser._id,
    reviewNotes: 'Verified with hospital estimate. Approved ₹10,000 from Mahall Welfare Fund.',
    decision: 'Approved ₹10,000 grant',
    decisionAt: new Date(),
  });

  const app2 = await Application.create({
    applicationNumber: 'APP-2026-01002',
    applicant: memberUser._id,
    family: familyRashid._id,
    type: 'ZAKAT',
    status: 'UNDER_REVIEW',
    title: 'Educational Grant for High School Entrance',
    description: 'Assistance requested for preparatory books and coaching fees.',
    requestedAmount: 6000,
    reviewer: welfareOfficerUser._id,
    reviewNotes: 'Under verification by educational desk.',
  });

  const app3 = await Application.create({
    applicationNumber: 'APP-2026-01003',
    applicant: memberUser._id,
    family: familyRashid._id,
    type: 'MARRIAGE',
    status: 'APPROVED',
    title: 'Nikah Registration & Community Hall Booking',
    description: 'Application for official Mahall Nikah registration and community dining hall allotment.',
    reviewer: secretaryUser._id,
    reviewNotes: 'Documents verified and certified by Secretary.',
    decision: 'Hall allotted and Nikah certificate scheduled',
    decisionAt: new Date(),
  });

  const app4 = await Application.create({
    applicationNumber: 'APP-2026-01004',
    applicant: memberUser._id,
    family: familyRashid._id,
    type: 'WELFARE',
    status: 'PENDING',
    title: 'Emergency Monsoon Roof Repairs Assistance',
    description: 'Heavy rains caused roof leakage, urgent repair aid required.',
    requestedAmount: 8500,
  });

  const app5 = await Application.create({
    applicationNumber: 'APP-2026-01005',
    applicant: memberUser._id,
    family: familyRashid._id,
    type: 'HAJJ',
    status: 'APPROVED',
    title: 'Hajj 2027 Group Registration',
    description: 'Registration for government quota / community Hajj group with Mahall endorsement.',
    reviewer: secretaryUser._id,
    reviewNotes: 'Endorsed and forwarded to state Hajj committee.',
    decision: 'Approved under Mahall Priority Quota',
    decisionAt: new Date(),
  });

  const app6 = await Application.create({
    applicationNumber: 'APP-2026-01006',
    applicant: memberUser._id,
    family: familyRashid._id,
    type: 'UMRAH',
    status: 'COMPLETED',
    title: 'Community Umrah Package 2026',
    description: 'Visa clearance and Mahall group travel verification.',
    reviewer: secretaryUser._id,
    reviewNotes: 'Completed journey and documentation verified.',
    decision: 'Completed successfully',
    decisionAt: new Date(Date.now() - 30 * 86400000),
  });

  await ApplicationHistory.create([
    {
      applicationId: app1._id,
      changedBy: memberUser._id,
      oldStatus: 'PENDING',
      newStatus: 'PENDING',
      comment: 'Application submitted with hospital estimate certificate',
      timestamp: new Date(Date.now() - 3 * 86400000),
    },
    {
      applicationId: app1._id,
      changedBy: welfareOfficerUser._id,
      oldStatus: 'PENDING',
      newStatus: 'UNDER_REVIEW',
      comment: 'Reviewed by Welfare committee subcommittee',
      timestamp: new Date(Date.now() - 2 * 86400000),
    },
    {
      applicationId: app1._id,
      changedBy: welfareOfficerUser._id,
      oldStatus: 'UNDER_REVIEW',
      newStatus: 'APPROVED',
      comment: 'Assistance approved for ₹10,000 disbursement',
      timestamp: new Date(),
    },
    {
      applicationId: app2._id,
      changedBy: memberUser._id,
      oldStatus: 'PENDING',
      newStatus: 'PENDING',
      comment: 'Application submitted online',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      applicationId: app2._id,
      changedBy: welfareOfficerUser._id,
      oldStatus: 'PENDING',
      newStatus: 'UNDER_REVIEW',
      comment: 'Verification call initiated with student guardian',
      timestamp: new Date(),
    },
  ]);

  console.log('📚 Creating Madrasa Institutions, Faculty & Students (Census)...');
  // 1. Madrasa Institutions in this Mahallu
  const m1 = await Madrasa.create({
    name: 'Al-Noor Central Madrasa',
    code: 'MDR-01',
    regNumber: 'SKIMVB-412',
    board: 'Samastha Kerala Islam Matha Vidyabhyasa Board',
    location: 'Central Ward (Masjid Complex)',
    establishedYear: 1988,
    sadarUsthad: 'Usthad Zainul Abideen Faizy',
    phone: '+91 9847111221',
    email: 'alnoor.madrasa@mahallconnect.org',
    timings: '06:30 AM – 08:30 AM',
    status: 'ACTIVE',
    description: 'Main central madrasa operating from 1st standard to 10th standard with comprehensive Islamic curriculum.',
  });

  const m2 = await Madrasa.create({
    name: 'Badrul Huda Branch Madrasa',
    code: 'MDR-02',
    regNumber: 'SKIMVB-680',
    board: 'Samastha Kerala Islam Matha Vidyabhyasa Board',
    location: 'North Ward (Badr Nagar)',
    establishedYear: 2004,
    sadarUsthad: 'Usthad K.V. Hamza Musliyar',
    phone: '+91 9847111222',
    email: 'badrulhuda@mahallconnect.org',
    timings: '06:45 AM – 08:30 AM',
    status: 'ACTIVE',
    description: 'Ward branch madrasa catering to students from North Mahallu up to 7th standard.',
  });

  const m3 = await Madrasa.create({
    name: 'Darul Uloom Hifzul Quran Academy',
    code: 'MDR-03',
    regNumber: 'SKIMVB-915',
    board: 'Samastha Kerala Islam Matha Vidyabhyasa Board',
    location: 'West Ward (Madrasa Building 2)',
    establishedYear: 2012,
    sadarUsthad: 'Hafiz Anas Al-Qasimi',
    phone: '+91 9847111223',
    email: 'darululoom.hifz@mahallconnect.org',
    timings: '05:30 AM – 08:00 AM & 04:30 PM - 06:30 PM',
    status: 'ACTIVE',
    description: 'Tahfeezul Quran & Tajweed Academy for full-time and part-time Hifz memorization.',
  });

  // 2. Madrasa Faculty (Usthads)
  await MadrasaTeacher.create({
    madrasaId: m1._id,
    name: 'Usthad Zainul Abideen Faizy',
    designation: 'Sadar Usthad (Headmaster)',
    phone: '+91 9847111201',
    email: 'zainul.abideen@mahallconnect.org',
    qualification: 'Faizy, MA Arabic, Board Certified Headmaster',
    subjects: ['Tafseer', 'Fiqh', 'Arabic Literature'],
    joiningDate: new Date('2018-05-15'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m1._id,
    name: 'Usthad Abdul Basheer',
    designation: 'Mudarris (Senior Teacher)',
    phone: '+91 9847111202',
    qualification: 'Aalim, Board Certified',
    subjects: ['Hadees', 'Fiqh', 'Tajweed'],
    joiningDate: new Date('2020-06-01'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m1._id,
    name: 'Usthad Farooq Faizy',
    designation: 'Mudarris',
    phone: '+91 9847111203',
    qualification: 'Faizy, BA History',
    subjects: ['Tareekh (Islamic History)', 'Akhlaq'],
    joiningDate: new Date('2021-06-01'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m2._id,
    name: 'Usthad K.V. Hamza Musliyar',
    designation: 'Sadar Usthad (Branch In-charge)',
    phone: '+91 9847111204',
    qualification: 'Musliyar, Board Senior Certified',
    subjects: ['Quran', 'Fiqh', 'Dua & Adab'],
    joiningDate: new Date('2019-06-01'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m2._id,
    name: 'Usthad Rasheed Saqafi',
    designation: 'Mudarris',
    phone: '+91 9847111205',
    qualification: 'Saqafi, Afzal-ul-Ulama',
    subjects: ['Aqeedah', 'Lisan-ul-Quran'],
    joiningDate: new Date('2022-06-01'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m3._id,
    name: 'Hafiz Anas Al-Qasimi',
    designation: 'Chief Tahfeez Instructor',
    phone: '+91 9847111206',
    qualification: 'Hafiz-e-Quran, Qasimi, Sanad in Hafs',
    subjects: ['Hifz', 'Tajweed-e-Kabeer', 'Mutashabihat'],
    joiningDate: new Date('2021-08-01'),
    status: 'ACTIVE',
  });

  await MadrasaTeacher.create({
    madrasaId: m3._id,
    name: 'Qari Salman',
    designation: 'Tajweed Specialist',
    phone: '+91 9847111207',
    qualification: 'Qari, Board Tajweed Master',
    subjects: ['Qira’at', 'Makharij', 'Quran Recitation'],
    joiningDate: new Date('2023-01-10'),
    status: 'ACTIVE',
  });

  // 3. Madrasa Classes (Some Madrasas have up to 10th, some up to 12th)
  console.log('🏫 Creating Madrasa Classes (Standard 1 to 10/12)...');
  const class3A = await MadrasaClass.create({
    madrasaId: m1._id,
    name: 'Class 3 - A',
    standard: 3,
    division: 'A',
    academicYear: '2026-2027',
    usthadInCharge: 'Usthad Abdul Basheer',
    roomNumber: 'Room 103',
    maxCapacity: 30,
    status: 'ACTIVE',
  });

  const class6B = await MadrasaClass.create({
    madrasaId: m1._id,
    name: 'Class 6 - B',
    standard: 6,
    division: 'B',
    academicYear: '2026-2027',
    usthadInCharge: 'Usthad Farooq Faizy',
    roomNumber: 'Room 204',
    maxCapacity: 35,
    status: 'ACTIVE',
  });

  // Additional standards for Al-Noor Central Madrasa (1 to 10)
  const remainingStandards = [1, 2, 4, 5, 7, 8, 9, 10];
  for (const std of remainingStandards) {
    await MadrasaClass.create({
      madrasaId: m1._id,
      name: `Class ${std} - A`,
      standard: std,
      division: 'A',
      academicYear: '2026-2027',
      usthadInCharge: std === 10 ? 'Usthad Zainul Abideen Faizy' : 'Usthad Mudarris Staff',
      roomNumber: `Room ${std + 100}`,
      maxCapacity: 35,
      status: 'ACTIVE',
    });
  }

  // Branch Madrasa Badrul Huda (1 to 7)
  for (let std = 1; std <= 7; std++) {
    await MadrasaClass.create({
      madrasaId: m2._id,
      name: `Class ${std}`,
      standard: std,
      division: 'A',
      academicYear: '2026-2027',
      usthadInCharge: 'Usthad K.V. Hamza Musliyar',
      roomNumber: `Branch R-${std}`,
      maxCapacity: 25,
      status: 'ACTIVE',
    });
  }

  // 4. Enrolled Madrasa Students
  const maryam = await MadrasaStudent.create({
    madrasaId: m1._id,
    admissionNumber: 'MDR-2026-101',
    name: 'Maryam Al-Rashid',
    memberId: members[3]._id,
    familyId: familyRashid._id,
    classId: class3A._id,
    standard: 3,
    division: 'A',
    rollNumber: '08',
    dateOfBirth: new Date('2017-08-18'),
    gender: 'FEMALE',
    guardianName: 'Ahmed Al-Rashid',
    guardianPhone: '+91 9847111001',
    status: 'ACTIVE',
  });

  const zaid = await MadrasaStudent.create({
    madrasaId: m1._id,
    admissionNumber: 'MDR-2026-102',
    name: 'Zaid Al-Rashid',
    memberId: members[2]._id,
    familyId: familyRashid._id,
    classId: class6B._id,
    standard: 6,
    division: 'B',
    rollNumber: '14',
    dateOfBirth: new Date('2014-03-10'),
    gender: 'MALE',
    guardianName: 'Ahmed Al-Rashid',
    guardianPhone: '+91 9847111001',
    status: 'ACTIVE',
  });

  const bilal = await MadrasaStudent.create({
    madrasaId: m1._id,
    admissionNumber: 'MDR-2026-103',
    name: 'Bilal Ba-Hammam',
    memberId: members[8]._id,
    familyId: familyHammam._id,
    standard: 7,
    division: 'A',
    dateOfBirth: new Date('2011-12-05'),
    gender: 'MALE',
    guardianName: 'Ibrahim Ba-Hammam',
    guardianPhone: '+91 9847111002',
    status: 'ACTIVE',
  });

  await MadrasaStudent.create([
    {
      madrasaId: m1._id,
      admissionNumber: 'MDR-2026-104',
      name: 'Fatima Al-Rashid',
      familyId: familyRashid._id,
      standard: 1,
      division: 'A',
      dateOfBirth: new Date('2019-04-12'),
      gender: 'FEMALE',
      guardianName: 'Ahmed Al-Rashid',
      guardianPhone: '+91 9847111001',
      status: 'ACTIVE',
    },
    {
      madrasaId: m2._id,
      admissionNumber: 'MDR-2026-201',
      name: 'Yusuf Hamza',
      familyId: familyHammam._id,
      standard: 2,
      division: 'A',
      dateOfBirth: new Date('2018-09-20'),
      gender: 'MALE',
      guardianName: 'Ibrahim Ba-Hammam',
      guardianPhone: '+91 9847111002',
      status: 'ACTIVE',
    },
    {
      madrasaId: m2._id,
      admissionNumber: 'MDR-2026-202',
      name: 'Aisha Siddiqa',
      standard: 4,
      division: 'A',
      dateOfBirth: new Date('2016-02-14'),
      gender: 'FEMALE',
      guardianName: 'Mustafa K.P.',
      guardianPhone: '+91 9847222333',
      status: 'ACTIVE',
    },
    {
      madrasaId: m3._id,
      admissionNumber: 'MDR-2026-301',
      name: 'Muhammed Rayan',
      standard: 5,
      dateOfBirth: new Date('2013-05-18'),
      gender: 'MALE',
      guardianName: 'Abdul Gafoor',
      guardianPhone: '+91 9847333444',
      status: 'ACTIVE',
    },
    {
      madrasaId: m3._id,
      admissionNumber: 'MDR-2026-302',
      name: 'Ibrahim Khalil',
      standard: 3,
      dateOfBirth: new Date('2015-11-22'),
      gender: 'MALE',
      guardianName: 'Khalil Rahman',
      guardianPhone: '+91 9847444555',
      status: 'ACTIVE',
    },
  ]);

  // 5. Class Timetables (Uploaded by Secretary)
  console.log('📅 Uploading Class Timetables...');
  await MadrasaTimetable.create({
    madrasaId: m1._id,
    classId: class3A._id,
    className: 'Class 3 - A',
    title: 'Class 3-A Standard Academic Timetable',
    uploadedBy: 'Madrasa Secretary (Zubair Al-Katib)',
    schedule: [
      { day: 'Monday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Quran Recitation & Tajweed', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Monday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Fiqh (Basic Islamic Rules)', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Monday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Dua & Morning Adhkar', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Tuesday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Quran Recitation & Tajweed', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Tuesday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Aqeedah (Faith & Tawheed)', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Tuesday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Akhlaq & Islamic Manners', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Wednesday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Hifz Revision (Juz Amma)', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Wednesday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Thareekh (Seerah of Prophets)', usthadName: 'Usthad Farooq Faizy' },
      { day: 'Wednesday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Lisan-ul-Quran (Arabic Basics)', usthadName: 'Usthad Zainul Abideen Faizy' },

      { day: 'Thursday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Quran Recitation & Tajweed', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Thursday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Fiqh Practical (Wudu & Salah)', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Thursday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Islamic Songs & Speeches', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Saturday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Quran Examination Practice', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Saturday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Weekly Assessment', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Saturday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Moral Guidance & Story Hour', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Sunday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Tajweed Rules & Makharij', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Sunday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Arabic Writing', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Sunday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'General Knowledge & Quiz', usthadName: 'Usthad Farooq Faizy' },
    ],
    notes: 'Students must carry their Samastha syllabus textbook and Amma Juz daily. Friday is weekly holiday.',
    status: 'ACTIVE',
  });

  await MadrasaTimetable.create({
    madrasaId: m1._id,
    classId: class6B._id,
    className: 'Class 6 - B',
    title: 'Class 6-B Academic Timetable',
    uploadedBy: 'Madrasa Secretary (Zubair Al-Katib)',
    schedule: [
      { day: 'Monday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Thafseer-ul-Quran', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Monday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Fiqh-ul-Islami', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Monday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Thareekh-e-Islam', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Tuesday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Hadees & Musthalah', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Tuesday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Aqeedath-ul-Muslimeen', usthadName: 'Usthad Farooq Faizy' },
      { day: 'Tuesday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Arabic Grammar (Nahw & Sarf)', usthadName: 'Usthad Abdul Basheer' },

      { day: 'Wednesday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Thafseer-ul-Quran', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Wednesday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Thareekh & Khilafath', usthadName: 'Usthad Farooq Faizy' },
      { day: 'Wednesday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Akhlaq & Tasawwuf', usthadName: 'Usthad Abdul Basheer' },

      { day: 'Thursday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Hadees Shareef', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Thursday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Fiqh Ahkam-us-Salah', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Thursday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Arabic Composition', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Saturday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Tajweed Mastery', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Saturday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Weekly Written Test', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Saturday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Debate & Public Speaking', usthadName: 'Usthad Farooq Faizy' },

      { day: 'Sunday', periodNumber: 1, timeSlot: '06:30 AM – 07:10 AM', subject: 'Quran Hifz Revision', usthadName: 'Usthad Abdul Basheer' },
      { day: 'Sunday', periodNumber: 2, timeSlot: '07:10 AM – 07:50 AM', subject: 'Fiqh Case Studies', usthadName: 'Usthad Zainul Abideen Faizy' },
      { day: 'Sunday', periodNumber: 3, timeSlot: '07:50 AM – 08:30 AM', subject: 'Career & Islamic Ethics', usthadName: 'Usthad Farooq Faizy' },
    ],
    notes: 'Preparatory timetable for mid-term board assessment. Friday holiday.',
    status: 'ACTIVE',
  });

  // 6. Exam Results (Entered by Madrasa Manager)
  console.log('📝 Recording Madrasa Exam Results...');
  await MadrasaExamResult.create({
    madrasaId: m1._id,
    studentId: maryam._id,
    classId: class3A._id,
    standard: 3,
    examName: 'First Term Board Assessment 2026',
    academicYear: '2026-2027',
    examDate: new Date('2026-08-25'),
    enteredBy: 'Madrasa Manager (Faizy Desk)',
    subjects: [
      { subject: 'Quran Recitation & Tajweed', maxMarks: 50, marksObtained: 48, grade: 'A+' },
      { subject: 'Fiqh (Islamic Jurisprudence)', maxMarks: 50, marksObtained: 45, grade: 'A' },
      { subject: 'Thareekh (Islamic History)', maxMarks: 50, marksObtained: 47, grade: 'A+' },
      { subject: 'Akhlaq & Islamic Manners', maxMarks: 50, marksObtained: 50, grade: 'A+' },
      { subject: 'Lisan-ul-Quran (Arabic)', maxMarks: 50, marksObtained: 44, grade: 'A' },
    ],
    totalMaxMarks: 250,
    totalMarksObtained: 234,
    percentage: 93.6,
    overallGrade: 'A+ Distinction',
    resultStatus: 'PASSED',
    rank: 2,
    remarks: 'MashaAllah, exceptional performance in Quran recitation and moral conduct. Top 2 in Class 3-A.',
  });

  await MadrasaExamResult.create({
    madrasaId: m1._id,
    studentId: zaid._id,
    classId: class6B._id,
    standard: 6,
    examName: 'First Term Board Assessment 2026',
    academicYear: '2026-2027',
    examDate: new Date('2026-08-25'),
    enteredBy: 'Madrasa Manager (Faizy Desk)',
    subjects: [
      { subject: 'Thafseer & Tajweed', maxMarks: 50, marksObtained: 46, grade: 'A' },
      { subject: 'Fiqh-ul-Islami', maxMarks: 50, marksObtained: 42, grade: 'A' },
      { subject: 'Hadees & Sunnah', maxMarks: 50, marksObtained: 44, grade: 'A' },
      { subject: 'Thareekh-e-Islam', maxMarks: 50, marksObtained: 40, grade: 'B+' },
      { subject: 'Arabic Grammar (Nahw)', maxMarks: 50, marksObtained: 39, grade: 'B' },
    ],
    totalMaxMarks: 250,
    totalMarksObtained: 211,
    percentage: 84.4,
    overallGrade: 'A First Class',
    resultStatus: 'PASSED',
    rank: 5,
    remarks: 'Very good understanding of Fiqh and Hadees. Usthad advises a bit more handwriting practice in Arabic.',
  });

  // 7. Monthly Student Fees & Fee Alert
  console.log('💳 Generating Madrasa Monthly Fees & Fee Alerts...');
  // Maryam: August PAID, September PENDING (Triggers Fee Alert for Parent!)
  await MadrasaFee.create({
    madrasaId: m1._id,
    studentId: maryam._id,
    familyId: familyRashid._id,
    month: '2026-08',
    amount: 200,
    feeType: 'MONTHLY_TUITION',
    dueDate: new Date('2026-08-10'),
    paidDate: new Date('2026-08-05'),
    status: 'PAID',
    paymentMethod: 'UPI',
    receiptNumber: 'MDR-2026-AUG-101',
    notes: 'Paid on time via MahallConnect app.',
  });

  await MadrasaFee.create({
    madrasaId: m1._id,
    studentId: maryam._id,
    familyId: familyRashid._id,
    month: '2026-09',
    amount: 200,
    feeType: 'MONTHLY_TUITION',
    dueDate: new Date('2026-09-30'),
    status: 'PENDING',
    notes: 'Monthly madrasa tuition fee pending.',
  });

  // Zaid: August PAID, September PAID
  await MadrasaFee.create({
    madrasaId: m1._id,
    studentId: zaid._id,
    familyId: familyRashid._id,
    month: '2026-08',
    amount: 200,
    feeType: 'MONTHLY_TUITION',
    dueDate: new Date('2026-08-10'),
    paidDate: new Date('2026-08-05'),
    status: 'PAID',
    paymentMethod: 'UPI',
    receiptNumber: 'MDR-2026-AUG-102',
    notes: 'Paid via portal.',
  });

  await MadrasaFee.create({
    madrasaId: m1._id,
    studentId: zaid._id,
    familyId: familyRashid._id,
    month: '2026-09',
    amount: 200,
    feeType: 'MONTHLY_TUITION',
    dueDate: new Date('2026-09-30'),
    paidDate: new Date('2026-09-12'),
    status: 'PAID',
    paymentMethod: 'CASH',
    receiptNumber: 'MDR-2026-SEP-102',
    notes: 'Paid in office.',
  });

  // 8. Student Attendance Logs
  console.log('📋 Logging Student Attendance...');
  const pastDates = [
    '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24',
    '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19',
  ];
  for (const dateStr of pastDates) {
    await MadrasaAttendance.create({
      madrasaId: m1._id,
      studentId: maryam._id,
      classId: class3A._id,
      date: new Date(dateStr),
      status: 'PRESENT',
    });

    await MadrasaAttendance.create({
      madrasaId: m1._id,
      studentId: zaid._id,
      classId: class6B._id,
      date: new Date(dateStr),
      status: dateStr === '2026-09-18' ? 'ABSENT' : 'PRESENT',
      remarks: dateStr === '2026-09-18' ? 'Medical leave requested by father' : undefined,
    });
  }

  // 9. Official Madrasa Announcements for Parents/Students
  console.log('📢 Publishing Official Madrasa Announcements...');
  await MadrasaAnnouncement.create([
    {
      madrasaId: m1._id,
      title: 'First Term Board Model Examinations Schedule Announced',
      content: 'The Samastha SKIMVB First Term Examinations for Standards 1 through 10 will commence on October 12, 2026. Parents are requested to ensure regular morning attendance and homework revision.',
      category: 'EXAM',
      targetAudience: 'ALL',
      classTarget: 'All Classes',
      publishedBy: 'Sadar Usthad Zainul Abideen Faizy',
      publishedAt: new Date('2026-09-20'),
      priority: 'HIGH',
      status: 'ACTIVE',
    },
    {
      madrasaId: m1._id,
      title: 'Annual Parent-Teacher Meeting (PTM) & Progress Report Card Distribution',
      content: 'A general meeting for parents of students in Classes 1 to 10 is scheduled for next Saturday at 09:00 AM at the Madrasa Auditorium. Mark sheets and teacher feedback will be handed over.',
      category: 'PARENT_MEETING',
      targetAudience: 'PARENTS',
      classTarget: 'All Classes',
      publishedBy: 'Madrasa Secretary (Zubair Al-Katib)',
      publishedAt: new Date('2026-09-22'),
      priority: 'HIGH',
      status: 'ACTIVE',
    },
    {
      madrasaId: m1._id,
      title: 'Monthly Student Fee Reminder for September 2026',
      content: 'Respected parents: Monthly madrasa education fee for September is due on September 30. You can pay conveniently through the MahallConnect Member Portal or directly at the Madrasa office.',
      category: 'FEE_ALERT',
      targetAudience: 'PARENTS',
      classTarget: 'All Classes',
      publishedBy: 'Madrasa Desk',
      publishedAt: new Date('2026-09-23'),
      priority: 'MEDIUM',
      status: 'ACTIVE',
    },
  ]);

  console.log('🕌 Creating Mosque Profile & Timings...');
  await Mosque.create({
    name: 'Al-Noor Central Juma Masjid',
    address: 'Mosque Road, North Ward, Mahall District, Kozhikode',
    phone: '+91 495 2345678',
    email: 'masjid@mahallconnect.org',
    imamName: 'Usthad Abdullah Faizy',
    khatibName: 'Usthad Abdullah Faizy',
    muezzinName: 'Bilal Ahmed',
    capacity: 1200,
    prayerTimings: {
      fajr: '05:15 AM',
      dhuhr: '12:35 PM',
      asr: '04:15 PM',
      maghrib: '06:35 PM',
      isha: '08:00 PM',
      jumah: '12:45 PM',
    },
    jumahDetails: {
      khatib: 'Usthad Abdullah Faizy',
      topic: 'Strengthening Mahall Brotherhood & Mutual Support',
      khutbahTime: '12:30 PM',
      prayerTime: '01:00 PM',
    },
    programs: [
      {
        title: 'Daily Darsul Quran & Tafsir',
        dayTime: 'Daily after Fajr (30 mins)',
        instructor: 'Usthad Abdullah Faizy',
        description: 'Tafseer of selected Surahs with practical community reflections',
      },
      {
        title: "Women's Dars Circle",
        dayTime: 'Every Wednesday 10:00 AM - 11:30 AM',
        instructor: 'Ustaza Hana',
        description: 'Weekly Islamic studies class for women conducted in the women prayer wing',
      },
      {
        title: 'Weekly Hadith Majlis (Riyadh us-Saliheen)',
        dayTime: 'Every Sunday after Isha',
        instructor: 'Usthad Abdullah Faizy',
        description: 'Moral traditions of the Prophet (pbuh) and collective du’a',
      },
      {
        title: 'Youth Tajweed & Recitation Workshop',
        dayTime: 'Every Saturday 05:00 PM - 06:00 PM',
        instructor: 'Usthad Sulaiman',
        description: 'Phonetics, makharij, and Quran recitation mastery for youth',
      },
      {
        title: 'Friday Pre-Khutbah Talk',
        dayTime: 'Every Friday 12:15 PM',
        instructor: 'Usthad Abdullah Faizy',
        description: 'Contemporary community ethics and guidance prior to Jumua Khutbah',
      },
      {
        title: 'Basic Fiqh and Purification for Beginners',
        dayTime: 'Every Thursday 07:30 PM - 08:30 PM',
        instructor: 'Usthad Farooq Faizy',
        description: 'Practical guide to prayers, fasting, and cleanliness for beginners',
      },
    ],
  });

  console.log('📅 Creating Events (Upcoming & Completed)...');
  await Event.create([
    {
      title: 'Annual Mahall General Body Meeting',
      description: 'Yearly general body meeting to review activities, audited financial statements, and elect new committee members.',
      category: 'COMMUNITY',
      startDate: new Date('2026-09-25T19:30:00'),
      endDate: new Date('2026-09-25T21:30:00'),
      location: 'Mahall Hall, Al-Noor Mahall',
      capacity: 300,
      status: 'UPCOMING',
      createdBy: secretaryUser._id,
    },
    {
      title: 'Community Blood Donation Camp',
      description: 'Annual blood donation camp in coordination with District Blood Bank. All healthy adults are welcome to participate.',
      category: 'COMMUNITY',
      startDate: new Date('2026-10-05T09:00:00'),
      endDate: new Date('2026-10-05T16:00:00'),
      location: 'Mahall Community Center',
      capacity: 100,
      status: 'UPCOMING',
      createdBy: secretaryUser._id,
    },
    {
      title: 'Islamic Quiz Competition - Madrasa',
      description: 'Inter-class Islamic knowledge competition for all Madrasa students. Prizes for top 3 students in each category.',
      category: 'EDUCATIONAL',
      startDate: new Date('2026-10-12T10:00:00'),
      endDate: new Date('2026-10-12T13:00:00'),
      location: 'Madrasa Auditorium',
      capacity: 150,
      status: 'UPCOMING',
      createdBy: madrasaAdminUser._id,
    },
    {
      title: 'Jumua Khutbah - Special Community Program',
      description: 'Special Friday program with visiting scholar on Islamic family values and modern challenges.',
      category: 'RELIGIOUS',
      startDate: new Date('2026-09-20T13:00:00'),
      endDate: new Date('2026-09-20T14:30:00'),
      location: 'Al-Noor Mosque Main Hall',
      capacity: 500,
      status: 'UPCOMING',
      createdBy: imamUser._id,
    },
    {
      title: 'Eid Celebration 2026',
      description: 'Community Eid ul-Adha celebration with prayers, community feast, and family fellowship.',
      category: 'RELIGIOUS',
      startDate: new Date('2026-06-17T07:00:00'),
      endDate: new Date('2026-06-17T12:00:00'),
      location: 'Mahall Grounds, Al-Noor Mahall',
      capacity: 600,
      status: 'COMPLETED',
      createdBy: secretaryUser._id,
    },
    {
      title: 'Ramadan Iftar Program - Community',
      description: 'Daily community Iftar during Ramadan. Serving all community members, travelers, and volunteers.',
      category: 'RELIGIOUS',
      startDate: new Date('2026-03-15T18:30:00'),
      endDate: new Date('2026-03-15T20:00:00'),
      location: 'Mahall Community Dining Hall',
      capacity: 400,
      status: 'COMPLETED',
      createdBy: secretaryUser._id,
    },
    {
      title: 'Mahall Youth Sports Day',
      description: 'Annual sports competition for youth members including football, cricket, and athletics.',
      category: 'YOUTH',
      startDate: new Date('2026-10-25T08:00:00'),
      endDate: new Date('2026-10-25T18:00:00'),
      location: 'Mahall Sports Ground',
      capacity: 200,
      status: 'UPCOMING',
      createdBy: secretaryUser._id,
    },
    {
      title: 'First Aid & Emergency Response Training',
      description: 'Practical workshop for Mahall volunteers on emergency first aid, CPR, and disaster readiness.',
      category: 'COMMUNITY',
      startDate: new Date('2026-10-18T10:00:00'),
      endDate: new Date('2026-10-18T16:00:00'),
      location: 'Community Center Seminar Hall',
      capacity: 50,
      status: 'UPCOMING',
      createdBy: secretaryUser._id,
    },
  ]);

  console.log('🤝 Creating Volunteers...');
  await Volunteer.create([
    {
      name: 'Ahmed Al-Rashid',
      phone: '+91 9847111001',
      userId: memberUser._id,
      memberId: members[0]._id,
      bloodGroup: 'O+',
      categories: ['EMERGENCY', 'EVENT'],
      availability: 'WEEKENDS',
      emergencyVolunteer: true,
      status: 'ACTIVE',
    },
    {
      name: 'Salim V.K.',
      phone: '+91 9847222333',
      bloodGroup: 'B+',
      categories: ['BLOOD_DONATION', 'WELFARE'],
      availability: 'ON_CALL',
      emergencyVolunteer: true,
      status: 'ACTIVE',
    },
  ]);

  console.log('🏢 Creating Assets & Properties...');
  await Asset.create([
    {
      name: 'Al-Noor Central Juma Masjid Complex',
      type: 'BUILDING',
      description: 'Main two-floor prayer hall with ablution facilities, minarets, and courtyard',
      location: 'Mosque Road, North Ward',
      estimatedValue: 45000000,
      status: 'OPERATIONAL',
    },
    {
      name: 'Commercial Shop Unit 1',
      type: 'RENTAL_SHOP',
      description: 'Ground floor road-facing shop leased to Al-Madeena Medicals',
      location: 'Masjid Commercial Complex, Shop 1',
      estimatedValue: 2500000,
      monthlyRent: 8500,
      tenantName: 'K. Mohammed Shafeeq',
      tenantPhone: '+91 9847333444',
      status: 'RENTED',
    },
    {
      name: 'Commercial Shop Unit 2',
      type: 'RENTAL_SHOP',
      description: 'Ground floor retail space leased to City Bookstall',
      location: 'Masjid Commercial Complex, Shop 2',
      estimatedValue: 2200000,
      monthlyRent: 7000,
      tenantName: 'Abdul Salam',
      tenantPhone: '+91 9847555666',
      status: 'RENTED',
    },
    {
      name: 'Commercial Shop Unit 3',
      type: 'RENTAL_SHOP',
      description: 'First floor shop leased to Al-Madeena Bakery & Confectionery',
      location: 'Masjid Commercial Complex, Shop 3',
      estimatedValue: 2400000,
      monthlyRent: 8000,
      tenantName: 'M. Al-Madeena Bakery',
      tenantPhone: '+91 9847666777',
      status: 'RENTED',
    },
    {
      name: 'Commercial Shop Unit 4',
      type: 'RENTAL_SHOP',
      description: 'Ground floor corner retail shop leased to Noor Tailors',
      location: 'Masjid Commercial Complex, Shop 4',
      estimatedValue: 2000000,
      monthlyRent: 6500,
      tenantName: 'Noor Tailors',
      tenantPhone: '+91 9847888999',
      status: 'RENTED',
    },
    {
      name: 'Mahall Community Auditorium & Dining Hall',
      type: 'BUILDING',
      description: 'Multi-purpose 400-seat community auditorium for weddings, educational events, and general body meetings',
      location: 'Mahall Campus, East Wing',
      estimatedValue: 18000000,
      status: 'OPERATIONAL',
    },
    {
      name: 'Al-Noor Qabaristan & Cemetery Grounds',
      type: 'LAND',
      description: 'Main 2.5-acre community cemetery grounds with organized burial plots and boundary fencing',
      location: 'Qabaristan Road, West Ward',
      estimatedValue: 12000000,
      status: 'OPERATIONAL',
    },
    {
      name: 'Solar Rooftop Generation Unit (25 kW)',
      type: 'EQUIPMENT',
      description: 'Grid-connected solar panel rooftop generation system providing green power for Masjid and Madrasa',
      location: 'Masjid Rooftop',
      estimatedValue: 1800000,
      status: 'OPERATIONAL',
    },
  ]);

  console.log('👥 Creating Committee Members & Meetings...');
  await CommitteeMember.create([
    {
      name: 'Haji Abdul Kareem',
      designation: 'PRESIDENT',
      phone: '+91 9847001122',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Dr. Tariq Jamil',
      designation: 'VICE_PRESIDENT',
      phone: '+91 9847005566',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Zubair Al-Katib',
      designation: 'SECRETARY',
      phone: '+91 9847002233',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'K. Mohammed Shafeeq',
      designation: 'JOINT_SECRETARY',
      phone: '+91 9847333444',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Mustafa Al-Amin',
      designation: 'TREASURER',
      phone: '+91 9847003344',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Sayyid Munawwar Thangal',
      designation: 'MEMBER',
      phone: '+91 9847111024',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Cheriya Koya',
      designation: 'MEMBER',
      phone: '+91 9847111031',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Tariq Hassan',
      designation: 'MEMBER',
      phone: '+91 9847111003',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Ahmed Al-Rashid',
      designation: 'MEMBER',
      phone: '+91 9847111001',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      name: 'Usman Kutty',
      designation: 'MEMBER',
      phone: '+91 9847111004',
      termStart: new Date('2025-01-01'),
      termEnd: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
  ]);

  await CommitteeMeeting.create([
    {
      title: 'Monthly Executive Committee Review',
      meetingDate: new Date(Date.now() + 4 * 86400000),
      location: 'Committee Boardroom',
      agenda: [
        'Approval of last month financial statement',
        'Review of Ramadan advance preparations',
        'Madrasa smart classroom upgrade proposal',
      ],
      resolutions: [],
      status: 'SCHEDULED',
    },
    {
      title: 'Annual Budget & Audit Review 2026',
      meetingDate: new Date(Date.now() - 25 * 86400000),
      location: 'Committee Boardroom',
      agenda: [
        'Presentation of audited accounts for FY 2025-26',
        'Welfare fund allocations for coming year',
        'Approval of Masjid roof maintenance tenders',
      ],
      resolutions: [
        'Unanimously approved audited financial statement',
        'Allocated ₹1,50,000 for emergency medical welfare fund',
        'Approved rooftop solar maintenance contract with SunPower Tech',
      ],
      status: 'COMPLETED',
    },
    {
      title: 'Madrasa Expansion & Staffing Strategy',
      meetingDate: new Date(Date.now() - 60 * 86400000),
      location: 'Madrasa Conference Room',
      agenda: [
        'Student intake review for academic year',
        'Appointment of additional Arabic faculty',
        'Parent-teacher council reconstitution',
      ],
      resolutions: [
        'Approved appointment of Usthad Farooq Faizy for Grade 6 Arabic',
        'Authorized purchase of 10 computer terminals for digital learning',
      ],
      status: 'COMPLETED',
    },
    {
      title: 'Annual General Body Preparatory Session',
      meetingDate: new Date(Date.now() + 18 * 86400000),
      location: 'Committee Boardroom',
      agenda: [
        'Drafting agenda for Annual General Body Meeting',
        'Voter roll verification and ward delegate lists',
        'Annual report publication timeline',
      ],
      resolutions: [],
      status: 'SCHEDULED',
    },
  ]);

  console.log('📢 Creating Announcements...');
  await Announcement.create([
    {
      title: 'Monthly Contribution Payment Reminder',
      content: 'Dear members, this is a reminder that September monthly contributions of ₹250 are due. Please clear dues via the online portal or at the Mahall office counter.',
      category: 'FINANCE',
      targetAudience: 'ALL',
      author: 'Treasurer Office',
      isPinned: true,
      publishedAt: new Date(Date.now() - 4 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'New Madrasa Batch Enrollment Open',
      content: 'Enrollment for the new academic batch is now open at Al-Noor Madrasa for students aged 5-16. Contact the Madrasa desk for registration and curriculum details.',
      category: 'GENERAL',
      targetAudience: 'ALL',
      author: 'Madrasa Administration',
      isPinned: false,
      publishedAt: new Date(Date.now() - 7 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'Welfare Applications Accepted - September 2026',
      content: 'Members in financial need may apply for Mahall welfare assistance for September. Applications will be processed promptly by the welfare subcommittee.',
      category: 'WELFARE',
      targetAudience: 'ALL',
      author: 'Welfare Committee',
      isPinned: false,
      publishedAt: new Date(Date.now() - 10 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'URGENT: Friday Prayer Timings Changed',
      content: 'Please note that Friday Jumua prayer timing will commence at 1:15 PM effective from this week. Adhan will be called at 1:00 PM.',
      category: 'PRAYER',
      targetAudience: 'ALL',
      author: 'Imam Office',
      isPinned: true,
      publishedAt: new Date(Date.now() - 2 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'Mosque Renovation Phase 2 Update',
      content: 'Phase 2 of the mosque renovation is progressing smoothly. The women prayer hall extension is scheduled for completion ahead of schedule. Thank you for your continued generous support.',
      category: 'GENERAL',
      targetAudience: 'ALL',
      author: 'Secretary',
      isPinned: false,
      publishedAt: new Date(Date.now() - 14 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'General Body Meeting - All Members Required',
      content: 'The Annual General Meeting of Al-Noor Mahall is scheduled for 25th September 2026. All member heads are requested to attend. Agenda includes annual report, financial review, and elections.',
      category: 'GENERAL',
      targetAudience: 'ALL',
      author: 'Secretary',
      isPinned: true,
      publishedAt: new Date(Date.now() - 5 * 86400000),
      status: 'ACTIVE',
    },
    {
      title: 'Hajj Group 2027 - Registration Opens',
      content: 'Registration for the Al-Noor Mahall Community Hajj Group 2027 is now open. Limited seats are available. Priority will be accorded to members performing their first Hajj.',
      category: 'GENERAL',
      targetAudience: 'ALL',
      author: 'Secretary',
      isPinned: false,
      publishedAt: new Date(Date.now() - 20 * 86400000),
      status: 'ACTIVE',
    },
  ]);

  console.log('🔔 Creating Notifications for Member...');
  await Notification.create([
    {
      recipient: memberUser._id,
      type: 'APPLICATION',
      title: 'Welfare Application Approved',
      message: 'Your application APP-2026-01001 for Medical Assistance has been approved for ₹10,000.',
      link: '/applications',
      read: false,
    },
    {
      recipient: memberUser._id,
      type: 'PAYMENT',
      title: 'Payment Receipt Issued',
      message: 'Payment of ₹250 for September 2026 contribution verified. Receipt: RCP-2026-00381.',
      link: '/payments',
      read: true,
    },
  ]);

  console.log('🕋 Seeding Hajj & Umrah Travel Packages...');
  const hajjPost = await HajjUmrahPost.create({
    title: 'Al-Haramain 2027 Executive Hajj Group',
    type: 'HAJJ',
    travelsName: 'Al-Haramain Hajj & Umrah Services',
    contactPerson: 'Janab Musthafa Haji',
    contactPhone: '+91 98470 12345',
    contactEmail: 'desk@alharamaintravels.com',
    totalSlots: 20,
    bookedSlots: 2,
    estimatedPrice: '₹3,50,000',
    departureDate: new Date('2027-05-20'),
    registrationDeadline: new Date('2027-02-28'),
    description: 'Special 20-slot group allotment from Al-Haramain Travels for our Mahallu members. Includes direct flights from Calicut, 5-Star clock tower accommodation in Makkah, and complete scholar mentorship throughout the pilgrimage.',
    features: [
      'Direct flight Calicut - Jeddah',
      '5-Star hotel facing Haram in Makkah',
      'Full guidance by learned Islamic scholars',
      'Daily 3-time South Indian buffet meals',
      'Ziyarat of sacred places in Makkah & Madinah',
    ],
    status: 'OPEN',
    createdBy: users[1]._id,
  });

  await HajjUmrahPost.create({
    title: 'Ramadan 1448 Special Umrah Package',
    type: 'UMRAH',
    travelsName: 'Malabar International Travels',
    contactPerson: 'K.P. Sulaiman',
    contactPhone: '+91 94471 88990',
    contactEmail: 'info@malabartravels.in',
    totalSlots: 25,
    bookedSlots: 4,
    estimatedPrice: '₹1,20,000',
    departureDate: new Date('2027-03-01'),
    registrationDeadline: new Date('2027-01-31'),
    description: '15-Day spiritual Ramadan Umrah package including the blessed last ten nights in the Two Holy Mosques.',
    features: [
      '15 Days comprehensive package',
      'Walking distance hotels in Makkah & Madinah',
      'Daily Iftar & Suhoor arranged',
      'Experienced group Ameer',
    ],
    status: 'OPEN',
    createdBy: users[1]._id,
  });

  await HajjUmrahRegistration.create({
    postId: hajjPost._id,
    applicantName: 'Ahmed Al-Rashid',
    applicantPhone: '+91 98765 43210',
    applicantEmail: 'member@mahallconnect.org',
    seats: 2,
    registrationRef: 'HAJJ-2027-8492',
    status: 'REGISTERED',
    emailSent: true,
    emailSentAt: new Date(),
    travelsContactShared: true,
    userId: memberUser._id,
  });

  console.log('✅ Database successfully seeded with rich relational data!');
  console.log('------------------------------------------------------------');
  console.log('Default Seed Accounts (Password for all: Password@123):');
  console.log('1. Super Admin:      admin@mahallconnect.org');
  console.log('2. Secretary:        secretary@mahallconnect.org');
  console.log('3. Treasurer:        treasurer@mahallconnect.org');
  console.log('4. Imam:             imam@mahallconnect.org');
  console.log('5. Madrasa Admin:    madrasa@mahallconnect.org');
  console.log('6. Welfare Officer:  welfare@mahallconnect.org');
  console.log('7. Committee Member: committee@mahallconnect.org');
  console.log('8. Member:           member@mahallconnect.org (Ahmed Al-Rashid, FAM-1001)');
  console.log('------------------------------------------------------------');
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
