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

/** Maps the Day enum to JS's Date.getDay() weekday numbering (0 = Sunday). */
const DAY_TO_JS_WEEKDAY: Record<Day, number> = {
  [Day.SUNDAY]: 0,
  [Day.MONDAY]: 1,
  [Day.TUESDAY]: 2,
  [Day.WEDNESDAY]: 3,
  [Day.THURSDAY]: 4,
  [Day.FRIDAY]: 5,
  [Day.SATURDAY]: 6,
};

// ─── 3-month window (previous / current / next month relative to "today") ──
// Every timeline-bearing table (Notifications, StudentAttendance,
// StaffAttendance, LessonAttendance, Exams, Tests, Assignments) is seeded to
// span this window, e.g. if today is in July: June (previous), July
// (current), August (next).
const TODAY = new Date();
const CURRENT_MONTH_INDEX = TODAY.getMonth();
const CURRENT_YEAR = TODAY.getFullYear();
const WINDOW_START = new Date(CURRENT_YEAR, CURRENT_MONTH_INDEX - 1, 1); // 1st of previous month
const WINDOW_END = new Date(CURRENT_YEAR, CURRENT_MONTH_INDEX + 2, 0); // last day of next month

/** Builds a Date safely within the 3-month window: monthOffset -1|0|1, clamped day. */
function monthOffsetDate(monthOffset: -1 | 0 | 1, day: number, hour = 9, minute = 0): Date {
  const safeDay = Math.min(Math.max(day, 1), 27); // avoids month-rollover surprises
  return new Date(CURRENT_YEAR, CURRENT_MONTH_INDEX + monthOffset, safeDay, hour, minute, 0);
}

/** All weekday (Mon–Fri) dates between WINDOW_START and WINDOW_END, inclusive. */
function schoolDayDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    const weekday = d.getDay();
    if (weekday !== 0 && weekday !== 6) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** All occurrences of a given Day-of-week between start and end, inclusive. */
