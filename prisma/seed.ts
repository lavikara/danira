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
function personFor(i: number): [string, string, Gender] {
  const firstName = FIRST_NAME_POOL[i % FIRST_NAME_POOL.length];
  const lastName = LAST_NAME_POOL[(i * 13 + 5) % LAST_NAME_POOL.length];
  const gender = i % 2 === 0 ? Gender.MALE : Gender.FEMALE;
  return [firstName, lastName, gender];
}

// ─── Clear database (FK-safe order: children first) ─────────────────────────

async function clearDatabase(): Promise<void> {
  await prismaClient.attendance.deleteMany();
  await prismaClient.reportCards.deleteMany();
  await prismaClient.fees.deleteMany();
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
      name: 'English Language',
      code: 'ENG101',
      description: 'Grammar, comprehension, and composition.',
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
                name: `${shortName} ${tpl.name}`,
                code: `${tpl.code}-${shortName.slice(0, 3).toUpperCase()}`,
                status: 'ACTIVE',
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
                name: `${shortName} ${tpl.name}`,
                code: `${tpl.code}-${shortName.slice(0, 3).toUpperCase()}`,
                status: 'ACTIVE',
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

  // 8a. One teacher per subject (covers non-primary AND primary subjects).
  const teacherStaffs = await Promise.all(
    subjects.map(async (subject, i) => {
      const department = departments.find((d) => d.id === subject.departmentId)!;
      const [firstName, lastName, gender] = personFor(i);
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.teacher${i + 1}`;
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
          phoneNumber: phone(400 + i),
          address: `Staff Block ${i + 1}, ${subject.name} Faculty`,
          gender,
          role: Role.SCHOOLSTAFF,
          ratings: rating(400 + i),
        },
      });
      return prismaClient.staffs.create({
        data: {
          userId: user.id,
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
          subjects: { connect: [{ id: subject.id }] },
        },
      });
    }),
  );

  // 8b. One supplementary, non-subject caregiver per primary-school department.
  const primaryDepartments = departments.filter((d) =>
    (PRIMARY_DEPARTMENT_NAMES as readonly string[]).includes(d.name),
  );
  const primaryStaffs = await Promise.all(
    primaryDepartments.map(async (department, i) => {
      const [firstName, lastName, gender] = personFor(200 + i);
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.primarystaff${i + 1}`;
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
        const schoolTeachers = teacherStaffs.slice(si * 12, si * 12 + 12);
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
        const schoolSubjects = nonPrimarySubjects.slice(si * 12, si * 12 + 12);
        const schoolTeachers = teacherStaffs.slice(si * 12, si * 12 + 12);
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

  const lessons = [...nonPrimaryLessons, ...primaryLessons];

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
        const schoolSubjects = nonPrimarySubjects.slice(si * 12, si * 12 + 12);

        return Promise.all(
          Array.from({ length: STUDENTS_PER_NON_PRIMARY_CLASS }, async (_, j) => {
            const globalIndex = classIdx * STUDENTS_PER_NON_PRIMARY_CLASS + j;
            const [firstName, lastName, gender] = personFor(900 + globalIndex);
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.student${globalIndex + 1}`;
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
      const [firstName, lastName, gender] = personFor(globalIndex);
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.pupil${classIdx + 1}`;
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

  const students = [...nonPrimaryStudents, ...primaryStudents];

  // ── 17. ATTENDANCE ───────────────────────────────────────────────────────
  //   Every student — primary and non-primary alike — gets an Attendance
  //   record for EVERY lesson taught in their own class (their full
  //   timetable), so every student is properly assigned to every lesson in
  //   their class: 12 lessons each for non-primary students, 8 each for
  //   primary students.
  console.log('✅  Seeding Attendance …');

  await Promise.all(
    students.flatMap((student) => {
      const classLessons = lessons.filter((l) => l.classId === student.classId);
      return classLessons.map((lesson, li) =>
        prismaClient.attendance.create({
          data: {
            date: daysFromNow(-(li + 1)),
            status: 'UPCOMING',
            attendance: li % 6 === 0 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
            studentId: student.id,
            lessonId: lesson.id,
          },
        }),
      );
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

  // ── 19. FEES (32) ──────────────────────────────────────────────────────────
  console.log('💰  Seeding Fees …');

  const feeTypes = [
    { name: 'Tuition Fee', amount: 45_000 },
    { name: 'Library Fee', amount: 3_500 },
    { name: 'Sports Fee', amount: 5_000 },
    { name: 'Boarding Fee', amount: 60_000 },
    { name: 'Exam Fee', amount: 8_000 },
  ];

  await Promise.all(
    students.map((student, i) => {
      const fee = feeTypes[i % feeTypes.length];
      return prismaClient.fees.create({
        data: {
          name: fee.name,
          description: `${fee.name} for the current academic term.`,
          amount: fee.amount + i * 500,
          status: 'PAID',
          studentId: student.id,
        },
      });
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
  Schools                 ${schools.length}
  Departments             ${departments.length}  (4/primary school, 5/secondary+tertiary school; every one has a head)
  Admins                  14
  Staffs                  ${staffs.length}  (${teacherStaffs.length} subject teachers (incl. primary) + ${primaryStaffs.length} primary-dept caregivers)
  Classes                 ${classes.length}  (2 per school, every school has its own)
  Subjects                ${subjects.length}  (${nonPrimarySubjects.length} academic, ${primarySubjects.length} early-years — every school has its own curriculum + teacher)
  GradeYears              ${gradeYears.length}
  Terms                   ${terms.length}
  Exams                   ${exams.length}
  Tests                   ${tests.length}
  Assignments             ${assignments.length}
  Lessons                 ${lessons.length}  (every subject has a lesson, every teacher is assigned one)
  Guardians               ${guardians.length}
  Students                ${students.length}  (${nonPrimaryStudents.length} in subject classes + ${primaryStudents.length} in primary classes)
  Attendance              ${lessons.reduce((n, l) => n + students.filter((s) => s.classId === l.classId).length, 0)}  (every student × every lesson in their own class)
  ReportCards             ${students.length}
  Fees                    ${students.length}
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
