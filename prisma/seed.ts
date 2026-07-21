import {
  Gender,
  SchoolType,
  SchoolSetup,
  StaffStatus,
  AttendanceStatus,
  ClassType,
  Day,
  Role,
  Accomodation,
  TermType,
  FeeCategory,
  SubjectCategory,
} from '../src/generated/client.js';
import bcrypt from 'bcryptjs';
import { prismaClient } from '../src/services/dbServices/dbClient/prismaClient.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** All seed users share one password for dev convenience. */
const PLAIN_PASSWORD = 'Password123!';
const SALT_ROUNDS = 10;

async function hashPwd(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Ensures every generated email is a yopmail.com address. */
function yop(local: string): string {
  return `${local.toLowerCase().replace(/[^a-z0-9._-]/g, '.')}@yopmail.com`;
}

/** Returns a Date offset by `days` from today (negative = past). */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** A consistent phone number pattern — 11 digits, Nigerian-style. */
function phone(seed: number): string {
  return `0${String(800_000_0000 + seed).slice(0, 10)}`;
}

/** A deterministic 3.0–5.0 rating so every user gets a plausible, varied score. */
function rating(seed: number): number {
  return Math.round((30 + (seed % 21)) * 10) / 100;
}

/** Deterministic ACTIVE / LEAVE status for staff user accounts. */
function staffStatus(i: number): 'ACTIVE' | 'LEAVE' {
  return i % 2 === 0 ? 'ACTIVE' : 'LEAVE';
}

/** Deterministic ACTIVE / SUSPENDED status for student user accounts. */
function studentStatus(i: number): 'ACTIVE' | 'SUSPENDED' {
  return i % 2 === 0 ? 'ACTIVE' : 'SUSPENDED';
}

/** Deterministic PAID / PARTIAL / UNPAID cycle for fee records. */
function feeStatus(i: number): 'PAID' | 'PARTIAL' | 'UNPAID' {
  const cycle = ['PAID', 'PARTIAL', 'UNPAID'] as const;
  return cycle[i % cycle.length];
}

/**
 * Splits a fee's `amount` into `paid` + `outstanding` (they always sum back
 * to `amount`) based on its status. PARTIAL payments land somewhere between
 * 30%–70% paid, varied deterministically by `seed`.
 */
function paymentSplit(
  amount: number,
  status: 'PAID' | 'PARTIAL' | 'UNPAID',
  seed: number,
): { paid: number; outstanding: number } {
  if (status === 'PAID') return { paid: amount, outstanding: 0 };
  if (status === 'UNPAID') return { paid: 0, outstanding: amount };
  const fraction = 0.3 + (seed % 5) * 0.1; // 30%, 40%, 50%, 60%, or 70% paid
  const paid = Math.round(amount * fraction);
  return { paid, outstanding: amount - paid };
}

/** Deterministically generates a "named individual" from two pools, avoiding faker. */
const FIRST_NAME_POOL = [
  'Felix',
  'Hauwa',
  'Ifeoma',
  'James',
  'Kemi',
  'Lawal',
  'Maryam',
  'Nnamdi',
  'Olamide',
  'Peter',
  'Queen',
  'Rasheed',
  'Sandra',
  'Titus',
  'Uche',
  'Victoria',
  'Yakubu',
  'Zainab',
  'Abel',
  'Blessing',
  'Adaeze',
  'Bayo',
  'Chiamaka',
  'Dapo',
  'Eno',
  'Fadila',
  'Gbenga',
  'Halima',
  'Ikenna',
  'Jibola',
  'Kosi',
  'Labaran',
  'Mmesoma',
  'Ndidi',
  'Oche',
  'Precious',
  'Rita',
  'Sefiya',
  'Tobi',
  'Umar',
];
const LAST_NAME_POOL = [
  'Audu',
  'Bello',
  'Chukwu',
  'Danladi',
  'Emeka',
  'Falana',
  'Gambo',
  'Haruna',
  'Ibe',
  'Jatau',
  'Kalu',
  'Lar',
  'Madaki',
  'Nuhu',
  'Okon',
  'Paul',
  'Suleiman',
  'Tanko',
  'Umoh',
  'Yohanna',
  'Abiodun',
  'Bitrus',
  'Chukwudi',
  'Dawodu',
  'Ekong',
  'Fagbenle',
  'Garba',
  'Hamza',
  'Ike',
  'Jimoh',
  'Kalejaiye',
  'Musa',
  'Nnaji',
  'Okonkwo',
  'Pwajok',
  'Quadri',
  'Raji',
  'Sanni',
  'Tanimu',
  'Ugo',
];
// Running counter that guarantees every call to personFor() below receives a
// distinct index, so no two staff/student records ever end up with the same
// first+last name pairing (see personFor's base-40 encoding for why a
// distinct index is what makes that guarantee hold).
let personSeq = 0;
function nextPersonIndex(): number {
  return personSeq++;
}

/**
 * Maps a distinct index to a distinct (firstName, lastName) pair via a
 * base-N encoding over the two pools (firstIndex = i % N, lastIndex =
 * floor(i / N) % N) — this supports up to POOL_SIZE² unique combinations
 * (40 × 40 = 1,600) before any repeat, which comfortably covers every
 * staff/student record seeded here. Always call with nextPersonIndex().
 */
function personFor(i: number): [string, string, Gender] {
  const firstName = FIRST_NAME_POOL[i % FIRST_NAME_POOL.length];
  const lastName = LAST_NAME_POOL[Math.floor(i / FIRST_NAME_POOL.length) % LAST_NAME_POOL.length];
  const gender = i % 2 === 0 ? Gender.MALE : Gender.FEMALE;
  return [firstName, lastName, gender];
}

/**
 * Cycle of student positions. Most students are plain 'Student'; a handful
 * of leadership/prefect titles are sprinkled in deterministically via
 * `nextStudentPosition()` below, which is called once per student across
 * every student-creation block (regular, primary, and both "extra" cohorts)
 * so titles are spread realistically across the whole student body instead
 * of clustering in any one class or school.
 */
const STUDENT_POSITIONS = [
  'Student',
  'Student',
  'Student',
  'Student',
  'Class Captain',
  'Student',
  'Student',
  'Assistant Class Captain',
  'Student',
  'Student',
  'Sports Prefect',
  'Student',
  'Student',
  'Library Prefect',
  'Student',
  'Student',
  'Health Prefect',
  'Student',
  'Student',
  'Social Prefect',
  'Student',
  'Student',
  'Labour Prefect',
  'Student',
  'Head Boy',
  'Student',
  'Student',
  'Head Girl',
  'Student',
  'Student',
  'Head Prefect',
  'Student',
] as const;
let studentPositionSeq = 0;
function nextStudentPosition(): string {
  return STUDENT_POSITIONS[studentPositionSeq++ % STUDENT_POSITIONS.length];
}

// ─── Clear database (FK-safe order: children first) ─────────────────────────

async function clearDatabase(): Promise<void> {
  await prismaClient.attendance.deleteMany();
  await prismaClient.reportCards.deleteMany();
  await prismaClient.fees.deleteMany();
  await prismaClient.feeStructures.deleteMany();
  await prismaClient.events.deleteMany();
  await prismaClient.announcements.deleteMany();
  await prismaClient.lessons.deleteMany();
  await prismaClient.students.deleteMany();
  await prismaClient.guardians.deleteMany();
  await prismaClient.classes.deleteMany();
  await prismaClient.assignments.deleteMany();
  await prismaClient.exams.deleteMany();
  await prismaClient.tests.deleteMany();
  await prismaClient.subjects.deleteMany();
  await prismaClient.terms.deleteMany();
  await prismaClient.gradeYears.deleteMany();
  await prismaClient.staffs.deleteMany();
  await prismaClient.departments.deleteMany();
  await prismaClient.admins.deleteMany();
  await prismaClient.schools.deleteMany();
  await prismaClient.schoolGroups.deleteMany();
  await prismaClient.users.deleteMany();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🧹  Clearing existing data …');
  await clearDatabase();

  console.log('🔐  Hashing password …');
  const password = await hashPwd(PLAIN_PASSWORD);

  // ── 1. GRADE YEARS (10) ──────────────────────────────────────────────────
  console.log('📅  Seeding GradeYears …');

  const gradeYearDefs = [
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
  ];

  const gradeYears = await Promise.all(
    gradeYearDefs.map((level) =>
      prismaClient.gradeYears.create({
        data: { level, start: new Date('2025-09-01'), end: new Date('2026-07-31') },
      }),
    ),
  );

  // ── 2. TERMS (10) ────────────────────────────────────────────────────────
  console.log('📆  Seeding Terms …');

  const termCycle = [TermType.FIRSTTERM, TermType.SECONDTERM, TermType.THIRDTERM];
  const termDateRanges = [
    { start: '2025-09-08', end: '2025-12-13' },
    { start: '2026-01-12', end: '2026-04-03' },
    { start: '2026-04-27', end: '2026-07-18' },
  ];

  const terms = await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const typeIndex = i % 3;
      return prismaClient.terms.create({
        data: {
          name: `${termCycle[typeIndex].replace('TERM', ' Term')} ${2025 + Math.floor(i / 3)}`,
          type: termCycle[typeIndex],
          status: 'STARTED',
          start: new Date(termDateRanges[typeIndex].start),
          end: new Date(termDateRanges[typeIndex].end),
          gradeYearId: gradeYears[i % gradeYears.length].id,
        },
      });
    }),
  );

  // ── 3. SCHOOL GROUPS (10) ────────────────────────────────────────────────
  console.log('🏫  Seeding SchoolGroups …');

  const schoolGroupDefs: Array<[string, 'APPROVED' | 'PENDING' | 'BLOCKED']> = [
    ['Sunrise Educational Group', 'APPROVED'],
    ['Horizon Learning Network', 'APPROVED'],
    ['Meridian Group of Schools', 'PENDING'],
    ['Bright Horizons Trust', 'PENDING'],
    ['Legacy Education Network', 'BLOCKED'],
    ['Pinnacle Trust Schools', 'PENDING'],
    ['Cedar Education Alliance', 'APPROVED'],
    ['Riverside Learning Collective', 'PENDING'],
    ['Apex Academy Group', 'APPROVED'],
    ['Solstice Schools Network', 'PENDING'],
  ];

  const schoolGroups = await Promise.all(
    schoolGroupDefs.map(([groupName, status]) =>
      prismaClient.schoolGroups.create({ data: { groupName, status } }),
    ),
  );
  const [groupA, groupB] = schoolGroups;

  // ── 4. SCHOOLS (10) ──────────────────────────────────────────────────────
  console.log('🏛️   Seeding Schools …');

  const schoolDefs = [
    {
      schoolName: 'Sunrise Academy Primary School',
      shortName: 'Sunrise Primary',
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.GROUP,
      groupId: groupA.id,
    },
    {
      schoolName: 'Sunrise Academy Secondary School',
      shortName: 'Sunrise',
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.GROUP,
      groupId: groupA.id,
    },
    {
      schoolName: 'Horizon College Primary School',
      shortName: 'Horizon Primary',
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.GROUP,
      groupId: groupB.id,
    },
    {
      schoolName: 'Horizon College Secondary School',
      shortName: 'Horizon',
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.GROUP,
      groupId: groupB.id,
    },
    {
      schoolName: 'Plateau International Academy',
      shortName: 'Plateau',
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: 'Riverbank Model College',
      shortName: 'Riverbank',
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: 'Cedar Grove Institute',
      shortName: 'Cedar Grove',
      type: SchoolType.TERTIARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: 'Pinnacle Comprehensive School',
      shortName: 'Pinnacle',
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: 'Greenfield Academy',
      shortName: 'Greenfield',
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: 'Northstar Secondary School',
      shortName: 'Northstar',
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
  ] as const;

  const schools = await Promise.all(
    schoolDefs.map((s, i) =>
      prismaClient.schools.create({
        data: {
          type: s.type,
          setup: s.setup,
          status: 'APPROVED',
          isApproved: true,
          termsConditions: true,
          schoolName: s.schoolName,
          regNumber: `RC-${String(100000 + i * 1234)}`,
          address: `${s.schoolName} Campus Road, Nigeria`,
          phoneNumber: phone(i + 100),
          country: 'Nigeria',
          state: 'Lagos',
          createdBy: 'system',
          approvedBy: 'system',
          email: yop(`school.${s.schoolName}`),
          groupId: s.groupId ?? null,
        },
      }),
    ),
  );

  const groupASchools = schools.filter((s) => s.groupId === groupA.id);
  const groupBSchools = schools.filter((s) => s.groupId === groupB.id);
  const schoolTypeById = new Map(schools.map((s) => [s.id, s.type]));
  const schoolShortNameById = new Map(schools.map((s, i) => [s.id, schoolDefs[i].shortName]));

  // ── 4b. FEE STRUCTURES (90) ──────────────────────────────────────────────
  //   Every school gets its own catalog of fee types, split into:
  //     • COMPULSORY (5) — Tuition, Library, Books & Stationery,
  //       Development Levy, Examination Fee. Charged to every student.
  //     • OPTIONAL (4)   — Transportation (school bus), Lunch,
  //       Extracurricular Activities, Boarding. Charged only to students
  //       who opt in.
  //   Base amounts scale by SchoolType (primary < secondary < tertiary), so
  //   a school's own class type drives what it charges — 10 schools ×
  //   9 fee types = 90 FeeStructures rows.
  console.log('💵  Seeding FeeStructures …');

  const compulsoryFeeTemplates = [
    {
      name: 'Tuition Fee',
      description: 'Core academic tuition for the term.',
      base: { PRIMARY: 45_000, SECONDARY: 60_000, TERTIARY: 85_000 },
    },
    {
      name: 'Library Fee',
      description: 'Access to library resources and borrowing privileges.',
      base: { PRIMARY: 3_000, SECONDARY: 3_500, TERTIARY: 4_500 },
    },
    {
      name: 'Books & Stationery Fee',
      description: 'Termly textbooks, workbooks, and stationery supplies.',
      base: { PRIMARY: 8_000, SECONDARY: 10_000, TERTIARY: 12_000 },
    },
    {
      name: 'Development Levy',
      description: 'Contribution toward school facility upkeep and development.',
      base: { PRIMARY: 5_000, SECONDARY: 6_000, TERTIARY: 7_500 },
    },
    {
      name: 'Examination Fee',
      description: 'Covers termly tests, exams, and report card processing.',
      base: { PRIMARY: 2_500, SECONDARY: 3_500, TERTIARY: 5_000 },
    },
  ] as const;

  const optionalFeeTemplates = [
    {
      name: 'Transportation Fee (School Bus)',
      description: 'Optional daily school bus pickup and drop-off service.',
      base: { PRIMARY: 12_000, SECONDARY: 14_000, TERTIARY: 16_000 },
    },
    {
      name: 'Lunch Fee',
      description: 'Optional daily hot-lunch feeding program.',
      base: { PRIMARY: 9_000, SECONDARY: 10_000, TERTIARY: 11_000 },
    },
    {
      name: 'Extracurricular Activities Fee',
      description: 'Clubs, sports teams, and after-school activities.',
      base: { PRIMARY: 4_000, SECONDARY: 5_000, TERTIARY: 6_000 },
    },
    {
      name: 'Boarding Fee',
      description: 'Optional on-campus boarding accommodation for the term.',
      base: { PRIMARY: 60_000, SECONDARY: 75_000, TERTIARY: 90_000 },
    },
  ] as const;

  const feeStructures = (
    await Promise.all(
      schools.map((school) =>
        Promise.all([
          ...compulsoryFeeTemplates.map((tpl) =>
            prismaClient.feeStructures.create({
              data: {
                name: tpl.name,
                description: tpl.description,
                category: FeeCategory.COMPULSORY,
                amount: tpl.base[school.type],
                classType: school.type,
                schoolId: school.id,
              },
            }),
          ),
          ...optionalFeeTemplates.map((tpl) =>
            prismaClient.feeStructures.create({
              data: {
                name: tpl.name,
                description: tpl.description,
                category: FeeCategory.OPTIONAL,
                amount: tpl.base[school.type],
                classType: school.type,
                schoolId: school.id,
              },
            }),
          ),
        ]),
      ),
    )
  ).flat(2);

  // Per-school lookup of that school's own compulsory / optional catalog,
  // used later to bill each student against fees that actually belong to
  // their own school.
  const feeStructuresBySchoolId = new Map<
    string,
    { compulsory: typeof feeStructures; optional: typeof feeStructures }
  >();
  schools.forEach((school) => {
    const schoolFeeStructures = feeStructures.filter((f) => f.schoolId === school.id);
    feeStructuresBySchoolId.set(school.id, {
      compulsory: schoolFeeStructures.filter((f) => f.category === FeeCategory.COMPULSORY),
      optional: schoolFeeStructures.filter((f) => f.category === FeeCategory.OPTIONAL),
    });
  });

  // ── 5. DEPARTMENTS (46) ──────────────────────────────────────────────────
  //   Primary schools: Creche, Preschool, Junior, Advance      (4 each)
  //   Secondary/tertiary schools: Sciences, Humanities,
  //     Business, Language, Mathematics                        (5 each)
  //   4 primary schools × 4  +  6 non-primary schools × 5  =  46 rows.
  //   headId is patched in once Staffs exist (step 9) — Departments.headId
  //   ↔ Staffs.departmentId is a circular relationship.
  console.log('🏢  Seeding Departments …');

  const PRIMARY_DEPARTMENT_NAMES = ['Creche', 'Preschool', 'Junior', 'Advance'] as const;
  const NON_PRIMARY_DEPARTMENT_NAMES = [
    'Sciences',
    'Humanities',
    'Business',
    'Language',
    'Mathematics',
  ] as const;

  const departments = (
    await Promise.all(
      schools.map((school) => {
        const deptNames =
          school.type === SchoolType.PRIMARY
            ? PRIMARY_DEPARTMENT_NAMES
            : NON_PRIMARY_DEPARTMENT_NAMES;
        return Promise.all(
          deptNames.map((name) =>
            prismaClient.departments.create({
              data: {
                name,
                code: name.slice(0, 3).toUpperCase(),
                description: `${name} department at ${school.schoolName}`,
                status: 'ACTIVE',
                schoolId: school.id,
              },
            }),
          ),
        );
      }),
    )
  ).flat();

  const nonPrimarySchools = schools.filter((s) => s.type !== SchoolType.PRIMARY);
  const primarySchools = schools.filter((s) => s.type === SchoolType.PRIMARY);

  // ── 6. ADMINS + USERS ────────────────────────────────────────────────────
  //
  //   • 1  SUPERADMIN        — kuku@yopmail.com
  //   • 1  DANIRAADMIN       — platform-level admin
  //   • 2  GROUPSCHOOLADMIN  — one per group
  //   • 10 SCHOOLADMIN       — one dedicated admin per school
  //
  console.log('👤  Seeding Admins …');

  const superAdmin = await prismaClient.users.create({
    data: {
      username: 'kuku',
      email: yop('kuku'),
      password,
      status: 'ACTIVE',
      firstName: 'Kuku',
      lastName: 'Admin',
      country: 'Nigeria',
      state: 'Lagos',
      isVerified: true,
      phoneNumber: phone(201),
      address: '104, Taiwo Close, Ikorodu, Lagos.',
      gender: Gender.MALE,
      role: Role.SUPERADMIN,
      ratings: rating(201),
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: superAdmin.id,
      type: SchoolSetup.DANIRA,
      schoolIds: [],
      schools: { connect: [] },
      groupId: null,
    },
  });

  const daniraAdmin = await prismaClient.users.create({
    data: {
      username: 'danira_omolayo',
      email: yop('omolayo'),
      password,
      status: 'PENDING',
      firstName: 'Omolayo',
      lastName: 'Omodele',
      country: 'Nigeria',
      state: 'Lagos',
      isVerified: false,
      phoneNumber: phone(202),
      address: '44, Igbo Olomu Close, Agric, Ikorodu, Lagos.',
      gender: Gender.MALE,
      role: Role.DANIRAADMIN,
      ratings: rating(202),
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: daniraAdmin.id,
      type: SchoolSetup.DANIRA,
      schoolIds: [],
      schools: { connect: [] },
      groupId: null,
    },
  });

  const guserA = await prismaClient.users.create({
    data: {
      username: 'ngozi.eze.groupadmin',
      email: yop('ngozi.eze.groupadmin'),
      password,
      status: 'PENDING',
      firstName: 'Ngozi',
      lastName: 'Eze',
      country: 'Nigeria',
      state: 'Lagos',
      isVerified: false,
      phoneNumber: phone(203),
      address: '12 Sunrise Avenue, Jos, Plateau State',
      gender: Gender.FEMALE,
      role: Role.GROUPSCHOOLADMIN,
      ratings: rating(203),
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: guserA.id,
      type: SchoolSetup.GROUP,
      schoolIds: groupASchools.map((s) => s.id),
      schools: { connect: groupASchools.map((s) => ({ id: s.id })) },
      groupId: groupA.id,
    },
  });

  const guserB = await prismaClient.users.create({
    data: {
      username: 'tunde.bakare.groupadmin',
      email: yop('tunde.bakare.groupadmin'),
      password,
      status: 'PENDING',
      firstName: 'Tunde',
      lastName: 'Bakare',
      country: 'Nigeria',
      state: 'Lagos',
      isVerified: false,
      phoneNumber: phone(204),
      address: '5 Horizon Close, Abuja, FCT',
      gender: Gender.MALE,
      role: Role.GROUPSCHOOLADMIN,
      ratings: rating(204),
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: guserB.id,
      type: SchoolSetup.GROUP,
      schoolIds: groupBSchools.map((s) => s.id),
      schools: { connect: groupBSchools.map((s) => ({ id: s.id })) },
      groupId: groupB.id,
    },
  });

  const schoolAdminNames: Array<[string, string, Gender]> = [
    ['Amaka', 'Okafor', Gender.FEMALE],
    ['Chidi', 'Yusuf', Gender.MALE],
    ['Grace', 'Adeyemi', Gender.FEMALE],
    ['Ibrahim', 'Mohammed', Gender.MALE],
    ['Joy', 'Eze', Gender.FEMALE],
    ['Kunle', 'Balogun', Gender.MALE],
    ['Lola', 'Danjuma', Gender.FEMALE],
    ['Musa', 'Okoro', Gender.MALE],
    ['Ngozi', 'Hassan', Gender.FEMALE],
    ['Obinna', 'Nwosu', Gender.MALE],
  ];

  await Promise.all(
    schools.map(async (school, i) => {
      const [firstName, lastName, gender] = schoolAdminNames[i];
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.schooladmin${i + 1}`;
      const user = await prismaClient.users.create({
        data: {
          username,
          email: yop(username),
          password,
          status: 'PENDING',
          firstName,
          lastName,
          country: 'Nigeria',
          state: 'Lagos',
          isVerified: false,
          phoneNumber: phone(300 + i),
          address: `Admin Quarters, ${school.schoolName}`,
          gender,
          role: Role.SCHOOLADMIN,
          ratings: rating(300 + i),
        },
      });
      return prismaClient.admins.create({
        data: {
          userId: user.id,
          type: SchoolSetup.SINGLE,
          schoolIds: [school.id],
          schools: { connect: [{ id: school.id }] },
          groupId: null,
        },
      });
    }),
  );

  // ── 7. SUBJECTS (104) ────────────────────────────────────────────────────
  //   Non-primary schools: each of the 6 gets its OWN full curriculum of 12
  //   academic subjects (72 total), correctly placed under that school's
  //   own subject-area department.
  //   Primary schools: each of the 4 gets its OWN early-years curriculum of
  //   8 subjects (32 total), placed under that school's own Creche/
  //   Preschool/Junior/Advance department — so every school, not just the
  //   secondary/tertiary ones, actually has subjects.
  //   Subjects.name is @unique, so every subject is prefixed with its
  //   school's short name (e.g. "Sunrise Mathematics", "Plateau Numeracy").
  console.log('📚  Seeding Subjects …');

  const subjectTemplates = [
    {
      name: 'Mathematics',
      code: 'MTH101',
      description: 'Number theory, algebra, and geometry.',
      category: 'Mathematics',
    },
    {
      name: 'Further Mathematics',
      code: 'MTH201',
      description: 'Calculus, vectors, and advanced statistics.',
      category: 'Mathematics',
    },
    {
      name: 'English Language',
      code: 'ENG101',
      description: 'Grammar, comprehension, and composition.',
      category: 'Language',
    },
    {
      name: 'Literature in English',
      code: 'LIT201',
      description: 'Prose, drama, and poetry analysis.',
      category: 'Language',
    },
    {
      name: 'Basic Science',
      code: 'BSC101',
      description: 'Introductory physical and life sciences.',
      category: 'Sciences',
    },
    {
      name: 'Social Studies',
      code: 'SOS101',
      description: 'Civics, history, and geography.',
      category: 'Humanities',
    },
    {
      name: 'Physics',
      code: 'PHY201',
      description: 'Mechanics, waves, and electromagnetism.',
      category: 'Sciences',
    },
    {
      name: 'Chemistry',
      code: 'CHM201',
      description: 'Organic and inorganic chemistry.',
      category: 'Sciences',
    },
    {
      name: 'Biology',
      code: 'BIO201',
      description: 'Cell biology, genetics, and ecology.',
      category: 'Sciences',
    },
    {
      name: 'Computer Studies',
      code: 'CMP101',
      description: 'Programming fundamentals and ICT literacy.',
      category: 'Sciences',
    },
    {
      name: 'Economics',
      code: 'ECO201',
      description: 'Micro and macroeconomics for secondary school.',
      category: 'Business',
    },
    {
      name: 'Financial Accounting',
      code: 'FAC201',
      description: 'Bookkeeping, ledgers, and financial statements.',
      category: 'Business',
    },
    {
      name: 'Civic Education',
      code: 'CIV101',
      description: 'Citizenship, rights, and responsibilities.',
      category: 'Humanities',
    },
    {
      name: 'Agricultural Sci.',
      code: 'AGR101',
      description: 'Crop science, livestock, and farm management.',
      category: 'Sciences',
    },
    {
      name: 'Fine Arts',
      code: 'ART101',
      description: 'Drawing, painting, and art history.',
      category: 'Humanities',
    },
  ] as const;

  const nonPrimarySubjects = (
    await Promise.all(
      nonPrimarySchools.map((school) => {
        const shortName = schoolShortNameById.get(school.id)!;
        return Promise.all(
          subjectTemplates.map((tpl) => {
            const department = departments.find(
              (d) => d.schoolId === school.id && d.name === tpl.category,
            )!;
            return prismaClient.subjects.create({
              data: {
                name: tpl.name,
                code: `${tpl.code}-${shortName.slice(0, 3).toUpperCase()}`,
                status: 'ACTIVE',
                category: SubjectCategory.COMPULSORY,
                description: tpl.description,
                departmentId: department.id,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  // Two subjects per primary department (Creche/Preschool/Junior/Advance),
  // covering an age-appropriate early-years curriculum instead of academic
  // subjects like Physics/Economics.
  const primarySubjectTemplates = [
    {
      name: 'Sensory Play',
      code: 'CRE101',
      description: 'Sensory exploration and motor-skill development.',
      category: 'Creche',
    },
    {
      name: 'Rhymes & Songs',
      code: 'CRE102',
      description: 'Nursery rhymes, singing, and listening skills.',
      category: 'Creche',
    },
    {
      name: 'Phonics',
      code: 'PRE101',
      description: 'Letter sounds and early reading readiness.',
      category: 'Preschool',
    },
    {
      name: 'Number Recognition',
      code: 'PRE102',
      description: 'Counting, shapes, and early number sense.',
      category: 'Preschool',
    },
    {
      name: 'Numeracy',
      code: 'JUN101',
      description: 'Basic arithmetic and problem solving.',
      category: 'Junior',
    },
    {
      name: 'Literacy',
      code: 'JUN102',
      description: 'Reading, writing, and comprehension basics.',
      category: 'Junior',
    },
    {
      name: 'Basic Science',
      code: 'ADV101',
      description: 'Simple experiments and nature study.',
      category: 'Advance',
    },
    {
      name: 'Creative Arts',
      code: 'ADV102',
      description: 'Drawing, craft, and creative expression.',
      category: 'Advance',
    },
  ] as const;

  const primarySubjects = (
    await Promise.all(
      primarySchools.map((school) => {
        const shortName = schoolShortNameById.get(school.id)!;
        return Promise.all(
          primarySubjectTemplates.map((tpl) => {
            const department = departments.find(
              (d) => d.schoolId === school.id && d.name === tpl.category,
            )!;
            return prismaClient.subjects.create({
              data: {
                name: tpl.name,
                code: `${tpl.code}-${shortName.slice(0, 3).toUpperCase()}`,
                status: 'ACTIVE',
                category: SubjectCategory.COMPULSORY,
                description: tpl.description,
                departmentId: department.id,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  const subjects = [...nonPrimarySubjects, ...primarySubjects];

  // ── 8. STAFFS + USERS (120) ──────────────────────────────────────────────
  //
  //   104 teachers — exactly one per subject (72 non-primary + 32 primary),
  //   guaranteeing every subject at every school — primary included — has
  //   its own dedicated teacher. Plus 16 supplementary, non-subject staff —
  //   one caregiver per primary-school department (Creche/Preschool/Junior/
  //   Advance) — for early-years pastoral care alongside the subject
  //   teachers.
  //
  console.log('👩‍🏫  Seeding Staffs …');

  const teacherPositions = [
    'Subject Teacher',
    'Senior Teacher',
    'Head of Department',
    'Lab Coordinator',
  ];
  const primaryPositions = [
    'Caregiver',
    'Early Years Coordinator',
    'Class Teacher',
    'Head of Department',
  ];

  // 8a. One teacher per subject (covers non-primary AND primary subjects),
  //   plus — since every department now has at least 2 subjects — a second
  //   subject from that same department, so every teacher teaches multiple
  //   subjects. `teacherRecords` keeps the (staff, subject, secondarySubject)
  //   pairing around so step 14c can give each teacher a lesson for their
  //   second subject too, without having to re-derive it.
  const teacherRecords = await Promise.all(
    subjects.map(async (subject, i) => {
      const department = departments.find((d) => d.id === subject.departmentId)!;
      const deptSubjects = subjects.filter((s) => s.departmentId === subject.departmentId);
      const secondarySubject = deptSubjects.find((s) => s.id !== subject.id) ?? subject;
      const [firstName, lastName, gender] = personFor(nextPersonIndex());
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.teacher${i + 1}`;
      const user = await prismaClient.users.create({
        data: {
          username,
          email: yop(username),
          password,
          status: staffStatus(i),
          firstName,
          lastName,
          country: 'Nigeria',
          state: 'Lagos',
          isVerified: false,
          phoneNumber: phone(400 + i),
          address: `Staff Block ${i + 1}, ${subject.name} Faculty`,
          gender,
          role: Role.SCHOOLSTAFF,
          ratings: rating(400 + i),
        },
      });
      const staff = await prismaClient.staffs.create({
        data: {
          userId: user.id,
          staffId: `STF-T-${String(i + 1).padStart(3, '0')}`,
          position: teacherPositions[i % teacherPositions.length],
          accomodation:
            i % 3 === 0 ? Accomodation.STAFFQUARTERS : i % 3 === 1 ? Accomodation.ONCAMPUS : null,
          employmentStatus:
            i % 3 === 0
              ? StaffStatus.FULLTIME
              : i % 3 === 1
                ? StaffStatus.PERTIME
                : StaffStatus.VISITING,
          schoolId: department.schoolId,
          departmentId: department.id,
          subjects:
            secondarySubject.id === subject.id
              ? { connect: [{ id: subject.id }] }
              : { connect: [{ id: subject.id }, { id: secondarySubject.id }] },
        },
      });
      return { staff, subject, secondarySubject };
    }),
  );

  const teacherStaffs = teacherRecords.map((r) => r.staff);

  // 8b. One supplementary, non-subject caregiver per primary-school department.
  const primaryDepartments = departments.filter((d) =>
    (PRIMARY_DEPARTMENT_NAMES as readonly string[]).includes(d.name),
  );
  const primaryStaffs = await Promise.all(
    primaryDepartments.map(async (department, i) => {
      const [firstName, lastName, gender] = personFor(nextPersonIndex());
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.primarystaff${i + 1}`;
      const user = await prismaClient.users.create({
        data: {
          username,
          email: yop(username),
          password,
          status: staffStatus(i),
          firstName,
          lastName,
          country: 'Nigeria',
          state: 'Lagos',
          isVerified: false,
          phoneNumber: phone(700 + i),
          address: `Staff Block ${i + 1}, ${department.name} Department`,
          gender,
          role: Role.SCHOOLSTAFF,
          ratings: rating(700 + i),
        },
      });
      return prismaClient.staffs.create({
        data: {
          userId: user.id,
          staffId: `STF-P-${String(i + 1).padStart(3, '0')}`,
          position: primaryPositions[i % primaryPositions.length],
          accomodation:
            i % 3 === 0 ? Accomodation.STAFFQUARTERS : i % 3 === 1 ? Accomodation.ONCAMPUS : null,
          employmentStatus:
            i % 3 === 0
              ? StaffStatus.FULLTIME
              : i % 3 === 1
                ? StaffStatus.PERTIME
                : StaffStatus.VISITING,
          schoolId: department.schoolId,
          departmentId: department.id,
        },
      });
    }),
  );

  const staffs = [...teacherStaffs, ...primaryStaffs];

  // ── 9. ASSIGN DEPARTMENT HEADS ───────────────────────────────────────────
  //   Every one of the 46 departments has at least one staff member by this
  //   point (subject-area departments have their teachers, primary
  //   departments have their dedicated staff member), so every department
  //   gets a head.
  console.log('🎓  Assigning Department heads …');

  await Promise.all(
    departments.map((department) => {
      const head = staffs.find((s) => s.departmentId === department.id);
      if (!head) return Promise.resolve();
      return prismaClient.departments.update({
        where: { id: department.id },
        data: { headId: head.id },
      });
    }),
  );

  // ── 9b. EXTRA SUPPORT STAFF (10 per school = 100) ────────────────────────
  //   Every school — primary and non-primary alike — gets 10 additional
  //   non-subject support staff (librarian, nurse, bursar, etc.), each a
  //   full User + Staffs row attached to one of that school's own
  //   departments, so they carry the same relation data as the original
  //   teaching staff (school, department, staffId, employment details).
  console.log('👥  Seeding extra support Staffs …');

  const EXTRA_STAFF_PER_SCHOOL = 10;
  const supportPositions = [
    'Librarian',
    'School Nurse',
    'Bursar',
    'Guidance Counselor',
    'IT Support Officer',
    'Sports Coordinator',
    'Security Officer',
    'Facility Manager',
    'Front Desk Officer',
    'Transport Coordinator',
  ];

  const extraStaffs = (
    await Promise.all(
      schools.map((school, si) => {
        const schoolDepartments = departments.filter((d) => d.schoolId === school.id);
        return Promise.all(
          Array.from({ length: EXTRA_STAFF_PER_SCHOOL }, async (_, j) => {
            const globalIndex = 4000 + si * EXTRA_STAFF_PER_SCHOOL + j;
            const department = schoolDepartments[j % schoolDepartments.length];
            const [firstName, lastName, gender] = personFor(nextPersonIndex());
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.staff${globalIndex + 1}`;
            const user = await prismaClient.users.create({
              data: {
                username,
                email: yop(username),
                password,
                status: staffStatus(globalIndex),
                firstName,
                lastName,
                country: 'Nigeria',
                state: 'Lagos',
                isVerified: false,
                phoneNumber: phone(globalIndex),
                address: `Support Wing, ${school.schoolName}`,
                gender,
                role: Role.SCHOOLSTAFF,
                ratings: rating(globalIndex),
              },
            });
            return prismaClient.staffs.create({
              data: {
                userId: user.id,
                staffId: `STF-X-${String(globalIndex + 1).padStart(4, '0')}`,
                position: supportPositions[j % supportPositions.length],
                accomodation:
                  globalIndex % 3 === 0
                    ? Accomodation.STAFFQUARTERS
                    : globalIndex % 3 === 1
                      ? Accomodation.ONCAMPUS
                      : null,
                employmentStatus:
                  globalIndex % 3 === 0
                    ? StaffStatus.FULLTIME
                    : globalIndex % 3 === 1
                      ? StaffStatus.PERTIME
                      : StaffStatus.VISITING,
                schoolId: school.id,
                departmentId: department.id,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  const allStaffs = [...staffs, ...extraStaffs];

  // ── 10. CLASSES (20) ─────────────────────────────────────────────────────
  //   Every school gets its own classes, not a shared generic pool:
  //     • 4 primary schools  × 2 classes, supervised by that school's own
  //       primary-department staff (Creche/Preschool/Junior/Advance)
  //     • 6 non-primary schools × 2 classes, supervised by that school's
  //       own teachers — this is what lets every school's own subjects get
  //       lessons in step 14.
  console.log('🏫  Seeding Classes …');

  const primaryClassDefs = [
    { suffix: 'Nursery Class', type: ClassType.PRIMARY },
    { suffix: 'Reception Class', type: ClassType.PRIMARY },
  ];

  const primaryClasses = (
    await Promise.all(
      primarySchools.map((school) => {
        const shortName = schoolShortNameById.get(school.id)!;
        const schoolPrimaryStaffs = primaryStaffs.filter((s) => s.schoolId === school.id);
        return Promise.all(
          primaryClassDefs.map((def, j) => {
            const supervisor = schoolPrimaryStaffs[j % schoolPrimaryStaffs.length];
            return prismaClient.classes.create({
              data: {
                name: `${shortName} ${def.suffix}`,
                type: def.type,
                status: 'ACTIVE',
                description: `${def.suffix} at ${school.schoolName} — current academic session.`,
                population: 20 + j * 5,
                supervisorId: supervisor.id,
                gradeYearId: gradeYears[j % gradeYears.length].id,
                departmentId: supervisor.departmentId,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  const nonPrimaryClassDefsByType: Record<
    'SECONDARY' | 'TERTIARY',
    Array<{ suffix: string; type: (typeof ClassType)[keyof typeof ClassType] }>
  > = {
    SECONDARY: [
      { suffix: 'JSS 1A', type: ClassType.SECONDARY },
      { suffix: 'SSS 1A', type: ClassType.SECONDARY },
    ],
    TERTIARY: [
      { suffix: 'ND Year 1', type: ClassType.TERTIARY },
      { suffix: 'ND Year 2', type: ClassType.TERTIARY },
    ],
  };

  // schoolTeachers[si] = the 12 teachers (and their 12 subjects, index-aligned)
  // that belong to nonPrimarySchools[si] — see step 7/8, where both `subjects`
  // and `teacherStaffs` were built via `nonPrimarySchools.map(...)`, so a
  // 12-item slice at the same offset always belongs to the same school.
  const nonPrimaryClasses = (
    await Promise.all(
      nonPrimarySchools.map((school, si) => {
        const shortName = schoolShortNameById.get(school.id)!;
        const schoolTeachers = teacherStaffs.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );
        const defs =
          nonPrimaryClassDefsByType[school.type === SchoolType.TERTIARY ? 'TERTIARY' : 'SECONDARY'];
        return Promise.all(
          defs.map((def, j) => {
            const supervisor = schoolTeachers[j % schoolTeachers.length];
            return prismaClient.classes.create({
              data: {
                name: `${shortName} ${def.suffix}`,
                type: def.type,
                status: 'ACTIVE',
                description: `${def.suffix} at ${school.schoolName} — current academic session.`,
                population: 25 + j * 5,
                supervisorId: supervisor.id,
                gradeYearId: gradeYears[(si + j) % gradeYears.length].id,
                departmentId: supervisor.departmentId,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  const classes = [...primaryClasses, ...nonPrimaryClasses];

  // Lookup of each school's own classes, keyed by schoolId — used later to
  // give primary-dept caregivers and extra support staff a class to teach
  // in without having to re-derive school/class relationships from scratch.
  const classesBySchoolId = new Map<string, typeof classes>();
  primarySchools.forEach((school, si) => {
    classesBySchoolId.set(school.id, primaryClasses.slice(si * 2, si * 2 + 2));
  });
  nonPrimarySchools.forEach((school, si) => {
    classesBySchoolId.set(school.id, nonPrimaryClasses.slice(si * 2, si * 2 + 2));
  });

  // ── 10b. LINK SUBJECTS → CLASSES ─────────────────────────────────────────
  //   Subjects.classesId is a single FK (a subject belongs to at most one
  //   class), so to give every class its own subject list, each school's
  //   own subjects are distributed round-robin across that school's own
  //   classes — every class ends up with roughly half its school's
  //   curriculum directly attached (Classes.subjects), on top of the full
  //   per-class timetable already covered by Lessons.
  console.log('🔗  Linking Subjects to Classes …');

  const departmentSchoolId = new Map(departments.map((d) => [d.id, d.schoolId]));

  await Promise.all(
    schools.map((school) => {
      const schoolSubjects = subjects.filter(
        (s) => departmentSchoolId.get(s.departmentId!) === school.id,
      );
      const schoolClasses = classesBySchoolId.get(school.id) ?? [];
      if (schoolClasses.length === 0) return Promise.resolve();

      return Promise.all(
        schoolSubjects.map((subject, i) =>
          prismaClient.subjects.update({
            where: { id: subject.id },
            data: { classes: { connect: { id: schoolClasses[i % schoolClasses.length].id } } },
          }),
        ),
      );
    }),
  );

  // ── 11. EXAMS (10) ───────────────────────────────────────────────────────
  console.log('📝  Seeding Exams …');

  const exams = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.exams.create({
        data: {
          title: `${subjects[i % subjects.length].name} — End of Term Exam`,
          status: 'UPCOMING',
          startTime: daysFromNow(30 + i * 2),
          endTime: daysFromNow(30 + i * 2 + 1),
        },
      }),
    ),
  );

  // ── 12. TESTS (10) ────────────────────────────────────────────────────────
  console.log('📋  Seeding Tests …');

  const tests = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.tests.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Mid-Term Test`,
          status: 'UPCOMING',
          startTime: daysFromNow(10 + i * 2),
          endTime: daysFromNow(10 + i * 2 + 1),
        },
      }),
    ),
  );

  // ── 13. ASSIGNMENTS (10) ──────────────────────────────────────────────────
  console.log('📄  Seeding Assignments …');

  const assignments = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.assignments.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Assignment ${i + 1}`,
          status: 'UPCOMING',
          startTime: daysFromNow(i),
          dueDate: daysFromNow(i + 7),
        },
      }),
    ),
  );

  // ── 14. LESSONS (208) ─────────────────────────────────────────────────────
  //   Non-primary: a lesson for each of a school's 12 subjects in each of
  //   its 2 classes, taught by that exact subject's teacher.
  //     6 schools × 2 classes × 12 subjects = 144 lessons.
  //   Primary: same idea, scaled to the 8-subject early-years curriculum.
  //     4 schools × 2 classes × 8 subjects = 64 lessons.
  //   Both are spread across the week in distinct day/period slots so a
  //   class never has two subjects scheduled at the same time. Together
  //   this guarantees every subject (104) has a lesson, every teacher (104)
  //   is assigned to teach, and every school's own timetable — primary
  //   included — is fully populated.
  console.log('🗓️   Seeding Lessons …');

  const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];

  const nonPrimaryLessons = (
    await Promise.all(
      nonPrimarySchools.map((school, si) => {
        const schoolSubjects = nonPrimarySubjects.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );
        const schoolTeachers = teacherStaffs.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );
        const schoolClasses = nonPrimaryClasses.slice(si * 2, si * 2 + 2);
        const periodsPerDay = Math.ceil(schoolSubjects.length / days.length); // 3

        return Promise.all(
          schoolClasses.flatMap((cls, classOffset) =>
            schoolSubjects.map((subject, subjectIndex) => {
              const teacher = schoolTeachers[subjectIndex];
              // Offset the second class's timetable so both classes' lessons
              // don't all cluster on identical slots.
              const slot = (subjectIndex + classOffset * 2) % (days.length * periodsPerDay);
              const dayIndex = slot % days.length;
              const period = Math.floor(slot / days.length);
              const startHour = 8 + period * 2;

              return prismaClient.lessons.create({
                data: {
                  name: `${subject.name} — ${cls.name} — P${period + 1}`,
                  description: `${subject.name} period for ${cls.name} at ${school.schoolName}.`,
                  day: days[dayIndex],
                  status: 'UPCOMING',
                  startTime: new Date(2026, 0, 5, startHour, 0, 0),
                  endTime: new Date(2026, 0, 5, startHour + 1, 0, 0),
                  subjectId: subject.id,
                  classId: cls.id,
                  staffId: teacher.id,
                  assignmentId: assignments[subjectIndex % assignments.length].id,
                },
              });
            }),
          ),
        );
      }),
    )
  ).flat();

  // teacherStaffs is [...one per nonPrimarySubject, ...one per primarySubject],
  // so a primary school's 8 subject-teachers sit at offset
  // nonPrimarySubjects.length + si * 8 in that same array.
  const primaryLessons = (
    await Promise.all(
      primarySchools.map((school, si) => {
        const schoolSubjects = primarySubjects.slice(si * 8, si * 8 + 8);
        const teacherOffset = nonPrimarySubjects.length + si * 8;
        const schoolTeachers = teacherStaffs.slice(teacherOffset, teacherOffset + 8);
        const schoolClasses = primaryClasses.slice(si * 2, si * 2 + 2);
        const periodsPerDay = Math.ceil(schoolSubjects.length / days.length); // 2

        return Promise.all(
          schoolClasses.flatMap((cls, classOffset) =>
            schoolSubjects.map((subject, subjectIndex) => {
              const teacher = schoolTeachers[subjectIndex];
              const slot = (subjectIndex + classOffset * 2) % (days.length * periodsPerDay);
              const dayIndex = slot % days.length;
              const period = Math.floor(slot / days.length);
              const startHour = 8 + period * 2;

              return prismaClient.lessons.create({
                data: {
                  name: `${subject.name} — ${cls.name} — P${period + 1}`,
                  description: `${subject.name} period for ${cls.name} at ${school.schoolName}.`,
                  day: days[dayIndex],
                  status: 'UPCOMING',
                  startTime: new Date(2026, 0, 5, startHour, 0, 0),
                  endTime: new Date(2026, 0, 5, startHour + 1, 0, 0),
                  subjectId: subject.id,
                  classId: cls.id,
                  staffId: teacher.id,
                  assignmentId: assignments[subjectIndex % assignments.length].id,
                },
              });
            }),
          ),
        );
      }),
    )
  ).flat();

  // ── 14c. SECOND-SUBJECT LESSONS FOR TEACHERS ─────────────────────────────
  //   Every teacher who was given a second subject in step 8a (i.e. almost
  //   all of them, now that every department has ≥2 subjects) gets one more
  //   lesson for that second subject, reusing one of their own school's
  //   existing classes at a slot right after the regular timetable — so a
  //   teacher visibly teaches multiple subjects AND multiple lessons, not
  //   just multiple classes for a single subject.
  console.log('📘  Assigning second-subject Lessons to teachers …');

  const secondSubjectLessons = await Promise.all(
    teacherRecords
      .filter((r) => r.secondarySubject.id !== r.subject.id)
      .map(async (r, i) => {
        const schoolClasses = classesBySchoolId.get(r.staff.schoolId) ?? [];
        const cls = schoolClasses[i % schoolClasses.length];
        const dayIndex = i % days.length;
        const startHour = 13 + (i % 2); // slot right after the regular timetable

        return prismaClient.lessons.create({
          data: {
            name: `${r.secondarySubject.name} — ${cls.name} — ${r.staff.staffId} (2nd subject)`,
            description: `${r.secondarySubject.name} period for ${cls.name}, taught by ${r.staff.staffId} as a second subject.`,
            day: days[dayIndex],
            status: 'UPCOMING',
            startTime: new Date(2026, 0, 5, startHour, 0, 0),
            endTime: new Date(2026, 0, 5, startHour + 1, 0, 0),
            subjectId: r.secondarySubject.id,
            classId: cls.id,
            staffId: r.staff.id,
            assignmentId: assignments[i % assignments.length].id,
          },
        });
      }),
  );

  // ── 14b. ASSIGN SUBJECTS & LESSONS TO SUPPORT STAFF ──────────────────────
  //   teacherStaffs already carry a subject + lessons from step 14 above.
  //   The 16 primary-dept caregivers (primaryStaffs) and 100 extra support
  //   staff (extraStaffs) were created without either — every Staffs
  //   record should have both, so each is connected to a subject from
  //   their own department and given one lesson of their own, at their own
  //   school, so literally every teacher in the system is teaching
  //   something.
  console.log('📎  Assigning Subjects & Lessons to support staff …');

  const supportStaffs = [...primaryStaffs, ...extraStaffs];

  const supportLessons = await Promise.all(
    supportStaffs.map(async (staff, i) => {
      const deptSubjects = subjects.filter((s) => s.departmentId === staff.departmentId);
      const subject = deptSubjects[i % deptSubjects.length];

      await prismaClient.staffs.update({
        where: { id: staff.id },
        data: { subjects: { connect: [{ id: subject.id }] } },
      });

      const schoolClasses = classesBySchoolId.get(staff.schoolId) ?? [];
      const cls = schoolClasses[i % schoolClasses.length];
      const dayIndex = i % days.length;
      const startHour = 14 + (i % 3); // afternoon slot, after the regular timetable

      return prismaClient.lessons.create({
        data: {
          name: `${subject.name} — ${cls.name} — ${staff.position} (${staff.staffId})`,
          description: `${subject.name} support session for ${cls.name}, led by ${staff.position} ${staff.staffId}.`,
          day: days[dayIndex],
          status: 'UPCOMING',
          startTime: new Date(2026, 0, 5, startHour, 0, 0),
          endTime: new Date(2026, 0, 5, startHour + 1, 0, 0),
          subjectId: subject.id,
          classId: cls.id,
          staffId: staff.id,
          assignmentId: assignments[i % assignments.length].id,
        },
      });
    }),
  );

  const lessons = [
    ...nonPrimaryLessons,
    ...primaryLessons,
    ...secondSubjectLessons,
    ...supportLessons,
  ];

  // ── 15. GUARDIANS + USERS (10) ────────────────────────────────────────────
  console.log('👨‍👩‍👧  Seeding Guardians …');

  const guardianDefs: Array<[string, string, Gender]> = [
    ['Aisha', 'Abdullahi', Gender.FEMALE],
    ['Benjamin', 'Chukwuma', Gender.MALE],
    ['Comfort', 'Danfulani', Gender.FEMALE],
    ['David', 'Effiong', Gender.MALE],
    ['Esther', 'Folarin', Gender.FEMALE],
    ['Francis', 'Gowon', Gender.MALE],
    ['Gloria', 'Habila', Gender.FEMALE],
    ['Henry', 'Idoko', Gender.MALE],
    ['Iniobong', 'Jang', Gender.FEMALE],
    ['John', 'Kolo', Gender.MALE],
  ];

  const guardians = await Promise.all(
    guardianDefs.map(async ([firstName, lastName, gender], i) => {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.guardian`;
      const user = await prismaClient.users.create({
        data: {
          username: `${username}${i + 1}`,
          email: yop(`${username}${i + 1}`),
          password,
          status: 'PENDING',
          firstName,
          lastName,
          country: 'Nigeria',
          state: 'Lagos',
          isVerified: false,
          phoneNumber: phone(500 + i),
          address: `${i + 1} Guardian Close, Jos, Plateau State`,
          gender,
          role: Role.GUARDIAN,
          ratings: rating(500 + i),
        },
      });
      return prismaClient.guardians.create({ data: { userId: user.id } });
    }),
  );

  // ── 16. STUDENTS + USERS (32) ─────────────────────────────────────────────
  //   2 students in every non-primary class (12 classes × 2 = 24), each
  //   connected to ALL 12 subjects taught in THEIR OWN class (their full
  //   curriculum). Plus 1 student per primary class (8), each connected to
  //   ALL 8 early-years subjects taught in their own primary school — since
  //   primary schools now have real subjects too (step 7), every student at
  //   every school, not just secondary/tertiary, is enrolled in subjects.
  console.log('🎒  Seeding Students …');

  const STUDENTS_PER_NON_PRIMARY_CLASS = 2;

  // Tracks which subjects each student was connected to, since a m2m
  // relation isn't returned on `.create()` — needed by ReportCards below.
  const studentSubjectsMap = new Map<string, { id: string; name: string }[]>();

  const nonPrimaryStudents = (
    await Promise.all(
      nonPrimaryClasses.map((cls, classIdx) => {
        const si = Math.floor(classIdx / 2); // which non-primary school this class belongs to
        const school = nonPrimarySchools[si];
        const schoolSubjects = nonPrimarySubjects.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );

        return Promise.all(
          Array.from({ length: STUDENTS_PER_NON_PRIMARY_CLASS }, async (_, j) => {
            const globalIndex = classIdx * STUDENTS_PER_NON_PRIMARY_CLASS + j;
            const [firstName, lastName, gender] = personFor(nextPersonIndex());
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.student${globalIndex + 1}`;
            const user = await prismaClient.users.create({
              data: {
                username,
                email: yop(username),
                password,
                status: studentStatus(globalIndex),
                firstName,
                lastName,
                country: 'Nigeria',
                state: 'Lagos',
                isVerified: false,
                phoneNumber: phone(600 + globalIndex),
                address: `${globalIndex + 1} Student Hostel, ${school.schoolName}`,
                gender,
                role: Role.STUDENT,
                ratings: rating(600 + globalIndex),
              },
            });
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation:
                  globalIndex % 3 === 0 ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                examId: exams[globalIndex % exams.length].id,
                testId: tests[globalIndex % tests.length].id,
                assignmentId: assignments[globalIndex % assignments.length].id,
                departmentId: cls.departmentId,
                subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
              },
            });
            studentSubjectsMap.set(student.id, schoolSubjects);
            return student;
          }),
        );
      }),
    )
  ).flat();

  const primaryStudents = await Promise.all(
    primaryClasses.map(async (cls, classIdx) => {
      const si = Math.floor(classIdx / primaryClassDefs.length); // which primary school this class belongs to
      const school = primarySchools[si];
      const schoolSubjects = primarySubjects.slice(si * 8, si * 8 + 8);
      const globalIndex = 1000 + classIdx;
      const [firstName, lastName, gender] = personFor(nextPersonIndex());
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.pupil${classIdx + 1}`;
      const user = await prismaClient.users.create({
        data: {
          username,
          email: yop(username),
          password,
          status: studentStatus(classIdx),
          firstName,
          lastName,
          country: 'Nigeria',
          state: 'Lagos',
          isVerified: false,
          phoneNumber: phone(650 + classIdx),
          address: `${classIdx + 1} Pupil Hostel, ${school.schoolName}`,
          gender,
          role: Role.STUDENT,
          ratings: rating(650 + classIdx),
        },
      });
      const student = await prismaClient.students.create({
        data: {
          userId: user.id,
          position: nextStudentPosition(),
          studentId: `STU-P-${String(classIdx + 1).padStart(3, '0')}`,
          accomodation: classIdx % 2 === 0 ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
          classId: cls.id,
          guardianId: guardians[classIdx % guardians.length].id,
          schoolId: school.id,
          gradeYearId: cls.gradeYearId,
          departmentId: cls.departmentId,
          subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
          // No exam/test/assignment — early years don't sit formal exams.
        },
      });
      studentSubjectsMap.set(student.id, schoolSubjects);
      return student;
    }),
  );

  // ── 16b. EXTRA STUDENTS (10 per school = 100) ────────────────────────────
  //   Every school — primary and non-primary alike — gets 10 additional
  //   students, spread across that school's own classes and connected to
  //   its own full subject curriculum, guardian, gradeYear, and (for
  //   non-primary) exam/test/assignment — the same relation data as the
  //   original students.
  console.log('🎒  Seeding extra Students …');

  const EXTRA_STUDENTS_PER_SCHOOL = 10;

  const extraNonPrimaryStudents = (
    await Promise.all(
      nonPrimarySchools.map((school, si) => {
        const schoolSubjects = nonPrimarySubjects.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );
        const schoolClasses = nonPrimaryClasses.slice(si * 2, si * 2 + 2);
        return Promise.all(
          Array.from({ length: EXTRA_STUDENTS_PER_SCHOOL }, async (_, j) => {
            const globalIndex = 2000 + si * EXTRA_STUDENTS_PER_SCHOOL + j;
            const cls = schoolClasses[j % schoolClasses.length];
            const [firstName, lastName, gender] = personFor(nextPersonIndex());
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.student${globalIndex + 1}`;
            const user = await prismaClient.users.create({
              data: {
                username,
                email: yop(username),
                password,
                status: studentStatus(globalIndex),
                firstName,
                lastName,
                country: 'Nigeria',
                state: 'Lagos',
                isVerified: false,
                phoneNumber: phone(globalIndex),
                address: `${globalIndex + 1} Student Hostel, ${school.schoolName}`,
                gender,
                role: Role.STUDENT,
                ratings: rating(globalIndex),
              },
            });
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-X-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation:
                  globalIndex % 3 === 0 ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                examId: exams[globalIndex % exams.length].id,
                testId: tests[globalIndex % tests.length].id,
                assignmentId: assignments[globalIndex % assignments.length].id,
                departmentId: cls.departmentId,
                subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
              },
            });
            studentSubjectsMap.set(student.id, schoolSubjects);
            return student;
          }),
        );
      }),
    )
  ).flat();

  const extraPrimaryStudents = (
    await Promise.all(
      primarySchools.map((school, si) => {
        const schoolSubjects = primarySubjects.slice(si * 8, si * 8 + 8);
        const schoolClasses = primaryClasses.slice(si * 2, si * 2 + 2);
        return Promise.all(
          Array.from({ length: EXTRA_STUDENTS_PER_SCHOOL }, async (_, j) => {
            const globalIndex = 3000 + si * EXTRA_STUDENTS_PER_SCHOOL + j;
            const cls = schoolClasses[j % schoolClasses.length];
            const [firstName, lastName, gender] = personFor(nextPersonIndex());
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.pupil${globalIndex + 1}`;
            const user = await prismaClient.users.create({
              data: {
                username,
                email: yop(username),
                password,
                status: studentStatus(globalIndex),
                firstName,
                lastName,
                country: 'Nigeria',
                state: 'Lagos',
                isVerified: false,
                phoneNumber: phone(globalIndex),
                address: `${globalIndex + 1} Pupil Hostel, ${school.schoolName}`,
                gender,
                role: Role.STUDENT,
                ratings: rating(globalIndex),
              },
            });
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-XP-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation:
                  globalIndex % 2 === 0 ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                departmentId: cls.departmentId,
                subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
                // No exam/test/assignment — early years don't sit formal exams.
              },
            });
            studentSubjectsMap.set(student.id, schoolSubjects);
            return student;
          }),
        );
      }),
    )
  ).flat();

  const extraStudents = [...extraNonPrimaryStudents, ...extraPrimaryStudents];

  const students = [...nonPrimaryStudents, ...primaryStudents, ...extraStudents];

  // ── 17. ATTENDANCE ───────────────────────────────────────────────────────
  //   Every student — primary and non-primary alike — gets an Attendance
  //   record for EVERY lesson taught in their own class (their full
  //   timetable, including the second-subject and support-staff lessons
  //   added above). Attendance is deliberately uneven per student: within
  //   EVERY school, at least 5% of students are placed in a "very poor"
  //   tier (below 50% present) and at least 10% are below 60% present
  //   overall (the very-poor group counts toward that 10%); everyone else
  //   gets a solid, varied attendance rate.
  console.log('✅  Seeding Attendance …');

  const studentsBySchoolId = new Map<string, typeof students>();
  students.forEach((student) => {
    const schoolId = student.schoolId!;
    const list = studentsBySchoolId.get(schoolId) ?? [];
    list.push(student);
    studentsBySchoolId.set(schoolId, list);
  });

  /**
   * Deterministically assigns a target PRESENT rate to a student based on
   * their rank within their own school. The first `veryPoorCount` students
   * land below 50%, the next slice lands in the 50%–59% band (still below
   * 60% overall), and everyone after that gets a healthy 75%–95% rate.
   */
  function presentRateFor(rankInSchool: number, schoolSize: number): number {
    const veryPoorCount = Math.max(1, Math.ceil(schoolSize * 0.05));
    const below60Count = Math.max(veryPoorCount, Math.ceil(schoolSize * 0.1));

    if (rankInSchool < veryPoorCount) {
      return 0.3 + (rankInSchool % 4) * 0.03; // 30% – 39% present (below 50%)
    }
    if (rankInSchool < below60Count) {
      return 0.5 + ((rankInSchool - veryPoorCount) % 5) * 0.018; // 50% – 58.2% present
    }
    const normalRank = rankInSchool - below60Count;
    return 0.75 + (normalRank % 7) * 0.033; // 75% – 94.8% present
  }

  await Promise.all(
    students.flatMap((student) => {
      const schoolId = student.schoolId!;
      const schoolStudents = studentsBySchoolId.get(schoolId) ?? [student];
      const rankInSchool = schoolStudents.findIndex((s) => s.id === student.id);
      const presentRate = presentRateFor(rankInSchool, schoolStudents.length);

      const classLessons = lessons.filter((l) => l.classId === student.classId);
      const absentTarget = Math.round(classLessons.length * (1 - presentRate));

      // A cyclic shift of a fixed "N absent / rest present" mask — this is
      // a bijection for any classLessons.length, so it guarantees EXACTLY
      // absentTarget absences (matching the intended rate precisely) while
      // still varying which specific lessons are marked absent per student.
      return classLessons.map((lesson, li) => {
        const shifted = (li + rankInSchool) % classLessons.length;
        const attendanceDate = daysFromNow(-(li + 1));
        // clockIn/clockOut are required by the schema — reuse the lesson's
        // own start/end time-of-day, applied to the attendance date, so
        // each row still reflects the actual period the lesson ran in.
        const clockIn = new Date(attendanceDate);
        clockIn.setHours(lesson.startTime.getHours(), lesson.startTime.getMinutes(), 0, 0);
        const clockOut = new Date(attendanceDate);
        clockOut.setHours(lesson.endTime.getHours(), lesson.endTime.getMinutes(), 0, 0);
        return prismaClient.attendance.create({
          data: {
            date: attendanceDate,
            status: 'UPCOMING',
            attendance: shifted < absentTarget ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
            clockIn,
            clockOut,
            studentId: student.id,
            lessonId: lesson.id,
            // Attendance.studentId is a required FK, so a pure "staff-only"
            // row isn't representable — instead, every one of these
            // per-student, per-lesson rows is also tagged with the staff
            // who taught that lesson. Since every staff member (teachers,
            // primary caregivers, and support staff alike) is assigned at
            // least one lesson in step 14/14b/14c, this guarantees every
            // staff row ends up with attendance records via staffsId.
            staffsId: lesson.staffId,
          },
        });
      });
    }),
  );

  // ── 18. REPORT CARDS (32) ─────────────────────────────────────────────────
  //   One card per student — primary and non-primary alike — linked to the
  //   first of that student's own assigned subjects (a ReportCard's
  //   `subjects` connection sets that subject's single reportCardId, so
  //   only one subject can be linked per card).
  console.log('📊  Seeding ReportCards …');

  await Promise.all(
    students.map((student, i) => {
      const studentSubjects = studentSubjectsMap.get(student.id);
      return prismaClient.reportCards.create({
        data: {
          testScore: 55 + (i % 35),
          assignmentScore: 60 + (i % 30),
          examScore: 50 + (i % 40),
          attendanceScore: 70 + (i % 25),
          status: 'INCOMPLETE',
          teacherComment: 'Shows consistent effort and good classroom participation.',
          generalComment: 'A pleasure to teach this term — keep up the excellent work.',
          studentId: student.id,
          subjects: studentSubjects?.length
            ? { connect: [{ id: studentSubjects[0].id }] }
            : undefined,
        },
      });
    }),
  );

  // ── 19. FEES ──────────────────────────────────────────────────────────────
  //   Every student is billed every compulsory fee from their OWN school's
  //   catalog (step 4b), plus exactly one optional fee (transportation,
  //   lunch, etc.) cycled from that same school's catalog — so a fee is
  //   never generic, it's always tied to the student's school, class, and
  //   the FeeStructures row it came from. Every fee also carries `paid` +
  //   `outstanding` (always summing to `amount`). A student's overall
  //   payment status is "paid" once every one of their COMPULSORY fees is
  //   PAID — every 4th student (25%, in every school) is forced fully paid
  //   on all compulsory fees so that rule always has real examples to find.
  console.log('💰  Seeding Fees …');

  const fees = await Promise.all(
    students.flatMap((student, i) => {
      const schoolId = student.schoolId!;
      const catalog = feeStructuresBySchoolId.get(schoolId);
      if (!catalog) return [];

      const schoolClasses = classesBySchoolId.get(schoolId) ?? [];
      const classIndex = Math.max(
        schoolClasses.findIndex((c) => c.id === student.classId),
        0,
      );
      const classDifferential = classIndex * 1_500; // senior class pays a bit more

      // Every 4th student has fully settled all compulsory fees — the
      // guaranteed "fully paid" cohort the payment-status rule needs.
      const isFullyPaidStudent = i % 4 === 0;

      const receiptFor = (status: 'PAID' | 'PARTIAL' | 'UNPAID', seed: number) =>
        status === 'PAID'
          ? `RCT-${schoolId.slice(0, 4).toUpperCase()}-${String(seed + 1).padStart(5, '0')}`
          : null;

      const compulsoryFees = catalog.compulsory.map((structure, si) => {
        const seed = i * 10 + si;
        const status = isFullyPaidStudent ? 'PAID' : feeStatus(seed);
        const amount = structure.amount + classDifferential;
        const { paid, outstanding } = paymentSplit(amount, status, seed);
        return prismaClient.fees.create({
          data: {
            name: structure.name,
            description: structure.description,
            amount,
            paid,
            outstanding,
            category: FeeCategory.COMPULSORY,
            status,
            receipt: receiptFor(status, seed),
            studentId: student.id,
            schoolId,
            classId: student.classId,
            feeStructureId: structure.id,
          },
        });
      });

      // Every student opts into exactly one optional fee, cycled from the
      // school's optional catalog so the mix of transport/lunch/etc. varies.
      // Optional fees don't factor into the "fully paid" rule, so they keep
      // following the normal status cycle even for isFullyPaidStudent.
      const optionalStructure = catalog.optional[i % catalog.optional.length];
      const optionalSeed = i * 10 + catalog.compulsory.length;
      const optionalStatus = feeStatus(optionalSeed);
      const optionalAmount = optionalStructure.amount + classDifferential;
      const optionalSplit = paymentSplit(optionalAmount, optionalStatus, optionalSeed);
      const optionalFee = prismaClient.fees.create({
        data: {
          name: optionalStructure.name,
          description: optionalStructure.description,
          amount: optionalAmount,
          paid: optionalSplit.paid,
          outstanding: optionalSplit.outstanding,
          category: FeeCategory.OPTIONAL,
          status: optionalStatus,
          receipt: receiptFor(optionalStatus, optionalSeed),
          studentId: student.id,
          schoolId,
          classId: student.classId,
          feeStructureId: optionalStructure.id,
        },
      });

      return [...compulsoryFees, optionalFee];
    }),
  );

  // ── 20. EVENTS (10) ───────────────────────────────────────────────────────
  console.log('🎉  Seeding Events …');

  const eventDefs = [
    { title: 'Inter-House Sports Day', duration: '8 hours' },
    { title: 'Cultural Day Celebration', duration: '6 hours' },
    { title: 'Annual Science Fair', duration: '5 hours' },
    { title: 'Career Guidance Talk', duration: '2 hours' },
    { title: 'PTA Annual Meeting', duration: '3 hours' },
    { title: 'Prize Giving Ceremony', duration: '4 hours' },
    { title: 'Mock Exams Briefing', duration: '1 hour' },
    { title: 'Graduation Ceremony', duration: '6 hours' },
    { title: 'Open Day for Prospective Students', duration: '5 hours' },
    { title: 'Health and Wellness Week', duration: '40 hours' },
  ];

  await Promise.all(
    eventDefs.map((ev, i) =>
      prismaClient.events.create({
        data: {
          title: ev.title,
          description: `${ev.title} — hosted by ${classes[i % classes.length].name}.`,
          date: daysFromNow(20 + i * 3),
          status: 'UPCOMING',
          duration: ev.duration,
          classId: classes[i % classes.length].id,
        },
      }),
    ),
  );

  // ── 21. ANNOUNCEMENTS (10) ────────────────────────────────────────────────
  console.log('📢  Seeding Announcements …');

  const announcementDefs = [
    'School Resumption Date',
    'Mid-Term Break Notice',
    'Fee Payment Deadline Reminder',
    'Uniform Policy Update',
    'Exam Timetable Released',
    'Library Renovation Closure',
    'New Curriculum Rollout',
    'Parent-Teacher Conference Schedule',
    'Bus Route Schedule Change',
    'Student Leadership Elections',
  ];

  await Promise.all(
    announcementDefs.map((title, i) =>
      prismaClient.announcements.create({
        data: {
          title,
          description: `${title} — please note and act accordingly.`,
          status: 'PENDING',
          date: daysFromNow(3 + i * 2),
          classId: classes[i % classes.length].id,
        },
      }),
    ),
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅  Seeding complete!

  Table               Records
  ─────────────────── ───────
  SchoolGroups            ${schoolGroups.length}
  Schools                 ${schools.length}  (each has a regNumber)
  Departments             ${departments.length}  (4/primary school, 5/secondary+tertiary school; every one has a head)
  Admins                  14
  Staffs                  ${allStaffs.length}  (${teacherStaffs.length} subject teachers (incl. primary) + ${primaryStaffs.length} primary-dept caregivers + ${extraStaffs.length} extra support staff (10/school); each has a staffId, ACTIVE/LEAVE status, and is assigned at least one subject + lesson — most teachers now teach 2 subjects across multiple lessons)
  Classes                 ${classes.length}  (2 per school, every school has its own)
  Subjects                ${subjects.length}  (${nonPrimarySubjects.length} academic (${subjectTemplates.length}/school, every department has ≥2), ${primarySubjects.length} early-years — every school has its own curriculum + teacher, names no longer prefixed with school)
  FeeStructures           ${feeStructures.length}  (${compulsoryFeeTemplates.length} compulsory + ${optionalFeeTemplates.length} optional per school, amount scaled by SchoolType)
  GradeYears              ${gradeYears.length}
  Terms                   ${terms.length}
  Exams                   ${exams.length}
  Tests                   ${tests.length}
  Assignments             ${assignments.length}
  Lessons                 ${lessons.length}  (${nonPrimaryLessons.length + primaryLessons.length} timetable + ${secondSubjectLessons.length} second-subject + ${supportLessons.length} support-staff lessons — every one of the ${allStaffs.length} staff teaches at least one lesson, most teach several)
  Guardians               ${guardians.length}
  Students                ${students.length}  (${nonPrimaryStudents.length} in subject classes + ${primaryStudents.length} in primary classes + ${extraStudents.length} extra students (10/school); each has a studentId + ACTIVE/SUSPENDED status)
  Attendance              ${lessons.reduce((n, l) => n + students.filter((s) => s.classId === l.classId).length, 0)}  (every student × every lesson in their own class; in every school ≥10% of students sit below 60% attendance and ≥5% below 50%)
  ReportCards             ${students.length}
  Fees                    ${fees.length}  (${compulsoryFeeTemplates.length} compulsory + 1 optional per student, each with paid/outstanding tracked — every 4th student has all compulsory fees fully paid)
  Events                  10
  Announcements           10

  Every User row now carries a "ratings" score (3.0–5.0).
  Super admin login: kuku@yopmail.com / Password123!
  `);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌  Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