function weekdayDatesInRange(day: Day, start: Date, end: Date): Date[] {
  const targetWeekday = DAY_TO_JS_WEEKDAY[day];
  const dates: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    if (d.getDay() === targetWeekday) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const SCHOOL_DAYS_IN_WINDOW = schoolDayDatesInRange(WINDOW_START, WINDOW_END);

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

/**
 * Rolls up a set of individual line-item statuses into one invoice-level
 * FeeStatus: PAID only if every item is fully paid off, UNPAID only if
 * nothing at all has been paid, PARTIAL for everything in between.
 */
function invoiceStatusFor(totalPaid: number, totalAmount: number): 'PAID' | 'PARTIAL' | 'UNPAID' {
  if (totalAmount <= 0 || totalPaid >= totalAmount) return 'PAID';
  if (totalPaid <= 0) return 'UNPAID';
  return 'PARTIAL';
}

/**
 * FeeStructures.classType is typed as the `ClassType` enum, but a school's
 * own `type` field is the (structurally identical, but nominally distinct)
 * `SchoolType` enum — Prisma generates these as separate TS enums, so they
 * aren't directly interchangeable even though every member name lines up.
 * This maps one to the other explicitly instead of relying on an `as` cast.
 */
function schoolTypeToClassType(type: SchoolType): ClassType {
  switch (type) {
    case SchoolType.PRIMARY:
      return ClassType.PRIMARY;
    case SchoolType.SECONDARY:
      return ClassType.SECONDARY;
    case SchoolType.TERTIARY:
      return ClassType.TERTIARY;
    default:
      throw new Error(`Unhandled SchoolType: ${type}`);
  }
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
  await prismaClient.notificationRecipients.deleteMany();
  await prismaClient.notifications.deleteMany();
  await prismaClient.timetablePeriods.deleteMany();
  await prismaClient.timetables.deleteMany();
  await prismaClient.studentAttendance.deleteMany();
  await prismaClient.staffAttendance.deleteMany();
  await prismaClient.lessonAttendance.deleteMany();
  await prismaClient.reportCards.deleteMany();
  await prismaClient.fees.deleteMany();
  await prismaClient.feeInvoice.deleteMany();
  await prismaClient.receipt.deleteMany();
  await prismaClient.feeStructureClasses.deleteMany();
  await prismaClient.feeStructures.deleteMany();
  await prismaClient.events.deleteMany();
  await prismaClient.announcements.deleteMany();
  await prismaClient.lessons.deleteMany();
  await prismaClient.classSubjects.deleteMany();
  await prismaClient.students.deleteMany();
  await prismaClient.guardians.deleteMany();
  await prismaClient.boardingHouseMatrons.deleteMany();
  await prismaClient.boardingHouses.deleteMany();
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

  // ── 2. TERMS (20 = 2 per GradeYear) ──────────────────────────────────────
  console.log('📆  Seeding Terms …');

  const termCycle = [TermType.FIRSTTERM, TermType.SECONDTERM, TermType.THIRDTERM];

  const terms = (
    await Promise.all(
      gradeYears.map(async (gradeYear, i) => {
        const previousTypeIndex = i % 3;
        const currentTypeIndex = (i + 1) % 3;
        const sessionYear = 2025 + Math.floor(i / 3);

        const previousTerm = await prismaClient.terms.create({
          data: {
            name: `${termCycle[previousTypeIndex].replace('TERM', ' Term')} ${sessionYear} (Previous)`,
            type: termCycle[previousTypeIndex],
            status: 'ENDED',
            start: monthOffsetDate(-1, 1),
            end: monthOffsetDate(-1, 27),
            gradeYearId: gradeYear.id,
          },
        });

        const currentTerm = await prismaClient.terms.create({
          data: {
            name: `${termCycle[currentTypeIndex].replace('TERM', ' Term')} ${sessionYear}`,
            type: termCycle[currentTypeIndex],
            status: 'ONGOING',
            start: monthOffsetDate(0, 1),
            end: monthOffsetDate(1, 27),
            gradeYearId: gradeYear.id,
          },
        });

        return [previousTerm, currentTerm];
      }),
    )
  ).flat();

  const previousTermByGradeYearId = new Map<string, (typeof terms)[number]>();
  const currentTermByGradeYearId = new Map<string, (typeof terms)[number]>();
  gradeYears.forEach((gradeYear, i) => {
    previousTermByGradeYearId.set(gradeYear.id, terms[i * 2]);
    currentTermByGradeYearId.set(gradeYear.id, terms[i * 2 + 1]);
  });

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

  // ── 4b. FEE STRUCTURES (100) ─────────────────────────────────────────────
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
    {
      name: 'Field Trip Fee',
      description: 'Optional termly educational excursion or field trip.',
      base: { PRIMARY: 6_000, SECONDARY: 8_000, TERTIARY: 10_000 },
    },
  ] as const;

  const feeStructures = (
    await Promise.all(
      schools.map((school) =>
        Promise.all([
          ...compulsoryFeeTemplates.map((tpl) => {
            const classType = schoolTypeToClassType(school.type);
            return prismaClient.feeStructures.create({
              data: {
                name: tpl.name,
                description: tpl.description,
                currency: 'NGN',
                category: FeeCategory.COMPULSORY,
                amount: tpl.base[classType],
                classType,
                schoolId: school.id,
              },
            });
          }),
          ...optionalFeeTemplates.map((tpl) => {
            const classType = schoolTypeToClassType(school.type);
            return prismaClient.feeStructures.create({
              data: {
                name: tpl.name,
                description: tpl.description,
                currency: 'NGN',
                category: FeeCategory.OPTIONAL,
                amount: tpl.base[classType],
                classType,
                schoolId: school.id,
              },
            });
          }),
        ]),
      ),
    )
  ).flat(2);

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

  // ── 4c. BOARDING HOUSES ───────────────────────────────────────────────────
  //   Every school gets a Boys and a Girls boarding house. These back the
  //   `Boarding Fee` FeeStructure above and give `Students.boardingHousesId`
  //   somewhere real to point to for every ONCAMPUS student, and give
  //   BoardingHouseMatrons (seeded once Staffs exist, see 9c) a house to
  //   attach to.
  console.log('🏠  Seeding BoardingHouses …');

  const boardingHouses = (
    await Promise.all(
      schools.map((school) =>
        Promise.all([
          prismaClient.boardingHouses.create({
            data: { name: 'Boys Hostel', schoolId: school.id },
          }),
          prismaClient.boardingHouses.create({
            data: { name: 'Girls Hostel', schoolId: school.id },
          }),
        ]),
      ),
    )
  ).flat();

  const boardingHousesBySchoolId = new Map<
    string,
    { boys: (typeof boardingHouses)[number]; girls: (typeof boardingHouses)[number] }
  >();
  schools.forEach((school, i) => {
    const [boys, girls] = boardingHouses.slice(i * 2, i * 2 + 2);
    boardingHousesBySchoolId.set(school.id, { boys, girls });
  });

  // ── 5. DEPARTMENTS (46) ──────────────────────────────────────────────────
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
      school: { connect: [] },
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
      school: { connect: [] },
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
      school: { connect: groupASchools.map((s) => ({ id: s.id })) },
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
      school: { connect: groupBSchools.map((s) => ({ id: s.id })) },
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

  const schoolAdmins = await Promise.all(
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
      const admin = await prismaClient.admins.create({
        data: {
          userId: user.id,
          type: SchoolSetup.SINGLE,
          schoolIds: [school.id],
          school: { connect: [{ id: school.id }] },
          groupId: null,
        },
      });
      return { user, admin, schoolId: school.id };
    }),
  );

  // ── 7. SUBJECTS (104) ────────────────────────────────────────────────────
  console.log('📚  Seeding Subjects …');

  // Every non-primary subject is owned by one department (for staffing) and
  // is tagged CORE or ELECTIVE (for student enrollment). CORE subjects are
  // taken by every student in the school regardless of their own
  // department; ELECTIVE subjects are only taken by students who belong to
  // that same owning department — e.g. a Sciences-department student never
  // ends up enrolled in Literature in English (Language) or Financial
  // Accounting (Business), and a Business-department student never ends up
  // enrolled in Physics or Chemistry (Sciences). See the `subjects: {
  // connect: ... }` logic in the student-creation blocks below (§16).
  const subjectTemplates = [
    {
      name: 'Mathematics',
      code: 'MTH101',
      description: 'Number theory, algebra, and geometry.',
      department: 'Mathematics',
      subjectCategory: SubjectCategory.CORE,
    },
    {
      name: 'Further Mathematics',
      code: 'MTH201',
      description: 'Calculus, vectors, and advanced statistics.',
      department: 'Mathematics',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'English Language',
      code: 'ENG101',
      description: 'Grammar, comprehension, and composition.',
      department: 'Language',
      subjectCategory: SubjectCategory.CORE,
    },
    {
      name: 'Literature in English',
      code: 'LIT201',
      description: 'Prose, drama, and poetry analysis.',
      department: 'Language',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Basic Science',
      code: 'BSC101',
      description: 'Introductory physical and life sciences.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Social Studies',
      code: 'SOS101',
      description: 'Civics, history, and geography.',
      department: 'Humanities',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Physics',
      code: 'PHY201',
      description: 'Mechanics, waves, and electromagnetism.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Chemistry',
      code: 'CHM201',
      description: 'Organic and inorganic chemistry.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Biology',
      code: 'BIO201',
      description: 'Cell biology, genetics, and ecology.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Computer Studies',
      code: 'CMP101',
      description: 'Programming fundamentals and ICT literacy.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Economics',
      code: 'ECO201',
      description: 'Micro and macroeconomics for secondary school.',
      department: 'Business',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Financial Accounting',
      code: 'FAC201',
      description: 'Bookkeeping, ledgers, and financial statements.',
      department: 'Business',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Civic Education',
      code: 'CIV101',
      description: 'Citizenship, rights, and responsibilities.',
      department: 'Humanities',
      subjectCategory: SubjectCategory.CORE,
    },
    {
      name: 'Agricultural Sci.',
      code: 'AGR101',
      description: 'Crop science, livestock, and farm management.',
      department: 'Sciences',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
    {
      name: 'Fine Arts',
      code: 'ART101',
      description: 'Drawing, painting, and art history.',
      department: 'Humanities',
      subjectCategory: SubjectCategory.ELECTIVE,
    },
  ] as const;

  const nonPrimarySubjects = (
    await Promise.all(
      nonPrimarySchools.map((school) => {
        const shortName = schoolShortNameById.get(school.id)!;
        return Promise.all(
          subjectTemplates.map((tpl) => {
            const department = departments.find(
              (d) => d.schoolId === school.id && d.name === tpl.department,
            )!;
            return prismaClient.subjects.create({
              data: {
                name: tpl.name,
                code: `${tpl.code}-${shortName.slice(0, 3).toUpperCase()}`,
                status: 'ACTIVE',
                category: tpl.subjectCategory,
                description: tpl.description,
                schoolId: school.id,
                departmentId: department.id,
              },
            });
          }),
        );
      }),
    )
  ).flat();

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
                category: SubjectCategory.CORE,
                description: tpl.description,
                schoolId: school.id,
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
        },
      });
      return { staff, subject, secondarySubject };
    }),
  );

  const teacherStaffs = teacherRecords.map((r) => r.staff);

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

  // ── 9c. BOARDING HOUSE MATRONS ────────────────────────────────────────────
  //   Assign one support-staff member as matron to each school's Boys
  //   Hostel and Girls Hostel (falling back to a single matron covering
  //   both if a school only has one eligible support staffer).
  console.log('🛏️   Seeding BoardingHouseMatrons …');

  const boardingHouseMatrons = (
    await Promise.all(
      schools.map((school) => {
        const pair = boardingHousesBySchoolId.get(school.id);
        if (!pair) return Promise.resolve([]);
        const schoolSupportStaffs = extraStaffs.filter((s) => s.schoolId === school.id);
        const matronForBoys = schoolSupportStaffs[0];
        const matronForGirls = schoolSupportStaffs[1] ?? schoolSupportStaffs[0];

        const creates: ReturnType<typeof prismaClient.boardingHouseMatrons.create>[] = [];
        if (matronForBoys) {
          creates.push(
            prismaClient.boardingHouseMatrons.create({
              data: { boardingHouseId: pair.boys.id, staffId: matronForBoys.id },
            }),
          );
        }
        if (matronForGirls && matronForGirls.id !== matronForBoys?.id) {
          creates.push(
            prismaClient.boardingHouseMatrons.create({
              data: { boardingHouseId: pair.girls.id, staffId: matronForGirls.id },
            }),
          );
        }
        return Promise.all(creates);
      }),
    )
  ).flat();

  // ── 10. CLASSES (20) ─────────────────────────────────────────────────────
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
                // Placeholder — overwritten in §16c once every Students row
                // exists, so this always reflects real enrollment counts.
                population: 0,
                supervisorId: supervisor.id,
                gradeYearId: gradeYears[j % gradeYears.length].id,
                departmentId: supervisor.departmentId,
                schoolId: school.id,
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
                // Placeholder — overwritten in §16c once every Students row
                // exists, so this always reflects real enrollment counts.
                population: 0,
                supervisorId: supervisor.id,
                gradeYearId: gradeYears[(si + j) % gradeYears.length].id,
                departmentId: supervisor.departmentId,
                schoolId: school.id,
              },
            });
          }),
        );
      }),
    )
  ).flat();

  const classes = [...primaryClasses, ...nonPrimaryClasses];

  const classesBySchoolId = new Map<string, typeof classes>();
  primarySchools.forEach((school, si) => {
    classesBySchoolId.set(school.id, primaryClasses.slice(si * 2, si * 2 + 2));
  });
  nonPrimarySchools.forEach((school, si) => {
    classesBySchoolId.set(school.id, nonPrimaryClasses.slice(si * 2, si * 2 + 2));
  });

  // ── 10b. FEE STRUCTURE CLASSES (target fees to specific classes) ─────────
  //   Compulsory fees (Tuition, Library, etc.) apply school-wide, so every
  //   class in the school is linked. Optional fees (Boarding, Lunch, Field
  //   Trip, etc.) are each pinned to just ONE of the school's classes —
  //   this is the concrete demonstration of FeeStructureClasses letting a
  //   fee target specific classes instead of a whole ClassType tier.
  console.log('🎯  Seeding FeeStructureClasses …');

  const feeStructureClasses = (
    await Promise.all(
      schools.map((school) => {
        const catalog = feeStructuresBySchoolId.get(school.id);
        const schoolClasses = classesBySchoolId.get(school.id) ?? [];
        if (!catalog || schoolClasses.length === 0) return Promise.resolve([]);

        const compulsoryLinks = catalog.compulsory.flatMap((structure) =>
          schoolClasses.map((cls) =>
            prismaClient.feeStructureClasses.create({
              data: { feeStructureId: structure.id, classId: cls.id },
            }),
          ),
        );

        const optionalLinks = catalog.optional.map((structure, oi) => {
          const targetClass = schoolClasses[oi % schoolClasses.length];
          return prismaClient.feeStructureClasses.create({
            data: { feeStructureId: structure.id, classId: targetClass.id },
          });
        });

        return Promise.all([...compulsoryLinks, ...optionalLinks]);
      }),
    )
  ).flat(2);

  // ── 11. EXAMS (12, spread across previous/current/next month) ───────────
  console.log('📝  Seeding Exams …');

  const examWindowPlan: Array<{
    monthOffset: -1 | 0 | 1;
    status: 'ENDED' | 'ONGOING' | 'STARTED' | 'UPCOMING';
    day: number;
  }> = [
    { monthOffset: -1, status: 'ENDED', day: 8 },
    { monthOffset: -1, status: 'ENDED', day: 15 },
    { monthOffset: -1, status: 'ENDED', day: 22 },
    { monthOffset: -1, status: 'ENDED', day: 26 },
    { monthOffset: 0, status: 'ONGOING', day: 10 },
    { monthOffset: 0, status: 'ONGOING', day: 17 },
    { monthOffset: 0, status: 'STARTED', day: 20 },
    { monthOffset: 0, status: 'STARTED', day: 24 },
    { monthOffset: 1, status: 'UPCOMING', day: 6 },
    { monthOffset: 1, status: 'UPCOMING', day: 13 },
    { monthOffset: 1, status: 'UPCOMING', day: 20 },
    { monthOffset: 1, status: 'UPCOMING', day: 27 },
  ];

  const examPeriodLabel = { '-1': 'Previous', '0': 'Current', '1': 'Upcoming' } as const;

  const exams = await Promise.all(
    examWindowPlan.map((plan, i) =>
      prismaClient.exams.create({
        data: {
          title: `${subjects[i % subjects.length].name} — ${examPeriodLabel[String(plan.monthOffset) as '-1' | '0' | '1']} Term Exam`,
          status: plan.status,
          startTime: monthOffsetDate(plan.monthOffset, plan.day, 9, 0),
          endTime: monthOffsetDate(plan.monthOffset, plan.day, 11, 0),
        },
      }),
    ),
  );

  const previousExams = exams.filter((_, i) => examWindowPlan[i].monthOffset === -1);
  const upcomingExams = exams.filter((_, i) => examWindowPlan[i].monthOffset === 1);

  // ── 12. TESTS (12, spread across previous/current/next month) ───────────
  console.log('📋  Seeding Tests …');

  const testWindowPlan: Array<{
    monthOffset: -1 | 0 | 1;
    status: 'ENDED' | 'ONGOING' | 'STARTED' | 'UPCOMING';
    day: number;
  }> = [
    { monthOffset: -1, status: 'ENDED', day: 5 },
    { monthOffset: -1, status: 'ENDED', day: 12 },
    { monthOffset: -1, status: 'ENDED', day: 19 },
    { monthOffset: -1, status: 'ENDED', day: 25 },
    { monthOffset: 0, status: 'ONGOING', day: 4 },
    { monthOffset: 0, status: 'ONGOING', day: 11 },
    { monthOffset: 0, status: 'STARTED', day: 18 },
    { monthOffset: 0, status: 'STARTED', day: 23 },
    { monthOffset: 1, status: 'UPCOMING', day: 3 },
    { monthOffset: 1, status: 'UPCOMING', day: 9 },
    { monthOffset: 1, status: 'UPCOMING', day: 16 },
    { monthOffset: 1, status: 'UPCOMING', day: 24 },
  ];

  const tests = await Promise.all(
    testWindowPlan.map((plan, i) =>
      prismaClient.tests.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Mid-Term Test`,
          status: plan.status,
          startTime: monthOffsetDate(plan.monthOffset, plan.day, 9, 0),
          endTime: monthOffsetDate(plan.monthOffset, plan.day, 10, 0),
        },
      }),
    ),
  );

  // ── 13. ASSIGNMENTS (12, spread across previous/current/next month) ─────
  console.log('📄  Seeding Assignments …');

  const assignmentWindowPlan: Array<{
    monthOffset: -1 | 0 | 1;
    status: 'ENDED' | 'ONGOING' | 'STARTED' | 'UPCOMING';
    startDay: number;
    dueDay: number;
  }> = [
    { monthOffset: -1, status: 'ENDED', startDay: 3, dueDay: 10 },
    { monthOffset: -1, status: 'ENDED', startDay: 9, dueDay: 16 },
    { monthOffset: -1, status: 'ENDED', startDay: 15, dueDay: 22 },
    { monthOffset: -1, status: 'ENDED', startDay: 20, dueDay: 27 },
    { monthOffset: 0, status: 'ONGOING', startDay: 2, dueDay: 9 },
    { monthOffset: 0, status: 'ONGOING', startDay: 8, dueDay: 15 },
    { monthOffset: 0, status: 'STARTED', startDay: 14, dueDay: 21 },
    { monthOffset: 0, status: 'STARTED', startDay: 20, dueDay: 27 },
    { monthOffset: 1, status: 'UPCOMING', startDay: 1, dueDay: 8 },
    { monthOffset: 1, status: 'UPCOMING', startDay: 7, dueDay: 14 },
    { monthOffset: 1, status: 'UPCOMING', startDay: 13, dueDay: 20 },
    { monthOffset: 1, status: 'UPCOMING', startDay: 19, dueDay: 26 },
  ];

  const assignments = await Promise.all(
    assignmentWindowPlan.map((plan, i) =>
      prismaClient.assignments.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Assignment ${i + 1}`,
          status: plan.status,
          startTime: monthOffsetDate(plan.monthOffset, plan.startDay, 8, 0),
          dueDate: monthOffsetDate(plan.monthOffset, plan.dueDay, 23, 59),
        },
      }),
    ),
  );

  // ── 14. LESSONS (208) ─────────────────────────────────────────────────────
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
        const periodsPerDay = Math.ceil(schoolSubjects.length / days.length);

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

  const primaryLessons = (
    await Promise.all(
      primarySchools.map((school, si) => {
        const schoolSubjects = primarySubjects.slice(si * 8, si * 8 + 8);
        const teacherOffset = nonPrimarySubjects.length + si * 8;
        const schoolTeachers = teacherStaffs.slice(teacherOffset, teacherOffset + 8);
        const schoolClasses = primaryClasses.slice(si * 2, si * 2 + 2);
        const periodsPerDay = Math.ceil(schoolSubjects.length / days.length);

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

  const usedSlotsByClassId = new Map<string, Set<string>>();

  function slotKey(day: Day, hour: number): string {
    return `${day}#${hour}`;
  }

  function reserveSlot(classId: string, day: Day, hour: number): void {
    const used = usedSlotsByClassId.get(classId) ?? new Set<string>();
    used.add(slotKey(day, hour));
    usedSlotsByClassId.set(classId, used);
  }

  function claimSlot(
    classId: string,
    preferredDayIndex: number,
    preferredHour: number,
  ): { day: Day; hour: number } {
    const used = usedSlotsByClassId.get(classId) ?? new Set<string>();
    for (let attempt = 0; attempt < days.length * 24; attempt++) {
      const dayIndex = (preferredDayIndex + attempt) % days.length;
      const hour = preferredHour + Math.floor(attempt / days.length);
      const day = days[dayIndex];
      if (!used.has(slotKey(day, hour))) {
        reserveSlot(classId, day, hour);
        return { day, hour };
      }
    }
    throw new Error(`No free timetable slot available for class ${classId}`);
  }

  [...nonPrimaryLessons, ...primaryLessons].forEach((lesson) => {
    reserveSlot(lesson.classId, lesson.day, lesson.startTime.getHours());
  });

  // ── 14c. SECOND-SUBJECT LESSONS FOR TEACHERS ─────────────────────────────
  console.log('📘  Assigning second-subject Lessons to teachers …');

  const secondSubjectLessons = await Promise.all(
    teacherRecords
      .filter((r) => r.secondarySubject.id !== r.subject.id)
      .map(async (r, i) => {
        const schoolClasses = classesBySchoolId.get(r.staff.schoolId) ?? [];
        const cls = schoolClasses[i % schoolClasses.length];
        const preferredDayIndex = i % days.length;
        const preferredHour = 13 + (i % 2);
        const { day, hour } = claimSlot(cls.id, preferredDayIndex, preferredHour);

        return prismaClient.lessons.create({
          data: {
            name: `${r.secondarySubject.name} — ${cls.name} — ${r.staff.staffId} (2nd subject)`,
            description: `${r.secondarySubject.name} period for ${cls.name}, taught by ${r.staff.staffId} as a second subject.`,
            day,
            status: 'UPCOMING',
            startTime: new Date(2026, 0, 5, hour, 0, 0),
            endTime: new Date(2026, 0, 5, hour + 1, 0, 0),
            subjectId: r.secondarySubject.id,
            classId: cls.id,
            staffId: r.staff.id,
            assignmentId: assignments[i % assignments.length].id,
          },
        });
      }),
  );

  // ── 14b. ASSIGN SUBJECTS & LESSONS TO SUPPORT STAFF ──────────────────────
  console.log('📎  Assigning Lessons to support staff …');

  const supportStaffs = [...primaryStaffs, ...extraStaffs];

  const supportLessons = await Promise.all(
    supportStaffs.map(async (staff, i) => {
      const deptSubjects = subjects.filter((s) => s.departmentId === staff.departmentId);
      const subject = deptSubjects[i % deptSubjects.length];

      const schoolClasses = classesBySchoolId.get(staff.schoolId) ?? [];
      const cls = schoolClasses[i % schoolClasses.length];
      const preferredDayIndex = i % days.length;
      const preferredHour = 14 + (i % 3);
      const { day, hour } = claimSlot(cls.id, preferredDayIndex, preferredHour);

      return prismaClient.lessons.create({
        data: {
          name: `${subject.name} — ${cls.name} — ${staff.position} (${staff.staffId})`,
          description: `${subject.name} support session for ${cls.name}, led by ${staff.position} ${staff.staffId}.`,
          day,
          status: 'UPCOMING',
          startTime: new Date(2026, 0, 5, hour, 0, 0),
          endTime: new Date(2026, 0, 5, hour + 1, 0, 0),
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

  // ── 14d. CLASS SUBJECTS (class ↔ subject ↔ staff offerings) ──────────────
  console.log('🔗  Seeding ClassSubjects …');

  const classSubjectKey = (classId: string, subjectId: string) => `${classId}::${subjectId}`;

  const staffIdByClassSubjectKey = new Map<string, string>();
  lessons.forEach((lesson) => {
    const key = classSubjectKey(lesson.classId, lesson.subjectId);
    if (!staffIdByClassSubjectKey.has(key)) {
      staffIdByClassSubjectKey.set(key, lesson.staffId);
    }
  });

  const classSubjects = await Promise.all(
    Array.from(staffIdByClassSubjectKey.entries()).map(([key, staffId]) => {
      const [classId, subjectId] = key.split('::');
      return prismaClient.classSubjects.create({
        data: { classId, subjectId, staffId },
      });
    }),
  );

  const classSubjectIdByKey = new Map(
    classSubjects.map((cs) => [classSubjectKey(cs.classId, cs.subjectId), cs.id]),
  );

  await Promise.all(
    lessons.map((lesson) => {
      const classSubjectId = classSubjectIdByKey.get(
        classSubjectKey(lesson.classId, lesson.subjectId),
      );
      if (!classSubjectId) return Promise.resolve();
      return prismaClient.lessons.update({
        where: { id: lesson.id },
        data: { classSubjectId },
      });
    }),
  );

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
  console.log('🎒  Seeding Students …');

  const STUDENTS_PER_NON_PRIMARY_CLASS = 2;

  const studentSubjectsMap = new Map<string, { id: string; name: string }[]>();

  const nonPrimaryStudents = (
    await Promise.all(
      nonPrimaryClasses.map((cls, classIdx) => {
        const si = Math.floor(classIdx / 2);
        const school = nonPrimarySchools[si];
        const schoolSubjects = nonPrimarySubjects.slice(
          si * subjectTemplates.length,
          (si + 1) * subjectTemplates.length,
        );
        const schoolDepartments = departments.filter((d) => d.schoolId === school.id);

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
            const department = schoolDepartments[globalIndex % schoolDepartments.length];
            const isOnCampus = globalIndex % 3 === 0;
            const boardingPair = boardingHousesBySchoolId.get(school.id);
            // A student takes every CORE subject in the school (Mathematics,
            // English Language, Civic Education) plus only the ELECTIVE
            // subjects owned by their own department — so a Sciences student
            // is never enrolled in Literature in English or Financial
            // Accounting, and a Business student is never enrolled in
            // Physics or Chemistry.
            const enrolledSubjects = schoolSubjects.filter(
              (s) => s.category === SubjectCategory.CORE || s.departmentId === department.id,
            );
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation: isOnCampus ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                examId: upcomingExams[globalIndex % upcomingExams.length].id,
                testId: tests[globalIndex % tests.length].id,
                assignmentId: assignments[globalIndex % assignments.length].id,
                departmentId: department.id,
                subjects: { connect: enrolledSubjects.map((s) => ({ id: s.id })) },
                boardingHousesId: isOnCampus
                  ? gender === Gender.MALE
                    ? boardingPair?.boys.id
                    : boardingPair?.girls.id
                  : undefined,
              },
            });
            studentSubjectsMap.set(student.id, enrolledSubjects);
            return student;
          }),
        );
      }),
    )
  ).flat();

  const primaryStudents = await Promise.all(
    primaryClasses.map(async (cls, classIdx) => {
      const si = Math.floor(classIdx / primaryClassDefs.length);
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
      const isOnCampus = classIdx % 2 === 0;
      const boardingPair = boardingHousesBySchoolId.get(school.id);
      const student = await prismaClient.students.create({
        data: {
          userId: user.id,
          position: nextStudentPosition(),
          studentId: `STU-P-${String(classIdx + 1).padStart(3, '0')}`,
          accomodation: isOnCampus ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
          classId: cls.id,
          guardianId: guardians[classIdx % guardians.length].id,
          schoolId: school.id,
          gradeYearId: cls.gradeYearId,
          examId: upcomingExams[classIdx % upcomingExams.length].id,
          testId: tests[classIdx % tests.length].id,
          assignmentId: assignments[classIdx % assignments.length].id,
          departmentId: cls.departmentId,
          subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
          boardingHousesId: isOnCampus
            ? gender === Gender.MALE
              ? boardingPair?.boys.id
              : boardingPair?.girls.id
            : undefined,
        },
      });
      studentSubjectsMap.set(student.id, schoolSubjects);
      return student;
    }),
  );

  // ── 16b. EXTRA STUDENTS (10 per school = 100) ────────────────────────────
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
        const schoolDepartments = departments.filter((d) => d.schoolId === school.id);
        return Promise.all(
          Array.from({ length: EXTRA_STUDENTS_PER_SCHOOL }, async (_, j) => {
            const globalIndex = 2000 + si * EXTRA_STUDENTS_PER_SCHOOL + j;
            const cls = schoolClasses[j % schoolClasses.length];
            const department = schoolDepartments[j % schoolDepartments.length];
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
            const isOnCampus = globalIndex % 3 === 0;
            const boardingPair = boardingHousesBySchoolId.get(school.id);
            // Same CORE + own-department-ELECTIVE enrollment rule as the
            // regular non-primary students above.
            const enrolledSubjects = schoolSubjects.filter(
              (s) => s.category === SubjectCategory.CORE || s.departmentId === department.id,
            );
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-X-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation: isOnCampus ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                examId: upcomingExams[globalIndex % upcomingExams.length].id,
                testId: tests[globalIndex % tests.length].id,
                assignmentId: assignments[globalIndex % assignments.length].id,
                departmentId: department.id,
                subjects: { connect: enrolledSubjects.map((s) => ({ id: s.id })) },
                boardingHousesId: isOnCampus
                  ? gender === Gender.MALE
                    ? boardingPair?.boys.id
                    : boardingPair?.girls.id
                  : undefined,
              },
            });
            studentSubjectsMap.set(student.id, enrolledSubjects);
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
        const schoolDepartments = departments.filter((d) => d.schoolId === school.id);
        return Promise.all(
          Array.from({ length: EXTRA_STUDENTS_PER_SCHOOL }, async (_, j) => {
            const globalIndex = 3000 + si * EXTRA_STUDENTS_PER_SCHOOL + j;
            const cls = schoolClasses[j % schoolClasses.length];
            const department = schoolDepartments[j % schoolDepartments.length];
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
            const isOnCampus = globalIndex % 2 === 0;
            const boardingPair = boardingHousesBySchoolId.get(school.id);
            const student = await prismaClient.students.create({
              data: {
                userId: user.id,
                position: nextStudentPosition(),
                studentId: `STU-XP-${String(globalIndex + 1).padStart(4, '0')}`,
                accomodation: isOnCampus ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
                classId: cls.id,
                guardianId: guardians[globalIndex % guardians.length].id,
                schoolId: school.id,
                gradeYearId: cls.gradeYearId,
                examId: upcomingExams[globalIndex % upcomingExams.length].id,
                testId: tests[globalIndex % tests.length].id,
                assignmentId: assignments[globalIndex % assignments.length].id,
                departmentId: department.id,
                subjects: { connect: schoolSubjects.map((s) => ({ id: s.id })) },
                boardingHousesId: isOnCampus
                  ? gender === Gender.MALE
                    ? boardingPair?.boys.id
                    : boardingPair?.girls.id
                  : undefined,
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

  // ── 16c. SYNC CLASS POPULATION ───────────────────────────────────────────
  //   Classes.population was seeded as a placeholder (0) back in §10 because
  //   students are created across three separate cohorts (regular, primary,
  //   extra) afterward. Now that every Students row exists, count actual
  //   enrollment per classId and write the real number back onto each
  //   Classes row — this is the only source of truth for `population`
  //   going forward; nothing else should hardcode it.
  console.log('🔢  Syncing Classes.population to actual enrollment …');

  const studentCountByClassId = new Map<string, number>();
  students.forEach((student) => {
    studentCountByClassId.set(
      student.classId,
      (studentCountByClassId.get(student.classId) ?? 0) + 1,
    );
  });

  await Promise.all(
    classes.map((cls) =>
      prismaClient.classes.update({
        where: { id: cls.id },
        data: { population: studentCountByClassId.get(cls.id) ?? 0 },
      }),
    ),
  );

  // ── 17. ATTENDANCE ───────────────────────────────────────────────────────
  console.log('✅  Seeding StudentAttendance …');

  const studentsBySchoolId = new Map<string, typeof students>();
  students.forEach((student) => {
    const schoolId = student.schoolId!;
    const list = studentsBySchoolId.get(schoolId) ?? [];
    list.push(student);
    studentsBySchoolId.set(schoolId, list);
  });

  const lessonsByClassIdForAttendance = new Map<string, typeof lessons>();
  lessons.forEach((lesson) => {
    const list = lessonsByClassIdForAttendance.get(lesson.classId) ?? [];
    list.push(lesson);
    lessonsByClassIdForAttendance.set(lesson.classId, list);
  });

  const weekdayOccurrencesInWindow = new Map<Day, Date[]>();
  function occurrencesFor(day: Day): Date[] {
    let occurrences = weekdayOccurrencesInWindow.get(day);
    if (!occurrences) {
      occurrences = weekdayDatesInRange(day, WINDOW_START, WINDOW_END);
      weekdayOccurrencesInWindow.set(day, occurrences);
    }
    return occurrences;
  }

  const lessonAttendanceDate = new Map<string, Date>();
  lessonsByClassIdForAttendance.forEach((classLessons) => {
    classLessons.forEach((lesson, li) => {
      const occurrences = occurrencesFor(lesson.day);
      lessonAttendanceDate.set(lesson.id, occurrences[li % occurrences.length]);
    });
  });

  function presentRateFor(rankInSchool: number, schoolSize: number): number {
    const veryPoorCount = Math.max(1, Math.ceil(schoolSize * 0.05));
    const below60Count = Math.max(veryPoorCount, Math.ceil(schoolSize * 0.1));

    if (rankInSchool < veryPoorCount) {
      return 0.3 + (rankInSchool % 4) * 0.03;
    }
    if (rankInSchool < below60Count) {
      return 0.5 + ((rankInSchool - veryPoorCount) % 5) * 0.018;
    }
    const normalRank = rankInSchool - below60Count;
    return 0.75 + (normalRank % 7) * 0.033;
  }

  const studentAttendanceRecords = await Promise.all(
    students.flatMap((student) => {
      const schoolId = student.schoolId!;
      const schoolStudents = studentsBySchoolId.get(schoolId) ?? [student];
      const rankInSchool = schoolStudents.findIndex((s) => s.id === student.id);
      const presentRate = presentRateFor(rankInSchool, schoolStudents.length);

      const allClassLessons = lessonsByClassIdForAttendance.get(student.classId) ?? [];
      // A student only actually sits in lessons for subjects they're
      // enrolled in (Students.subjects, populated via studentSubjectsMap
      // when the student was created). CORE subjects apply to every
      // student in the class, but ELECTIVE lessons scheduled for that same
      // class may belong to a different department's students — those
      // must be excluded here, otherwise attendance (and anything derived
      // from it, e.g. "students taught by this teacher") would include
      // students who were never actually enrolled in that subject.
      const enrolledSubjectIds = new Set(
        (studentSubjectsMap.get(student.id) ?? []).map((s) => s.id),
      );
      const classLessons = allClassLessons.filter((lesson) =>
        enrolledSubjectIds.has(lesson.subjectId),
      );
      const absentTarget = Math.round(classLessons.length * (1 - presentRate));

      return classLessons.map((lesson, li) => {
        const shifted = (li + rankInSchool) % classLessons.length;
        const isPresent = shifted >= absentTarget;
        const attendanceDate = lessonAttendanceDate.get(lesson.id)!;

        let clockIn: Date | null = null;
        let clockOut: Date | null = null;
        if (isPresent) {
          clockIn = new Date(attendanceDate);
          clockIn.setHours(lesson.startTime.getHours(), lesson.startTime.getMinutes(), 0, 0);
          clockOut = new Date(attendanceDate);
          clockOut.setHours(lesson.endTime.getHours(), lesson.endTime.getMinutes(), 0, 0);
        }

        return prismaClient.studentAttendance.create({
          data: {
            date: attendanceDate,
            attendance: isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
            clockIn,
            clockOut,
            studentId: student.id,
            lessonId: lesson.id,
            schoolId,
          },
        });
      });
    }),
  );

  // ── 17b. STAFF ATTENDANCE (daily school clock-in/out) ────────────────────
  console.log('🕗  Seeding StaffAttendance …');

  const STAFF_ATTENDANCE_DAYS = 18;
  const staffAttendanceStride = Math.max(
    1,
    Math.floor(SCHOOL_DAYS_IN_WINDOW.length / STAFF_ATTENDANCE_DAYS),
  );
  const staffAttendanceDates = Array.from({ length: STAFF_ATTENDANCE_DAYS }, (_, d) => {
    const idx = Math.min(d * staffAttendanceStride, SCHOOL_DAYS_IN_WINDOW.length - 1);
    return SCHOOL_DAYS_IN_WINDOW[idx];
  });

  function staffAttendanceStatusFor(seed: number): AttendanceStatus {
    const cycle = [
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.PRESENT,
      AttendanceStatus.LATE,
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
    ] as const;
    return cycle[seed % cycle.length];
  }

  const staffAttendanceRecords = await Promise.all(
    allStaffs.flatMap((staff, si) =>
      Array.from({ length: STAFF_ATTENDANCE_DAYS }, (_, d) => {
        const seed = si * STAFF_ATTENDANCE_DAYS + d;
        const status = staffAttendanceStatusFor(seed);
        const date = staffAttendanceDates[d];

        let clockIn: Date | null = null;
        let clockOut: Date | null = null;
        if (status !== AttendanceStatus.ABSENT) {
          const lateMinutes = status === AttendanceStatus.LATE ? 20 + (seed % 20) : seed % 10;
          clockIn = new Date(date);
          clockIn.setHours(7, 30 + lateMinutes, 0, 0);
          clockOut = new Date(date);
          clockOut.setHours(16, 0, 0, 0);
        }

        return prismaClient.staffAttendance.create({
          data: {
            date,
            status,
            clockIn,
            clockOut,
            schoolId: staff.schoolId,
            staffId: staff.id,
          },
        });
      }),
    ),
  );

  // ── 17c. LESSON ATTENDANCE (per-lesson teaching clock-in/out) ────────────
  console.log('📔  Seeding LessonAttendance …');

  const lessonAttendanceRecords = await Promise.all(
    lessons.map((lesson, li) => {
      const date = lessonAttendanceDate.get(lesson.id)!;
      const status = staffAttendanceStatusFor(li + 3);

      let clockIn: Date | null = null;
      let clockOut: Date | null = null;
      if (status !== AttendanceStatus.ABSENT) {
        clockIn = new Date(date);
        clockIn.setHours(lesson.startTime.getHours(), lesson.startTime.getMinutes(), 0, 0);
        clockOut = new Date(date);
        clockOut.setHours(lesson.endTime.getHours(), lesson.endTime.getMinutes(), 0, 0);
      }

      return prismaClient.lessonAttendance.create({
        data: {
          date,
          status,
          clockIn,
          clockOut,
          lessonId: lesson.id,
          staffId: lesson.staffId,
        },
      });
    }),
  );

  // ── 18. REPORT CARDS (2 per student) ──────────────────────────────────────
  console.log('📊  Seeding ReportCards …');

  const examById = new Map(exams.map((e) => [e.id, e]));

  const reportCards = (
    await Promise.all(
      students.map(async (student, i) => {
        const studentSubjects = studentSubjectsMap.get(student.id);
        const subjectConnect = studentSubjects?.length
          ? { connect: [{ id: studentSubjects[0].id }] }
          : undefined;

        const previousExam = previousExams[i % previousExams.length];
        const upcomingExam = student.examId ? examById.get(student.examId) : undefined;

        const previousReportCard = await prismaClient.reportCards.create({
          data: {
            testScore: 55 + (i % 35),
            assignmentScore: 60 + (i % 30),
            examScore: 50 + (i % 40),
            attendanceScore: 70 + (i % 25),
            status: 'COMPLETED',
            teacherComment: `Final result for "${previousExam.title}" — shows consistent effort and good classroom participation.`,
            generalComment: 'A pleasure to teach last term — keep up the excellent work.',
            studentId: student.id,
            subjects: subjectConnect,
          },
        });

        const currentReportCard = await prismaClient.reportCards.create({
          data: {
            testScore: 40 + (i % 30),
            assignmentScore: 45 + (i % 25),
            examScore: 0,
            attendanceScore: 65 + (i % 20),
            status: 'INCOMPLETE',
            teacherComment: upcomingExam
              ? `In progress this term — final scores are pending "${upcomingExam.title}".`
              : 'In progress this term — final scores pending upcoming assessments.',
            generalComment: 'Continues to make steady progress this term.',
            studentId: student.id,
            subjects: subjectConnect,
          },
        });

        return [previousReportCard, currentReportCard];
      }),
    )
  ).flat();

  // ── 19. FEE INVOICES + FEES + RECEIPTS (billed per term) ─────────────────
  console.log('💰  Seeding FeeInvoices + Fees + Receipts …');

  const bursarBySchoolId = new Map<string, (typeof extraStaffs)[number]>();
  schools.forEach((school) => {
    const bursar = extraStaffs.find((s) => s.schoolId === school.id && s.position === 'Bursar');
    if (bursar) bursarBySchoolId.set(school.id, bursar);
  });

  function paymentMethodFor(seed: number): 'CASH' | 'TRANSFER' | 'POS' {
    const cycle = ['TRANSFER', 'CASH', 'POS'] as const;
    return cycle[seed % cycle.length];
  }

  function currentTermFeeStatus(seed: number): 'PAID' | 'PARTIAL' | 'UNPAID' {
    const cycle = ['UNPAID', 'UNPAID', 'PARTIAL', 'UNPAID', 'PARTIAL', 'PAID'] as const;
    return cycle[seed % cycle.length];
  }

  function isOptionalFeeApplicable(
    structureName: string,
    student: { accomodation: Accomodation | null },
    seed: number,
  ): boolean {
    switch (structureName) {
      case 'Boarding Fee':
        return student.accomodation === Accomodation.ONCAMPUS;
      case 'Transportation Fee (School Bus)':
        return student.accomodation === Accomodation.OFFCAMPUS && seed % 3 !== 0;
      case 'Lunch Fee':
        return seed % 5 !== 4;
      case 'Extracurricular Activities Fee':
        return seed % 2 === 0;
      case 'Field Trip Fee':
        return seed % 10 !== 9;
      default:
        return true;
    }
  }

  type PlannedFeeItem = {
    structure: (typeof feeStructures)[number];
    category: 'COMPULSORY' | 'OPTIONAL';
    amount: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
    paid: number;
    outstanding: number;
    seed: number;
  };

  let receiptsCreated = 0;
  let feeInvoicesCreated = 0;
  let studentsCarryingPreviousBalance = 0;

  const billedInvoiceKeys = new Set<string>();
  function claimInvoiceSlot(studentId: string, termId: string): void {
    const key = `${studentId}:${termId}`;
    if (billedInvoiceKeys.has(key)) {
      throw new Error(
        `Attempted to create a second FeeInvoice for student ${studentId} + term ${termId} — a student may have exactly one invoice per term.`,
      );
    }
    billedInvoiceKeys.add(key);
  }

  const invoicesByStudentId = new Map<
    string,
    {
      previous: {
        invoice: Awaited<ReturnType<typeof prismaClient.feeInvoice.create>>;
        feeItems: Awaited<ReturnType<typeof prismaClient.fees.create>>[];
      };
      current: {
        invoice: Awaited<ReturnType<typeof prismaClient.feeInvoice.create>>;
        feeItems: Awaited<ReturnType<typeof prismaClient.fees.create>>[];
      };
    }
  >();

  const fees = (
    await Promise.all(
      students.map(async (student, i) => {
        const schoolId = student.schoolId!;
        const catalog = feeStructuresBySchoolId.get(schoolId);
        if (!catalog) return [];

        const schoolClasses = classesBySchoolId.get(schoolId) ?? [];
        const classIndex = Math.max(
          schoolClasses.findIndex((c) => c.id === student.classId),
          0,
        );
        const classDifferential = classIndex * 1_500;
        const issuedById = bursarBySchoolId.get(schoolId)?.id;

        const previousTerm =
          (student.gradeYearId ? previousTermByGradeYearId.get(student.gradeYearId) : undefined) ??
          terms[0];
        const currentTerm =
          (student.gradeYearId ? currentTermByGradeYearId.get(student.gradeYearId) : undefined) ??
          terms[1];

        const receiptIdFor = async (
          termLabel: 'previous' | 'current',
          status: 'PAID' | 'PARTIAL' | 'UNPAID',
          seed: number,
          paidAmount: number,
        ): Promise<string | undefined> => {
          if (paidAmount <= 0) return undefined;
          const receipt = await prismaClient.receipt.create({
            data: {
              receiptNumber: `RCT-${schoolId.slice(0, 4).toUpperCase()}-${
                termLabel === 'previous' ? 'P' : 'C'
              }-${String(seed + 1).padStart(5, '0')}`,
              amount: paidAmount,
              currency: 'NGN',
              paymentMethod: paymentMethodFor(seed),
              notes: status === 'PAID' ? 'Payment received in full.' : 'Partial payment received.',
              studentId: student.id,
              schoolId,
              issuedById,
            },
          });
          receiptsCreated += 1;
          return receipt.id;
        };

        const billTerm = async (
          termLabel: 'previous' | 'current',
          termId: string,
          statusFor: (seed: number) => 'PAID' | 'PARTIAL' | 'UNPAID',
          seedOffset: number,
        ) => {
          const plannedCompulsoryItems: PlannedFeeItem[] = catalog.compulsory.map(
            (structure, si) => {
              const seed = seedOffset + si;
              const status = statusFor(seed);
              const amount = structure.amount + classDifferential;
              const { paid, outstanding } = paymentSplit(amount, status, seed);
              return {
                structure,
                category: 'COMPULSORY' as const,
                amount,
                status,
                paid,
                outstanding,
                seed,
              };
            },
          );

          const plannedOptionalItems: PlannedFeeItem[] = catalog.optional
            .map((structure, oi) => ({
              structure,
              seed: seedOffset + catalog.compulsory.length + oi,
            }))
            .filter(({ structure, seed }) => isOptionalFeeApplicable(structure.name, student, seed))
            .map(({ structure, seed }) => {
              const status = statusFor(seed);
              const amount = structure.amount + classDifferential;
              const { paid, outstanding } = paymentSplit(amount, status, seed);
              return {
                structure,
                category: 'OPTIONAL' as const,
                amount,
                status,
                paid,
                outstanding,
                seed,
              };
            });

          const plannedItems = [...plannedCompulsoryItems, ...plannedOptionalItems];

          const totalAmount = plannedItems.reduce((sum, item) => sum + item.amount, 0);
          const totalPaid = plannedItems.reduce((sum, item) => sum + item.paid, 0);
          const totalOutstanding = plannedItems.reduce((sum, item) => sum + item.outstanding, 0);

          claimInvoiceSlot(student.id, termId);

          const invoice = await prismaClient.feeInvoice.create({
            data: {
              invoiceNumber: `INV-${schoolId.slice(0, 4).toUpperCase()}-${
                termLabel === 'previous' ? 'P' : 'C'
              }-${String(seedOffset + 1).padStart(5, '0')}`,
              totalAmount,
              totalPaid,
              totalOutstanding,
              currency: 'NGN',
              status: invoiceStatusFor(totalPaid, totalAmount),
              studentId: student.id,
              schoolId,
              classId: student.classId,
              termId,
            },
          });
          feeInvoicesCreated += 1;

          const feeItems = await Promise.all(
            plannedItems.map(async (item) => {
              const receiptId = await receiptIdFor(termLabel, item.status, item.seed, item.paid);
              return prismaClient.fees.create({
                data: {
                  name: item.structure.name,
                  description: item.structure.description,
                  currency: 'NGN',
                  amount: item.amount,
                  paid: item.paid,
                  outstanding: item.outstanding,
                  category:
                    item.category === 'COMPULSORY' ? FeeCategory.COMPULSORY : FeeCategory.OPTIONAL,
                  status: item.status,
                  invoiceId: invoice.id,
                  studentId: student.id,
                  schoolId,
                  classId: student.classId,
                  feeStructureId: item.structure.id,
                  termId,
                  receiptId,
                },
              });
            }),
          );

          return { invoice, feeItems };
        };

        const isFullyPaidStudent = i % 4 === 0;
        const previousResult = await billTerm(
          'previous',
          previousTerm.id,
          (seed) => (isFullyPaidStudent ? 'PAID' : feeStatus(seed)),
          i * 10,
        );
        const currentResult = await billTerm(
          'current',
          currentTerm.id,
          currentTermFeeStatus,
          i * 10 + 100,
        );

        invoicesByStudentId.set(student.id, { previous: previousResult, current: currentResult });

        if (previousResult.feeItems.some((f) => f.outstanding > 0)) {
          studentsCarryingPreviousBalance += 1;
        }

        return [...previousResult.feeItems, ...currentResult.feeItems];
      }),
    )
  ).flat();

  // ── 19a. SAMPLE FEE BREAKDOWN (verification output) ──────────────────────
  console.log('🧾  Sample fee breakdown …');

  function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString('en-NG')}`;
  }

  function printInvoiceBreakdown(
    label: string,
    entry: {
      invoice: {
        invoiceNumber: string;
        totalAmount: number;
        totalPaid: number;
        totalOutstanding: number;
        status: string;
      };
      feeItems: {
        name: string;
        amount: number;
        paid: number;
        outstanding: number;
        status: string;
      }[];
    },
  ): void {
    console.log(`  ${label} — Invoice ${entry.invoice.invoiceNumber} [${entry.invoice.status}]`);
    entry.feeItems.forEach((item) => {
      console.log(
        `    • ${item.name}: ${formatNaira(item.amount)} — paid ${formatNaira(item.paid)}, owing ${formatNaira(item.outstanding)} [${item.status}]`,
      );
    });
    console.log(
      `    Invoice total: ${formatNaira(entry.invoice.totalAmount)}  |  Paid: ${formatNaira(entry.invoice.totalPaid)}  |  Outstanding: ${formatNaira(entry.invoice.totalOutstanding)}`,
    );
  }

  const sampleStudent =
    students.find((s) => {
      const entry = invoicesByStudentId.get(s.id);
      return entry && entry.previous.invoice.totalOutstanding > 0;
    }) ?? students[0];
  const sampleEntry = invoicesByStudentId.get(sampleStudent.id);

  if (sampleEntry) {
    console.log(`  Student ${sampleStudent.studentId}:`);
    printInvoiceBreakdown('Previous term', sampleEntry.previous);
    printInvoiceBreakdown('Current term', sampleEntry.current);
  }

  // ── 19b. TIMETABLES + TIMETABLE PERIODS (20 timetables) ──────────────────
  console.log('🗓️   Seeding Timetables …');

  const lessonsByClassId = new Map<string, typeof lessons>();
  lessons.forEach((lesson) => {
    const list = lessonsByClassId.get(lesson.classId) ?? [];
    list.push(lesson);
    lessonsByClassId.set(lesson.classId, list);
  });

  const timetables = await Promise.all(
    classes.map(async (cls, i) => {
      const classLessons = lessonsByClassId.get(cls.id) ?? [];
      const term =
        (cls.gradeYearId ? currentTermByGradeYearId.get(cls.gradeYearId) : undefined) ??
        terms[i % terms.length];

      const schoolId = cls.schoolId;
      if (!schoolId) {
        throw new Error(
          `Class "${cls.name}" (${cls.id}) has no schoolId — cannot create its Timetable.`,
        );
      }

      const timetable = await prismaClient.timetables.create({
        data: {
          name: `${cls.name} Timetable`,
          status: 'ONGOING',
          schoolId,
          classId: cls.id,
          gradeYearId: cls.gradeYearId,
          termId: term.id,
        },
      });

      await Promise.all([
        ...classLessons.map((lesson) =>
          prismaClient.timetablePeriods.create({
            data: {
              name: lesson.name,
              day: lesson.day,
              startTime: lesson.startTime,
              endTime: lesson.endTime,
              periodType: 'TEACHING',
              timetableId: timetable.id,
              lessonId: lesson.id,
            },
          }),
        ),
        prismaClient.timetablePeriods.create({
          data: {
            name: `${cls.name} Morning Assembly`,
            day: Day.MONDAY,
            startTime: new Date(2026, 0, 5, 7, 30, 0),
            endTime: new Date(2026, 0, 5, 7, 50, 0),
            periodType: 'ASSEMBLY',
            timetableId: timetable.id,
          },
        }),
      ]);

      return timetable;
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

  // ── 22. NOTIFICATIONS ──────────────────────────────────────────────────────
  console.log('🔔  Seeding Notifications …');

  type NotificationIconName =
    | 'MEGAPHONE_FILL'
    | 'CASH_COIN'
    | 'CASH_STACK'
    | 'PERSON_FILL_EXCLAMATION'
    | 'JOURNAL_CHECK'
    | 'PENCIL_SQUARE'
    | 'CALENDAR2_WEEK_FILL'
    | 'CALENDAR_EVENT_FILL'
    | 'CLIPBOARD2_CHECK_FILL'
    | 'FILE_EARMARK_BAR_GRAPH_FILL'
    | 'INFO_CIRCLE_FILL';

  type NotificationColorName =
    | 'GREEN'
    | 'YELLOW'
    | 'ORANGE'
    | 'RED'
    | 'PURPLE'
    | 'TEAL'
    | 'PINK'
    | 'INDIGO';

  type NotificationStyle = { icon: NotificationIconName; color: NotificationColorName };

  function chip(color: NotificationColorName, icon: NotificationIconName): NotificationStyle {
    return { icon, color };
  }

  const NOTIFICATION_TYPE_STYLE: Record<
    | 'ANNOUNCEMENT'
    | 'FEE_REMINDER'
    | 'ATTENDANCE_ALERT'
    | 'EXAM_SCHEDULED'
    | 'TIMETABLE_CHANGE'
    | 'REPORT_CARD_READY'
    | 'GENERAL',
    NotificationStyle
  > = {
    ANNOUNCEMENT: chip('INDIGO', 'MEGAPHONE_FILL'),
    FEE_REMINDER: chip('YELLOW', 'CASH_COIN'),
    ATTENDANCE_ALERT: chip('ORANGE', 'PERSON_FILL_EXCLAMATION'),
    EXAM_SCHEDULED: chip('RED', 'JOURNAL_CHECK'),
    TIMETABLE_CHANGE: chip('PURPLE', 'CALENDAR2_WEEK_FILL'),
    REPORT_CARD_READY: chip('TEAL', 'FILE_EARMARK_BAR_GRAPH_FILL'),
    GENERAL: chip('PINK', 'INFO_CIRCLE_FILL'),
  };

  const NOTIFICATION_ENTITY_TYPE_STYLE: Record<
    'ANNOUNCEMENT' | 'FEE' | 'EXAM' | 'TEST' | 'ASSIGNMENT' | 'TIMETABLE' | 'EVENT' | 'REPORT_CARD',
    NotificationStyle
  > = {
    ANNOUNCEMENT: chip('INDIGO', 'MEGAPHONE_FILL'),
    FEE: chip('YELLOW', 'CASH_STACK'),
    EXAM: chip('RED', 'JOURNAL_CHECK'),
    TEST: chip('ORANGE', 'PENCIL_SQUARE'),
    ASSIGNMENT: chip('TEAL', 'CLIPBOARD2_CHECK_FILL'),
    TIMETABLE: chip('PURPLE', 'CALENDAR2_WEEK_FILL'),
    EVENT: chip('PINK', 'CALENDAR_EVENT_FILL'),
    REPORT_CARD: chip('GREEN', 'FILE_EARMARK_BAR_GRAPH_FILL'),
  };

  function styleForNotification(
    type: keyof typeof NOTIFICATION_TYPE_STYLE,
    entityType?: keyof typeof NOTIFICATION_ENTITY_TYPE_STYLE | null,
  ): NotificationStyle {
    if (entityType && NOTIFICATION_ENTITY_TYPE_STYLE[entityType]) {
      return NOTIFICATION_ENTITY_TYPE_STYLE[entityType];
    }
    return NOTIFICATION_TYPE_STYLE[type];
  }

  const globalNotificationDefs = [
    {
      title: 'Platform Maintenance Notice',
      message: 'EduAdmin Pro underwent scheduled maintenance last month to improve performance.',
      type: 'GENERAL',
      priority: 'LOW',
      monthOffset: -1 as const,
      day: 12,
    },
    {
      title: 'New Feature: Analytics Dashboard',
      message: 'A new analytics dashboard is now live across all schools this month.',
      type: 'ANNOUNCEMENT',
      priority: 'NORMAL',
      monthOffset: 0 as const,
      day: 5,
    },
    {
      title: 'System-Wide Policy Update',
      message: 'An updated data-privacy policy takes effect this month — please review it.',
      type: 'GENERAL',
      priority: 'NORMAL',
      monthOffset: 0 as const,
      day: 18,
    },
    {
      title: 'Upcoming Platform Upgrade',
      message: 'EduAdmin Pro will roll out a scheduled platform upgrade next month.',
      type: 'ANNOUNCEMENT',
      priority: 'HIGH',
      monthOffset: 1 as const,
      day: 4,
    },
  ] as const;

  const globalNotifications = await Promise.all(
    globalNotificationDefs.map((def) => {
      const style = styleForNotification(def.type, 'ANNOUNCEMENT');
      return prismaClient.notifications.create({
        data: {
          title: def.title,
          message: def.message,
          type: def.type,
          priority: def.priority,
          icon: style.icon,
          bgColor: style.color,
          iconColor: style.color,
          schoolId: null,
          entityType: 'ANNOUNCEMENT',
          createdAt: monthOffsetDate(def.monthOffset, def.day, 8, 0),
        },
      });
    }),
  );

  const schoolNotificationDefs = [
    {
      title: 'Last Term Fees Reconciled',
      message: 'Fee records for last term have been reconciled and receipts issued.',
      type: 'FEE_REMINDER',
      entityType: 'FEE',
      priority: 'NORMAL',
      monthOffset: -1 as const,
      day: 20,
    },
    {
      title: 'Attendance Review',
      message:
        'Attendance records for this term are being reviewed — please confirm any discrepancies.',
      type: 'ATTENDANCE_ALERT',
      entityType: null,
      priority: 'NORMAL',
      monthOffset: 0 as const,
      day: 8,
    },
    {
      title: 'Timetable Updated',
      message: "This term's timetable has been updated — please check the latest schedule.",
      type: 'TIMETABLE_CHANGE',
      entityType: 'TIMETABLE',
      priority: 'HIGH',
      monthOffset: 0 as const,
      day: 15,
    },
    {
      title: 'Upcoming Exam Scheduled',
      message: "Next term's exam has been scheduled — please review the exam timetable.",
      type: 'EXAM_SCHEDULED',
      entityType: 'EXAM',
      priority: 'HIGH',
      monthOffset: 1 as const,
      day: 10,
    },
  ] as const;

  const notificationsBySchoolId = new Map<string, typeof globalNotifications>();
  await Promise.all(
    schools.map(async (school) => {
      const created = await Promise.all(
        schoolNotificationDefs.map((def) => {
          const style = styleForNotification(def.type, def.entityType);
          return prismaClient.notifications.create({
            data: {
              title: `${def.title} — ${school.schoolName}`,
              message: def.message,
              type: def.type,
              priority: def.priority,
              icon: style.icon,
              bgColor: style.color,
              iconColor: style.color,
              schoolId: school.id,
              entityType: def.entityType,
              createdAt: monthOffsetDate(def.monthOffset, def.day, 8, 0),
            },
          });
        }),
      );
      notificationsBySchoolId.set(school.id, created);
    }),
  );

  let notificationRecipientsCreated = 0;

  async function giveNotifications(
    userId: string,
    pool: typeof globalNotifications,
    seed: number,
  ): Promise<void> {
    if (pool.length === 0) return;
    const secondPickOffset = pool.length > 1 ? 1 : 0;
    const picks = [pool[seed % pool.length], pool[(seed + secondPickOffset) % pool.length]];
    const uniquePicks = Array.from(new Map(picks.map((n) => [n.id, n])).values());
    await Promise.all(
      uniquePicks.map(async (notification, idx) => {
        const isRead = (seed + idx) % 3 !== 0;
        await prismaClient.notificationRecipients.create({
          data: {
            notificationId: notification.id,
            userId,
            isRead,
            readAt: isRead ? new Date(notification.createdAt.getTime() + 3_600_000) : null,
          },
        });
        notificationRecipientsCreated += 1;
      }),
    );
  }

  console.log('🔔  Assigning Notifications to every user …');

  await giveNotifications(superAdmin.id, globalNotifications, 0);
  await giveNotifications(daniraAdmin.id, globalNotifications, 1);

  const groupANotifications =
    notificationsBySchoolId.get(groupASchools[0]?.id ?? '') ?? globalNotifications;
  const groupBNotifications =
    notificationsBySchoolId.get(groupBSchools[0]?.id ?? '') ?? globalNotifications;
  await giveNotifications(guserA.id, groupANotifications, 2);
  await giveNotifications(guserB.id, groupBNotifications, 3);

  await Promise.all(
    schoolAdmins.map((sa, i) =>
      giveNotifications(
        sa.user.id,
        notificationsBySchoolId.get(sa.schoolId) ?? globalNotifications,
        i,
      ),
    ),
  );

  await Promise.all(
    allStaffs.map((staff, i) =>
      giveNotifications(
        staff.userId,
        notificationsBySchoolId.get(staff.schoolId) ?? globalNotifications,
        i,
      ),
    ),
  );

  await Promise.all(
    students.map((student, i) =>
      giveNotifications(
        student.userId,
        (student.schoolId && notificationsBySchoolId.get(student.schoolId)) || globalNotifications,
        i,
      ),
    ),
  );

  const schoolIdByGuardianId = new Map<string, string>();
  students.forEach((student) => {
    if (student.schoolId && !schoolIdByGuardianId.has(student.guardianId)) {
      schoolIdByGuardianId.set(student.guardianId, student.schoolId);
    }
  });
  await Promise.all(
    guardians.map((guardian, i) => {
      const schoolId = schoolIdByGuardianId.get(guardian.id);
      const pool = (schoolId && notificationsBySchoolId.get(schoolId)) || globalNotifications;
      return giveNotifications(guardian.userId, pool, i);
    }),
  );

  const totalNotifications =
    globalNotifications.length + schools.length * schoolNotificationDefs.length;
  const totalNotifiedUsers =
    2 + 2 + schoolAdmins.length + allStaffs.length + students.length + guardians.length;

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
✅  Seeding complete!

  Table               Records
  ─────────────────── ───────
  SchoolGroups            ${schoolGroups.length}
  Schools                 ${schools.length}  (each has a regNumber)
  Departments             ${departments.length}  (4/primary school, 5/secondary+tertiary school; every one has a head AND at least one student)
  Admins                  14
  Staffs                  ${allStaffs.length}  (${teacherStaffs.length} subject teachers (incl. primary) + ${primaryStaffs.length} primary-dept caregivers + ${extraStaffs.length} extra support staff (10/school); each has a staffId, ACTIVE/LEAVE status, and is assigned at least one lesson — most teachers now teach 2 subjects across multiple lessons)
  Classes                 ${classes.length}  (2 per school, every school has its own; population synced to each class's actual Students count)
  Subjects                ${subjects.length}  (${nonPrimarySubjects.length} academic (${subjectTemplates.length}/school, every department has ≥2), ${primarySubjects.length} early-years — every school has its own curriculum + teacher, each Subjects row carries its own schoolId)
  ClassSubjects           ${classSubjects.length}  (one per distinct class↔subject offering, tagged with the teaching staff)
  FeeStructures           ${feeStructures.length}  (${compulsoryFeeTemplates.length} compulsory + ${optionalFeeTemplates.length} optional per school, amount scaled by SchoolType)
  FeeStructureClasses     ${feeStructureClasses.length}  (compulsory fees linked to every class in their school; optional fees pinned to one specific class each — the many-to-many that lets a fee target specific classes rather than a whole ClassType tier)
  BoardingHouses          ${boardingHouses.length}  (Boys + Girls hostel per school)
  BoardingHouseMatrons    ${boardingHouseMatrons.length}  (1 support staff assigned per boarding house)
  GradeYears              ${gradeYears.length}
  Terms                   ${terms.length}  (2 per GradeYear: a completed PREVIOUS term + the ONGOING current term)
  Exams                   ${exams.length}
  Tests                   ${tests.length}
  Assignments             ${assignments.length}
  Lessons                 ${lessons.length}  (${nonPrimaryLessons.length + primaryLessons.length} timetable + ${secondSubjectLessons.length} second-subject + ${supportLessons.length} support-staff lessons — every one of the ${allStaffs.length} staff teaches at least one lesson, most teach several)
  Guardians               ${guardians.length}
  Students                ${students.length}  (${nonPrimaryStudents.length} in subject classes + ${primaryStudents.length} in primary classes + ${extraStudents.length} extra students (10/school); each has a studentId + ACTIVE/SUSPENDED status; non-primary/extra students are cycled across ALL their school's departments so every department has ≥1 student; every ONCAMPUS student is linked to their school's boarding house matching their gender)
  StudentAttendance       ${studentAttendanceRecords.length}  (every student × every lesson for a subject they're actually enrolled in — Students.subjects — spread across last/this/next month; in every school ≥10% of students sit below 60% attendance and ≥5% below 50%)
  StaffAttendance         ${staffAttendanceRecords.length}  (every staff member × ${STAFF_ATTENDANCE_DAYS} school days evenly sampled across last/this/next month)
  LessonAttendance        ${lessonAttendanceRecords.length}  (one per Lesson, clocked by the staff member assigned to teach it, dated with that lesson's attendance date)
  ReportCards             ${reportCards.length}  (2 per student — a COMPLETED report card for last term's exam + an INCOMPLETE report card for this term, in progress toward the upcoming exam)
  FeeInvoices             ${feeInvoicesCreated}  (1 per student PER TERM — a previous-term invoice + a current-term invoice, each with its own rolled-up totalAmount/totalPaid/totalOutstanding and its own array of Fees line items; enforced by @@unique([studentId, termId]))
  Fees                    ${fees.length}  (${compulsoryFeeTemplates.length} compulsory fees per invoice + only the optional fees that genuinely apply per student — Boarding for on-campus students, Transportation for off-campus commuters, Lunch/Extracurricular/Field Trip on a deterministic opt-in mix; every Fees row belongs to exactly one FeeInvoice via invoiceId; every 4th student cleared last term in full, ${studentsCarryingPreviousBalance} students still owe a balance carried over from their previous term's invoice)
  Receipts                ${receiptsCreated}  (one per PAID/PARTIAL fee line item, tagged with student, school, payment method, and the school's own Bursar)
  Timetables              ${timetables.length}  (1 per class, anchored to its school/gradeYear/term)
  TimetablePeriods        ${lessons.length + timetables.length}  (1 per lesson on that class's timetable + 1 Monday assembly per class)
  Events                  10
  Announcements           10
  Notifications           ${totalNotifications}  (${globalNotifications.length} global + ${schoolNotificationDefs.length}/school, spread across last/this/next month; each carries a NotificationIcon + NotificationColor pair (bgColor/iconColor))
  NotificationRecipients  ${notificationRecipientsCreated}  (every one of the ${totalNotifiedUsers} Users rows receives ≥2 notifications)

  Every User row now carries a "ratings" score (3.0–5.0).
  Every student has an upcoming Exam (Students.examId), a previous-term
  COMPLETED report card, a current-term INCOMPLETE report card, and TWO
  FeeInvoice rows — one for their previous term, one for their current term
  — each holding its own array of Fees line items (Tuition, Library,
  Boarding, Field Trip, etc.).
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
