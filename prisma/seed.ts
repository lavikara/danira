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
} from "../src/generated/client.js";
import bcrypt from "bcryptjs";
import { prismaClient } from "../src/services/dbServices/dbClient/prismaClient.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** All seed users share one password for dev convenience. */
const PLAIN_PASSWORD = "Password123!";
const SALT_ROUNDS = 10;

async function hashPwd(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Ensures every generated email is a yopmail.com address. */
function yop(local: string): string {
  return `${local.toLowerCase().replace(/[^a-z0-9._-]/g, ".")}@yopmail.com`;
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
  await prismaClient.admins.deleteMany();
  await prismaClient.schools.deleteMany();
  await prismaClient.schoolGroups.deleteMany();
  await prismaClient.users.deleteMany();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("🧹  Clearing existing data …");
  await clearDatabase();

  console.log("🔐  Hashing password …");
  const password = await hashPwd(PLAIN_PASSWORD);

  // ── 1. GRADE YEARS (10) ──────────────────────────────────────────────────
  // Created first — Terms, Classes, and Students all reference them.
  console.log("📅  Seeding GradeYears …");

  const gradeYearDefs = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ];

  const gradeYears = await Promise.all(
    gradeYearDefs.map((level) =>
      prismaClient.gradeYears.create({
        data: {
          level,
          start: new Date("2025-09-01"),
          end: new Date("2026-07-31"),
        },
      }),
    ),
  );

  // ── 2. TERMS (10) ────────────────────────────────────────────────────────
  console.log("📆  Seeding Terms …");

  const termCycle = [
    TermType.FIRSTTERM,
    TermType.SECONDTERM,
    TermType.THIRDTERM,
  ];
  const termDateRanges = [
    { start: "2025-09-08", end: "2025-12-13" },
    { start: "2026-01-12", end: "2026-04-03" },
    { start: "2026-04-27", end: "2026-07-18" },
  ];

  const terms = await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const typeIndex = i % 3;
      return prismaClient.terms.create({
        data: {
          name: `${termCycle[typeIndex].replace("TERM", " Term")} ${2025 + Math.floor(i / 3)}`,
          type: termCycle[typeIndex],
          status: "STARTED",
          start: new Date(termDateRanges[typeIndex].start),
          end: new Date(termDateRanges[typeIndex].end),
          gradeYearId: gradeYears[i % gradeYears.length].id,
        },
      });
    }),
  );

  // ── 3. SCHOOL GROUPS (2) — each has its own groupId ──────────────────────
  console.log("🏫  Seeding SchoolGroups …");

  const groupA = await prismaClient.schoolGroups.create({
    data: { groupName: "Sunrise Educational Group", status: "APPROVED" },
  });
  const groupB = await prismaClient.schoolGroups.create({
    data: { groupName: "Horizon Learning Network", status: "APPROVED" },
  });

  // ── 4. SCHOOLS (12) ──────────────────────────────────────────────────────
  //   2 under groupA  |  2 under groupB  |  6 standalone (SINGLE, no group)
  console.log("🏛️   Seeding Schools …");

  const schoolDefs = [
    // ── Sunrise Educational Group (groupA) — 2 schools, shared "Sunrise Academy" brand ──
    {
      schoolName: "Sunrise Academy Primary School",
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.GROUP,
      groupId: groupA.id,
    },
    {
      schoolName: "Sunrise Academy Secondary School",
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.GROUP,
      groupId: groupA.id,
    },
    // ── Horizon Learning Network (groupB) — 2 schools, shared "Horizon College" brand ──
    {
      schoolName: "Horizon College Primary School",
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.GROUP,
      groupId: groupB.id,
    },
    {
      schoolName: "Horizon College Secondary School",
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.GROUP,
      groupId: groupB.id,
    },
    // ── Standalone schools — each has a completely distinct, unrelated name ──
    {
      schoolName: "Plateau International Academy",
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: "Riverbank Model College",
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: "Cedar Grove Institute",
      type: SchoolType.TERTIARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: "Pinnacle Comprehensive School",
      type: SchoolType.SECONDARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: "Greenfield Academy",
      type: SchoolType.PRIMARY,
      setup: SchoolSetup.SINGLE,
      groupId: null,
    },
    {
      schoolName: "Northstar Secondary School",
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
          status: "APPROVED",
          isApproved: true,
          schoolName: s.schoolName,
          address: `${s.schoolName} Campus Road, Nigeria`,
          phoneNumber: phone(i + 100),
          createdBy: "system",
          approvedBy: "system",
          email: yop(`school.${s.schoolName}`),
          groupId: s.groupId ?? null,
        },
      }),
    ),
  );

  const groupASchools = schools.filter((s) => s.groupId === groupA.id);
  const groupBSchools = schools.filter((s) => s.groupId === groupB.id);

  // ── 5. ADMINS + USERS ────────────────────────────────────────────────────
  //
  //   • 1  SUPERADMIN         — one danira super admin
  //   • 2  GROUPSCHOOLADMIN  — one per group, each manages all schools in
  //                            that group (m2m `schools` connect + denormalised
  //                            `schoolIds` array for quick lookups)
  //   • 12 SCHOOLADMIN       — one dedicated admin per school
  //
  console.log("👤  Seeding Admins …");

  // 5a. Super admin — Danira Platform
  const superAdmin = await prismaClient.users.create({
    data: {
      username: "super_temikara",
      email: yop("temikara"),
      password,
      status: "ACTIVE",
      firstName: "Temitayo",
      lastName: "Kara",
      isVerified: true,
      phoneNumber: phone(201),
      address: "104, Taiwo Close, Ikorodu, Lagos.",
      gender: Gender.MALE,
      role: Role.SUPERADMIN,
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: superAdmin.id,
      type: null,
      schoolIds: [],
      schools: { connect: [] },
      groupId: null,
    },
  });

  // 5a. Danira admin — Danira Platform
  const daniraAdmin = await prismaClient.users.create({
    data: {
      username: "danira_omolayo",
      email: yop("omolayo"),
      password,
      status: "PENDING",
      firstName: "Omolayo",
      lastName: "Omodele",
      isVerified: false,
      phoneNumber: phone(201),
      address: "44, Igbo Olomu Close, Agric, Ikorodu, Lagos.",
      gender: Gender.MALE,
      role: Role.DANIRAADMIN,
    },
  });
  await prismaClient.admins.create({
    data: {
      userId: daniraAdmin.id,
      type: null,
      schoolIds: [],
      schools: { connect: [] },
      groupId: null,
    },
  });

  // 5a. Group admin — Sunrise Educational Group
  const guserA = await prismaClient.users.create({
    data: {
      username: "ngozi.eze.groupadmin",
      email: yop("ngozi.eze.groupadmin"),
      password,
      status: "PENDING",
      firstName: "Ngozi",
      lastName: "Eze",
      isVerified: false,
      phoneNumber: phone(201),
      address: "12 Sunrise Avenue, Jos, Plateau State",
      gender: Gender.FEMALE,
      role: Role.GROUPSCHOOLADMIN,
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

  // 5b. Group admin — Horizon Learning Network
  const guserB = await prismaClient.users.create({
    data: {
      username: "tunde.bakare.groupadmin",
      email: yop("tunde.bakare.groupadmin"),
      password,
      status: "PENDING",
      firstName: "Tunde",
      lastName: "Bakare",
      isVerified: false,
      phoneNumber: phone(202),
      address: "5 Horizon Close, Abuja, FCT",
      gender: Gender.MALE,
      role: Role.GROUPSCHOOLADMIN,
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

  // 5c. One SCHOOLADMIN per school (10 admins)
  const schoolAdminNames: Array<[string, string, Gender]> = [
    ["Amaka", "Okafor", Gender.FEMALE],
    ["Chidi", "Yusuf", Gender.MALE],
    ["Grace", "Adeyemi", Gender.FEMALE],
    ["Ibrahim", "Mohammed", Gender.MALE],
    ["Joy", "Eze", Gender.FEMALE],
    ["Kunle", "Balogun", Gender.MALE],
    ["Lola", "Danjuma", Gender.FEMALE],
    ["Musa", "Okoro", Gender.MALE],
    ["Ngozi", "Hassan", Gender.FEMALE],
    ["Obinna", "Nwosu", Gender.MALE],
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
          status: "PENDING",
          firstName,
          lastName,
          isVerified: false,
          phoneNumber: phone(300 + i),
          address: `Admin Quarters, ${school.schoolName}`,
          gender,
          role: Role.SCHOOLADMIN,
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

  // ── 6. SUBJECTS (12) ─────────────────────────────────────────────────────
  // Created before Staffs so we can connect staff→subjects in the same pass.
  console.log("📚  Seeding Subjects …");

  const subjectDefs = [
    {
      name: "Mathematics",
      code: "MTH101",
      description: "Number theory, algebra, and geometry.",
    },
    {
      name: "English Language",
      code: "ENG101",
      description: "Grammar, comprehension, and composition.",
    },
    {
      name: "Basic Science",
      code: "BSC101",
      description: "Introductory physical and life sciences.",
    },
    {
      name: "Social Studies",
      code: "SOS101",
      description: "Civics, history, and geography.",
    },
    {
      name: "Physics",
      code: "PHY201",
      description: "Mechanics, waves, and electromagnetism.",
    },
    {
      name: "Chemistry",
      code: "CHM201",
      description: "Organic and inorganic chemistry.",
    },
    {
      name: "Biology",
      code: "BIO201",
      description: "Cell biology, genetics, and ecology.",
    },
    {
      name: "Computer Studies",
      code: "CMP101",
      description: "Programming fundamentals and ICT literacy.",
    },
    {
      name: "Economics",
      code: "ECO201",
      description: "Micro and macroeconomics for secondary school.",
    },
    {
      name: "Civic Education",
      code: "CIV101",
      description: "Citizenship, rights, and responsibilities.",
    },
    {
      name: "Agricultural Sci.",
      code: "AGR101",
      description: "Crop science, livestock, and farm management.",
    },
    {
      name: "Fine Arts",
      code: "ART101",
      description: "Drawing, painting, and art history.",
    },
  ];

  const subjects = await Promise.all(
    subjectDefs.map((s) =>
      prismaClient.subjects.create({
        data: {
          name: s.name,
          code: s.code,
          status: "ACTIVE",
          description: s.description,
        },
      }),
    ),
  );

  // ── 7. STAFFS + USERS (14) ───────────────────────────────────────────────
  //
  //   14 staff members distributed across all 12 schools.
  //   Each staff is connected to one subject so that every subject (12)
  //   gets at least one teacher (staff[i % 12] covers all 12 subjects;
  //   staff[12] and staff[13] simply share subjects[0] and subjects[1]).
  //
  console.log("👩‍🏫  Seeding Staffs …");

  const staffDefs: Array<[string, string, Gender]> = [
    ["Felix", "Audu", Gender.MALE],
    ["Hauwa", "Bello", Gender.FEMALE],
    ["Ifeoma", "Chukwu", Gender.FEMALE],
    ["James", "Danladi", Gender.MALE],
    ["Kemi", "Emeka", Gender.FEMALE],
    ["Lawal", "Falana", Gender.MALE],
    ["Maryam", "Gambo", Gender.FEMALE],
    ["Nnamdi", "Haruna", Gender.MALE],
    ["Olamide", "Ibe", Gender.FEMALE],
    ["Peter", "Jatau", Gender.MALE],
    ["Queen", "Kalu", Gender.FEMALE],
    ["Rasheed", "Lar", Gender.MALE],
    ["Sandra", "Madaki", Gender.FEMALE],
    ["Titus", "Nuhu", Gender.MALE],
  ];

  const positions = [
    "Class Teacher",
    "Subject Teacher",
    "Head of Department",
    "Senior Teacher",
    "Lab Coordinator",
    "Vice Principal",
  ];
  const departments = [
    "Sciences",
    "Humanities",
    "Languages",
    "Arts",
    "Technology",
  ];

  const staffs = await Promise.all(
    staffDefs.map(async ([firstName, lastName, gender], i) => {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.staff`;
      const user = await prismaClient.users.create({
        data: {
          username: `${username}${i + 1}`,
          email: yop(`${username}${i + 1}`),
          password,
          status: "PENDING",
          firstName,
          lastName,
          isVerified: false,
          phoneNumber: phone(400 + i),
          address: `Staff Block ${i + 1}, ${schools[i % schools.length].schoolName}`,
          gender,
          role: Role.SCHOOLSTAFF,
        },
      });
      return prismaClient.staffs.create({
        data: {
          userId: user.id,
          position: positions[i % positions.length],
          depertment: departments[i % departments.length],
          accomodation:
            i % 3 === 0
              ? Accomodation.STAFFQUARTERS
              : i % 3 === 1
                ? Accomodation.ONCAMPUS
                : null,
          employmentStatus:
            i % 3 === 0
              ? StaffStatus.FULLTIME
              : i % 3 === 1
                ? StaffStatus.PERTIME
                : StaffStatus.VISITING,
          schoolId: schools[i % schools.length].id,
          // Every subject gets a teacher: subjects[0..11] covered by staff[0..11];
          // staff[12] and [13] share subjects[0] and [1] as co-teachers.
          subjects: { connect: [{ id: subjects[i % subjects.length].id }] },
        },
      });
    }),
  );

  // ── 8. CLASSES (12) ──────────────────────────────────────────────────────
  //   Every class has a supervisor drawn from the staffs pool.
  console.log("🏫  Seeding Classes …");

  const classDefs = [
    { name: "Primary 1A", type: ClassType.PRIMARY },
    { name: "Primary 2A", type: ClassType.PRIMARY },
    { name: "Primary 3A", type: ClassType.PRIMARY },
    { name: "Primary 4A", type: ClassType.PRIMARY },
    { name: "JSS 1A", type: ClassType.SECONDARY },
    { name: "JSS 2A", type: ClassType.SECONDARY },
    { name: "JSS 3A", type: ClassType.SECONDARY },
    { name: "SSS 1A", type: ClassType.SECONDARY },
    { name: "SSS 2A", type: ClassType.SECONDARY },
    { name: "SSS 3A", type: ClassType.SECONDARY },
    { name: "ND Year 1", type: ClassType.TERTIARY },
    { name: "ND Year 2", type: ClassType.TERTIARY },
  ];

  const classes = await Promise.all(
    classDefs.map((def, i) =>
      prismaClient.classes.create({
        data: {
          name: def.name,
          type: def.type,
          status: "ACTIVE",
          description: `${def.name} — current academic session.`,
          population: 25 + (i % 10),
          supervisorId: staffs[i % staffs.length].id,
          gradeYearId: gradeYears[i % gradeYears.length].id,
        },
      }),
    ),
  );

  // ── 9. EXAMS (10) ────────────────────────────────────────────────────────
  console.log("📝  Seeding Exams …");

  const exams = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.exams.create({
        data: {
          title: `${subjects[i % subjects.length].name} — End of Term Exam`,
          status: "UPCOMING",
          startTime: daysFromNow(30 + i * 2),
          endTime: daysFromNow(30 + i * 2 + 1),
        },
      }),
    ),
  );

  // ── 10. TESTS (10) ───────────────────────────────────────────────────────
  console.log("📋  Seeding Tests …");

  const tests = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.tests.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Mid-Term Test`,
          status: "UPCOMING",
          startTime: daysFromNow(10 + i * 2),
          endTime: daysFromNow(10 + i * 2 + 1),
        },
      }),
    ),
  );

  // ── 11. ASSIGNMENTS (10) ─────────────────────────────────────────────────
  console.log("📄  Seeding Assignments …");

  const assignments = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prismaClient.assignments.create({
        data: {
          title: `${subjects[i % subjects.length].name} — Assignment ${i + 1}`,
          status: "UPCOMING",
          startTime: daysFromNow(i),
          dueDate: daysFromNow(i + 7),
        },
      }),
    ),
  );

  // ── 12. LESSONS (12) ─────────────────────────────────────────────────────
  //   Each lesson needs: subject, class, and a staff member (teacher).
  //   We also link to an assignment to satisfy the optional FK.
  console.log("🗓️   Seeding Lessons …");

  const days = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
  ];

  const lessons = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      prismaClient.lessons.create({
        data: {
          name: `${subjects[i % subjects.length].name} — ${classes[i % classes.length].name} — P${(i % 6) + 1}`,
          description: `${subjects[i % subjects.length].name} period for ${classes[i % classes.length].name}.`,
          day: days[i % days.length],
          status: "UPCOMING",
          startTime: new Date(2026, 0, 5, 8 + (i % 6), 0, 0),
          endTime: new Date(2026, 0, 5, 9 + (i % 6), 0, 0),
          subjectId: subjects[i % subjects.length].id,
          classId: classes[i % classes.length].id,
          staffId: staffs[i % staffs.length].id,
          assignmentId: assignments[i % assignments.length].id,
        },
      }),
    ),
  );

  // ── 13. GUARDIANS + USERS (10) ───────────────────────────────────────────
  console.log("👨‍👩‍👧  Seeding Guardians …");

  const guardianDefs: Array<[string, string, Gender]> = [
    ["Aisha", "Abdullahi", Gender.FEMALE],
    ["Benjamin", "Chukwuma", Gender.MALE],
    ["Comfort", "Danfulani", Gender.FEMALE],
    ["David", "Effiong", Gender.MALE],
    ["Esther", "Folarin", Gender.FEMALE],
    ["Francis", "Gowon", Gender.MALE],
    ["Gloria", "Habila", Gender.FEMALE],
    ["Henry", "Idoko", Gender.MALE],
    ["Iniobong", "Jang", Gender.FEMALE],
    ["John", "Kolo", Gender.MALE],
  ];

  const guardians = await Promise.all(
    guardianDefs.map(async ([firstName, lastName, gender], i) => {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.guardian`;
      const user = await prismaClient.users.create({
        data: {
          username: `${username}${i + 1}`,
          email: yop(`${username}${i + 1}`),
          password,
          status: "PENDING",
          firstName,
          lastName,
          isVerified: false,
          phoneNumber: phone(500 + i),
          address: `${i + 1} Guardian Close, Jos, Plateau State`,
          gender,
          role: Role.GUARDIAN,
        },
      });
      return prismaClient.guardians.create({ data: { userId: user.id } });
    }),
  );

  // ── 14. STUDENTS + USERS (14) ────────────────────────────────────────────
  //
  //   Guardian distribution (demonstrates "a guardian can have multiple
  //   students"):
  //     guardians[0] (Aisha)    → students 0, 1, 2   (3 students)
  //     guardians[1] (Benjamin) → students 3, 4, 5   (3 students)
  //     guardians[2..9]         → students 6..13      (1 each)
  //
  console.log("🎒  Seeding Students …");

  const studentDefs: Array<[string, string, Gender]> = [
    ["Aliyu", "Adamu", Gender.MALE],
    ["Blessing", "Bature", Gender.FEMALE],
    ["Chika", "Chinedu", Gender.MALE],
    ["Daniel", "Dikko", Gender.MALE],
    ["Ene", "Emeka", Gender.FEMALE],
    ["Fatima", "Fwa", Gender.FEMALE],
    ["Goodness", "Gyang", Gender.FEMALE],
    ["Haruna", "Haruna", Gender.MALE],
    ["Ifeanyi", "Isa", Gender.MALE],
    ["Jummai", "Jatau", Gender.FEMALE],
    ["Kabiru", "Kefas", Gender.MALE],
    ["Linda", "Longe", Gender.FEMALE],
    ["Michael", "Mohammed", Gender.MALE],
    ["Nneka", "Nuhu", Gender.FEMALE],
  ];

  // Map each student index to a guardian index
  const guardianMap = [
    0,
    0,
    0, // Aisha's three children
    1,
    1,
    1, // Benjamin's three children
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9, // remaining guardians, one child each
  ];

  const students = await Promise.all(
    studentDefs.map(async ([firstName, lastName, gender], i) => {
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.student`;
      const user = await prismaClient.users.create({
        data: {
          username: `${username}${i + 1}`,
          email: yop(`${username}${i + 1}`),
          password,
          status: "PENDING",
          firstName,
          lastName,
          isVerified: false,
          phoneNumber: phone(600 + i),
          address: `${i + 1} Student Hostel, ${schools[i % schools.length].schoolName}`,
          gender,
          role: Role.STUDENT,
        },
      });
      return prismaClient.students.create({
        data: {
          userId: user.id,
          accomodation:
            i % 3 === 0 ? Accomodation.ONCAMPUS : Accomodation.OFFCAMPUS,
          classId: classes[i % classes.length].id,
          guardianId: guardians[guardianMap[i]].id,
          schoolId: schools[i % schools.length].id,
          gradeYearId: gradeYears[i % gradeYears.length].id,
          examId: exams[i % exams.length].id,
          testId: tests[i % tests.length].id,
          assignmentId: assignments[i % assignments.length].id,
          subjectId: subjects[i % subjects.length].id,
        },
      });
    }),
  );

  // ── 15. ATTENDANCE (14) ──────────────────────────────────────────────────
  //   One record per student, linked to the lesson for that student's class.
  console.log("✅  Seeding Attendance …");

  await Promise.all(
    students.map((student, i) =>
      prismaClient.attendance.create({
        data: {
          date: daysFromNow(-(i + 1)),
          status: "UPCOMING",
          attendance:
            i % 6 === 0 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
          studentId: student.id,
          lessonId: lessons[i % lessons.length].id,
        },
      }),
    ),
  );

  // ── 16. REPORT CARDS (14) ────────────────────────────────────────────────
  //   One card per student; each card is linked to a subject.
  console.log("📊  Seeding ReportCards …");

  await Promise.all(
    students.map((student, i) =>
      prismaClient.reportCards.create({
        data: {
          testScore: 55 + (i % 35),
          assignmentScore: 60 + (i % 30),
          examScore: 50 + (i % 40),
          attendanceScore: 70 + (i % 25),
          status: "INCOMPLETE",
          teacherComment:
            "Shows consistent effort and good classroom participation.",
          generalComment:
            "A pleasure to teach this term — keep up the excellent work.",
          studentId: student.id,
          subjects: { connect: [{ id: subjects[i % subjects.length].id }] },
        },
      }),
    ),
  );

  // ── 17. FEES (14) ────────────────────────────────────────────────────────
  console.log("💰  Seeding Fees …");

  const feeTypes = [
    { name: "Tuition Fee", amount: 45_000 },
    { name: "Library Fee", amount: 3_500 },
    { name: "Sports Fee", amount: 5_000 },
    { name: "Boarding Fee", amount: 60_000 },
    { name: "Exam Fee", amount: 8_000 },
  ];

  await Promise.all(
    students.map((student, i) => {
      const fee = feeTypes[i % feeTypes.length];
      return prismaClient.fees.create({
        data: {
          name: fee.name,
          description: `${fee.name} for the current academic term.`,
          amount: fee.amount + i * 500,
          status: "PAID",
          studentId: student.id,
        },
      });
    }),
  );

  // ── 18. EVENTS (10) ──────────────────────────────────────────────────────
  console.log("🎉  Seeding Events …");

  const eventDefs = [
    { title: "Inter-House Sports Day", duration: "8 hours" },
    { title: "Cultural Day Celebration", duration: "6 hours" },
    { title: "Annual Science Fair", duration: "5 hours" },
    { title: "Career Guidance Talk", duration: "2 hours" },
    { title: "PTA Annual Meeting", duration: "3 hours" },
    { title: "Prize Giving Ceremony", duration: "4 hours" },
    { title: "Mock Exams Briefing", duration: "1 hour" },
    { title: "Graduation Ceremony", duration: "6 hours" },
    { title: "Open Day for Prospective Students", duration: "5 hours" },
    { title: "Health and Wellness Week", duration: "40 hours" },
  ];

  await Promise.all(
    eventDefs.map((ev, i) =>
      prismaClient.events.create({
        data: {
          title: ev.title,
          description: `${ev.title} — hosted by ${classes[i % classes.length].name}.`,
          date: daysFromNow(20 + i * 3),
          status: "UPCOMING",
          duration: ev.duration,
          classId: classes[i % classes.length].id,
        },
      }),
    ),
  );

  // ── 19. ANNOUNCEMENTS (10) ───────────────────────────────────────────────
  console.log("📢  Seeding Announcements …");

  const announcementDefs = [
    "School Resumption Date",
    "Mid-Term Break Notice",
    "Fee Payment Deadline Reminder",
    "Uniform Policy Update",
    "Exam Timetable Released",
    "Library Renovation Closure",
    "New Curriculum Rollout",
    "Parent-Teacher Conference Schedule",
    "Bus Route Schedule Change",
    "Student Leadership Elections",
  ];

  await Promise.all(
    announcementDefs.map((title, i) =>
      prismaClient.announcements.create({
        data: {
          title,
          description: `${title} — please note and act accordingly.`,
          status: "PENDING",
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
  SchoolGroups             2
  Schools                 ${schools.length}
  Admins                  ${schools.length + 2}  (10 school + 2 group)
  Staffs                  ${staffs.length}
  Classes                 ${classes.length}
  Subjects                ${subjects.length}
  GradeYears              ${gradeYears.length}
  Terms                   ${terms.length}
  Exams                   ${exams.length}
  Tests                   ${tests.length}
  Assignments             ${assignments.length}
  Lessons                 ${lessons.length}
  Guardians               ${guardians.length}  (2 with 3 students each)
  Students                ${students.length}
  Attendance              ${students.length}
  ReportCards             ${students.length}
  Fees                    ${students.length}
  Events                  10
  Announcements           10
  `);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("❌  Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
