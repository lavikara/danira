import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  Gender,
  SchoolType,
  StaffStatus,
  AttendanceStatus,
  ClassType,
  Day,
  Accomodation,
  TermType,
} from "./generated/client";
import bcrypt from "bcryptjs";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  /* ------------------------------------------------------------------ */
  /*  Shared hashed password (all seeded users → Password@123)           */
  /* ------------------------------------------------------------------ */
  const password = await bcrypt.hash("Password@123", 10);

  /* ================================================================== */
  /*  1. SCHOOLS                                                          */
  /* ================================================================== */
  console.log("📚 Seeding schools...");

  const schoolData = [
    {
      type: SchoolType.SECONDARY,
      name: "Greenfield Academy",
      address: "14 Greenfield Road, Victoria Island, Lagos",
      phoneNumber: "+234-801-234-5678",
      email: "info@greenfieldacademy.edu.ng",
    },
    {
      type: SchoolType.PRIMARY,
      name: "Sunrise Primary School",
      address: "22 Sunrise Avenue, Ikeja, Lagos",
      phoneNumber: "+234-802-345-6789",
      email: "admin@sunriseprimary.edu.ng",
    },
    {
      type: SchoolType.SECONDARY,
      name: "Harmony High School",
      address: "5 Unity Street, Abuja, FCT",
      phoneNumber: "+234-803-456-7890",
      email: "contact@harmonyhigh.edu.ng",
    },
    {
      type: SchoolType.TERTIARY,
      name: "Excellence College",
      address: "100 Excellence Boulevard, Port Harcourt, Rivers",
      phoneNumber: "+234-804-567-8901",
      email: "info@excellencecollege.edu.ng",
    },
    {
      type: SchoolType.PRIMARY,
      name: "Little Stars Academy",
      address: "8 Little Stars Close, Enugu",
      phoneNumber: "+234-805-678-9012",
      email: "hello@littlestars.edu.ng",
    },
    {
      type: SchoolType.SECONDARY,
      name: "Beacon Secondary School",
      address: "30 Beacon Hill, Kano",
      phoneNumber: "+234-806-789-0123",
      email: "admin@beaconschool.edu.ng",
    },
    {
      type: SchoolType.SECONDARY,
      name: "Pinnacle College",
      address: "17 Pinnacle Drive, Ibadan, Oyo",
      phoneNumber: "+234-807-890-1234",
      email: "info@pinnaclecollege.edu.ng",
    },
    {
      type: SchoolType.PRIMARY,
      name: "Bright Futures Academy",
      address: "3 Bright Way, Kaduna",
      phoneNumber: "+234-808-901-2345",
      email: "contact@brightfutures.edu.ng",
    },
    {
      type: SchoolType.TERTIARY,
      name: "Knowledge City College",
      address: "55 Knowledge Street, Benin City, Edo",
      phoneNumber: "+234-809-012-3456",
      email: "admin@knowledgecity.edu.ng",
    },
    {
      type: SchoolType.SECONDARY,
      name: "Royal Crown School",
      address: "12 Royal Crescent, Asaba, Delta",
      phoneNumber: "+234-810-123-4567",
      email: "info@royalcrown.edu.ng",
    },
  ];

  const schools = await Promise.all(
    schoolData.map((data) => prisma.school.create({ data })),
  );

  console.log(`   ✓ Created ${schools.length} schools`);

  /* ================================================================== */
  /*  2. GRADE YEARS                                                      */
  /* ================================================================== */
  console.log("📅 Seeding grade years...");

  const gradeYearData = [
    {
      level: "JSS 1",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "JSS 2",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "JSS 3",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "SS 1",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "SS 2",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "SS 3",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-31"),
    },
    {
      level: "Primary 1",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-15"),
    },
    {
      level: "Primary 2",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-15"),
    },
    {
      level: "Primary 3",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-15"),
    },
    {
      level: "Primary 4",
      start: new Date("2024-09-01"),
      end: new Date("2025-07-15"),
    },
  ];

  const gradeYears = await Promise.all(
    gradeYearData.map((data) => prisma.gradeYear.create({ data })),
  );

  console.log(`   ✓ Created ${gradeYears.length} grade years`);

  /* ================================================================== */
  /*  3. TERMS                                                            */
  /* ================================================================== */
  console.log("🗓️  Seeding terms...");

  const termData = [
    {
      name: "First Term 2024/25 — JSS 1",
      start: new Date("2024-09-09"),
      end: new Date("2024-12-13"),
      type: TermType.FIRSTTERM,
      gradeYearId: gradeYears[0].id,
    },
    {
      name: "Second Term 2024/25 — JSS 1",
      start: new Date("2025-01-13"),
      end: new Date("2025-04-11"),
      type: TermType.SECONDTERM,
      gradeYearId: gradeYears[0].id,
    },
    {
      name: "Third Term 2024/25 — JSS 1",
      start: new Date("2025-04-28"),
      end: new Date("2025-07-25"),
      type: TermType.THIRDTERM,
      gradeYearId: gradeYears[0].id,
    },
    {
      name: "First Term 2024/25 — JSS 2",
      start: new Date("2024-09-09"),
      end: new Date("2024-12-13"),
      type: TermType.FIRSTTERM,
      gradeYearId: gradeYears[1].id,
    },
    {
      name: "Second Term 2024/25 — JSS 2",
      start: new Date("2025-01-13"),
      end: new Date("2025-04-11"),
      type: TermType.SECONDTERM,
      gradeYearId: gradeYears[1].id,
    },
    {
      name: "First Term 2024/25 — SS 1",
      start: new Date("2024-09-09"),
      end: new Date("2024-12-13"),
      type: TermType.FIRSTTERM,
      gradeYearId: gradeYears[3].id,
    },
    {
      name: "Second Term 2024/25 — SS 1",
      start: new Date("2025-01-13"),
      end: new Date("2025-04-11"),
      type: TermType.SECONDTERM,
      gradeYearId: gradeYears[3].id,
    },
    {
      name: "First Term 2024/25 — SS 3",
      start: new Date("2024-09-09"),
      end: new Date("2024-12-13"),
      type: TermType.FIRSTTERM,
      gradeYearId: gradeYears[5].id,
    },
    {
      name: "Second Term 2024/25 — SS 3",
      start: new Date("2025-01-13"),
      end: new Date("2025-04-11"),
      type: TermType.SECONDTERM,
      gradeYearId: gradeYears[5].id,
    },
    {
      name: "Third Term 2024/25 — SS 3",
      start: new Date("2025-04-28"),
      end: new Date("2025-07-25"),
      type: TermType.THIRDTERM,
      gradeYearId: gradeYears[5].id,
    },
  ];

  const terms = await Promise.all(
    termData.map((data) => prisma.term.create({ data })),
  );

  console.log(`   ✓ Created ${terms.length} terms`);

  /* ================================================================== */
  /*  4. GUARDIANS                                                        */
  /* ================================================================== */
  console.log("👨‍👩‍👧 Seeding guardians...");

  const guardianData = [
    {
      username: "james.okafor",
      email: "james.okafor@gmail.com",
      firstName: "James",
      lastName: "Okafor",
      phoneNumber: "+234-803-111-2233",
      address: "14 Palm Avenue, Lekki, Lagos",
      gender: Gender.MALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "ngozi.eze",
      email: "ngozi.eze@yahoo.com",
      firstName: "Ngozi",
      lastName: "Eze",
      phoneNumber: "+234-805-222-3344",
      address: "7 Hibiscus Street, Surulere, Lagos",
      gender: Gender.FEMALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "akin.bello",
      email: "akin.bello@gmail.com",
      firstName: "Akin",
      lastName: "Bello",
      phoneNumber: "+234-806-333-4455",
      address: "33 Stadium Road, Rumuola, PH",
      gender: Gender.MALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "hadiza.yusuf",
      email: "hadiza.yusuf@gmail.com",
      firstName: "Hadiza",
      lastName: "Yusuf",
      phoneNumber: "+234-807-444-5566",
      address: "19 Katsina Road, Abuja",
      gender: Gender.FEMALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "kunle.okonkwo",
      email: "kunle.okonkwo@gmail.com",
      firstName: "Kunle",
      lastName: "Okonkwo",
      phoneNumber: "+234-808-555-6677",
      address: "5 Awka Road, Onitsha, Anambra",
      gender: Gender.MALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "folake.adeyemi",
      email: "folake.adeyemi@gmail.com",
      firstName: "Folake",
      lastName: "Adeyemi",
      phoneNumber: "+234-809-666-7788",
      address: "11 Oduduwa Avenue, Ile-Ife, Osun",
      gender: Gender.FEMALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "emeka.nnaji",
      email: "emeka.nnaji@hotmail.com",
      firstName: "Emeka",
      lastName: "Nnaji",
      phoneNumber: "+234-810-777-8899",
      address: "28 Trans-Amadi, Port Harcourt",
      gender: Gender.MALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "blessing.dike",
      email: "blessing.dike@gmail.com",
      firstName: "Blessing",
      lastName: "Dike",
      phoneNumber: "+234-811-888-9900",
      address: "62 Aba Road, Umuahia, Abia",
      gender: Gender.FEMALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "tunde.fashola",
      email: "tunde.fashola@gmail.com",
      firstName: "Tunde",
      lastName: "Fashola",
      phoneNumber: "+234-812-999-0011",
      address: "45 Agodi GRA, Ibadan, Oyo",
      gender: Gender.MALE,
      password,
      role: Role.GUARDIAN,
    },
    {
      username: "amina.ibrahim",
      email: "amina.ibrahim@yahoo.com",
      firstName: "Amina",
      lastName: "Ibrahim",
      phoneNumber: "+234-813-000-1122",
      address: "3 Maitama District, Abuja",
      gender: Gender.FEMALE,
      password,
      role: Role.GUARDIAN,
    },
  ];

  const guardians = await Promise.all(
    guardianData.map((data) => prisma.guardian.create({ data })),
  );

  console.log(`   ✓ Created ${guardians.length} guardians`);

  /* ================================================================== */
  /*  5. STAFF                                                            */
  /* ================================================================== */
  console.log("👩‍🏫 Seeding staff...");

  const staffData = [
    {
      username: "dr.emmanuel.obi",
      email: "e.obi@greenfieldacademy.edu.ng",
      password,
      firstName: "Emmanuel",
      lastName: "Obi",
      phoneNumber: "+234-801-100-0001",
      position: "Senior Mathematics Teacher",
      depertment: "Mathematics",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.MALE,
      address: "21 Lekki Phase 1, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mrs.kemi.adeleke",
      email: "k.adeleke@greenfieldacademy.edu.ng",
      password,
      firstName: "Kemi",
      lastName: "Adeleke",
      phoneNumber: "+234-801-100-0002",
      position: "English Language Teacher",
      depertment: "Languages",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.FEMALE,
      address: "7 Victoria Island, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mr.femi.ojo",
      email: "f.ojo@greenfieldacademy.edu.ng",
      password,
      firstName: "Femi",
      lastName: "Ojo",
      phoneNumber: "+234-801-100-0003",
      position: "Physics Teacher",
      depertment: "Sciences",
      accomodation: Accomodation.STAFFQUARTERS,
      status: StaffStatus.FULLTIME,
      gender: Gender.MALE,
      address: "Campus Quarters, Block A, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "miss.grace.okoro",
      email: "g.okoro@greenfieldacademy.edu.ng",
      password,
      firstName: "Grace",
      lastName: "Okoro",
      phoneNumber: "+234-801-100-0004",
      position: "Biology Teacher",
      depertment: "Sciences",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.FEMALE,
      address: "13 Surulere, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mr.segun.alabi",
      email: "s.alabi@greenfieldacademy.edu.ng",
      password,
      firstName: "Segun",
      lastName: "Alabi",
      phoneNumber: "+234-801-100-0005",
      position: "Chemistry Teacher",
      depertment: "Sciences",
      accomodation: Accomodation.STAFFQUARTERS,
      status: StaffStatus.PERTIME,
      gender: Gender.MALE,
      address: "Campus Quarters, Block B, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mrs.aisha.mohammed",
      email: "a.mohammed@greenfieldacademy.edu.ng",
      password,
      firstName: "Aisha",
      lastName: "Mohammed",
      phoneNumber: "+234-801-100-0006",
      position: "Economics Teacher",
      depertment: "Social Sciences",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.FEMALE,
      address: "8 Magboro Estate, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mr.kunle.balogun",
      email: "k.balogun@greenfieldacademy.edu.ng",
      password,
      firstName: "Kunle",
      lastName: "Balogun",
      phoneNumber: "+234-801-100-0007",
      position: "Government Teacher",
      depertment: "Social Sciences",
      accomodation: Accomodation.STAFFQUARTERS,
      status: StaffStatus.FULLTIME,
      gender: Gender.MALE,
      address: "10 Yaba, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mrs.yetunde.hassan",
      email: "y.hassan@greenfieldacademy.edu.ng",
      password,
      firstName: "Yetunde",
      lastName: "Hassan",
      phoneNumber: "+234-801-100-0008",
      position: "Geography Teacher",
      depertment: "Social Sciences",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.VISITING,
      gender: Gender.FEMALE,
      address: "4 Isale Eko, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "mr.chidi.nwachukwu",
      email: "c.nwachukwu@greenfieldacademy.edu.ng",
      password,
      firstName: "Chidi",
      lastName: "Nwachukwu",
      phoneNumber: "+234-801-100-0009",
      position: "Further Mathematics Teacher",
      depertment: "Mathematics",
      accomodation: Accomodation.ONCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.MALE,
      address: "Campus Quarters, Block C, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
    {
      username: "miss.fatima.garba",
      email: "f.garba@greenfieldacademy.edu.ng",
      password,
      firstName: "Fatima",
      lastName: "Garba",
      phoneNumber: "+234-801-100-0010",
      position: "Literature Teacher",
      depertment: "Languages",
      accomodation: Accomodation.OFFCAMPUS,
      status: StaffStatus.FULLTIME,
      gender: Gender.FEMALE,
      address: "2 Ikorodu Road, Lagos",
      role: Role.TEACHER,
      schoolId: schools[0].id,
    },
  ];

  const staffs = await Promise.all(
    staffData.map((data) => prisma.staff.create({ data })),
  );

  console.log(`   ✓ Created ${staffs.length} staff members`);

  /* ================================================================== */
  /*  6. CLASSES                                                          */
  /* ================================================================== */
  console.log("🏫 Seeding classes...");

  const classData = [
    {
      name: "SS 3A",
      type: ClassType.SECONDARY,
      description: "Senior Secondary Three A — Sciences stream",
      population: 42,
      supervisorId: staffs[0].id,
      gradeYearId: gradeYears[5].id,
    },
    {
      name: "SS 3B",
      type: ClassType.SECONDARY,
      description: "Senior Secondary Three B — Arts stream",
      population: 40,
      supervisorId: staffs[1].id,
      gradeYearId: gradeYears[5].id,
    },
    {
      name: "SS 2A",
      type: ClassType.SECONDARY,
      description: "Senior Secondary Two A — Sciences stream",
      population: 44,
      supervisorId: staffs[2].id,
      gradeYearId: gradeYears[4].id,
    },
    {
      name: "SS 2B",
      type: ClassType.SECONDARY,
      description: "Senior Secondary Two B — Arts stream",
      population: 43,
      supervisorId: staffs[3].id,
      gradeYearId: gradeYears[4].id,
    },
    {
      name: "SS 1A",
      type: ClassType.SECONDARY,
      description: "Senior Secondary One A",
      population: 45,
      supervisorId: staffs[4].id,
      gradeYearId: gradeYears[3].id,
    },
    {
      name: "SS 1B",
      type: ClassType.SECONDARY,
      description: "Senior Secondary One B",
      population: 44,
      supervisorId: staffs[5].id,
      gradeYearId: gradeYears[3].id,
    },
    {
      name: "JSS 3A",
      type: ClassType.SECONDARY,
      description: "Junior Secondary Three A",
      population: 41,
      supervisorId: staffs[6].id,
      gradeYearId: gradeYears[2].id,
    },
    {
      name: "JSS 2A",
      type: ClassType.SECONDARY,
      description: "Junior Secondary Two A",
      population: 39,
      supervisorId: staffs[7].id,
      gradeYearId: gradeYears[1].id,
    },
    {
      name: "JSS 2B",
      type: ClassType.SECONDARY,
      description: "Junior Secondary Two B",
      population: 38,
      supervisorId: staffs[8].id,
      gradeYearId: gradeYears[1].id,
    },
    {
      name: "JSS 1A",
      type: ClassType.SECONDARY,
      description: "Junior Secondary One A",
      population: 40,
      supervisorId: staffs[9].id,
      gradeYearId: gradeYears[0].id,
    },
  ];

  const classes = await Promise.all(
    classData.map((data) => prisma.class.create({ data })),
  );

  console.log(`   ✓ Created ${classes.length} classes`);

  /* ================================================================== */
  /*  7. SUBJECTS                                                         */
  /* ================================================================== */
  console.log("📖 Seeding subjects...");

  const subjectData = [
    {
      name: "Mathematics",
      description: "Pure and applied mathematics",
      code: "MTH101",
    },
    {
      name: "English Language",
      description: "English grammar, composition and literature",
      code: "ENG101",
    },
    {
      name: "Physics",
      description: "Classical and modern physics",
      code: "PHY101",
    },
    {
      name: "Chemistry",
      description: "Organic and inorganic chemistry",
      code: "CHM101",
    },
    {
      name: "Biology",
      description: "Life sciences and living organisms",
      code: "BIO101",
    },
    {
      name: "Economics",
      description: "Micro and macroeconomics",
      code: "ECO101",
    },
    {
      name: "Government",
      description: "Nigerian government and civics",
      code: "GOV101",
    },
    {
      name: "Geography",
      description: "Physical and human geography",
      code: "GEO101",
    },
    {
      name: "Further Mathematics",
      description: "Advanced mathematics and statistics",
      code: "FMT101",
    },
    {
      name: "Literature in English",
      description: "African and world literature",
      code: "LIT101",
    },
  ];

  const subjects = await Promise.all(
    subjectData.map((data) => prisma.subject.create({ data })),
  );

  console.log(`   ✓ Created ${subjects.length} subjects`);

  /* Connect staff ↔ subjects (many-to-many) */
  await Promise.all([
    prisma.staff.update({
      where: { id: staffs[0].id },
      data: {
        subjects: { connect: [{ id: subjects[0].id }, { id: subjects[8].id }] },
      },
    }), // Dr. Obi → Maths + Further Maths
    prisma.staff.update({
      where: { id: staffs[1].id },
      data: {
        subjects: { connect: [{ id: subjects[1].id }, { id: subjects[9].id }] },
      },
    }), // Mrs. Adeleke → English + Lit
    prisma.staff.update({
      where: { id: staffs[2].id },
      data: { subjects: { connect: [{ id: subjects[2].id }] } },
    }), // Mr. Ojo → Physics
    prisma.staff.update({
      where: { id: staffs[3].id },
      data: { subjects: { connect: [{ id: subjects[4].id }] } },
    }), // Miss. Okoro → Biology
    prisma.staff.update({
      where: { id: staffs[4].id },
      data: { subjects: { connect: [{ id: subjects[3].id }] } },
    }), // Mr. Alabi → Chemistry
    prisma.staff.update({
      where: { id: staffs[5].id },
      data: { subjects: { connect: [{ id: subjects[5].id }] } },
    }), // Mrs. Mohammed → Economics
    prisma.staff.update({
      where: { id: staffs[6].id },
      data: { subjects: { connect: [{ id: subjects[6].id }] } },
    }), // Mr. Balogun → Government
    prisma.staff.update({
      where: { id: staffs[7].id },
      data: { subjects: { connect: [{ id: subjects[7].id }] } },
    }), // Mrs. Hassan → Geography
    prisma.staff.update({
      where: { id: staffs[8].id },
      data: { subjects: { connect: [{ id: subjects[8].id }] } },
    }), // Mr. Nwachukwu → Further Maths
    prisma.staff.update({
      where: { id: staffs[9].id },
      data: { subjects: { connect: [{ id: subjects[9].id }] } },
    }), // Miss. Garba → Literature
  ]);

  /* ================================================================== */
  /*  8. EXAMS                                                            */
  /* ================================================================== */
  console.log("📝 Seeding exams...");

  const examData = [
    {
      title: "First Term Mathematics Exam 2024",
      startTime: new Date("2024-12-02T09:00:00"),
      endTime: new Date("2024-12-02T11:30:00"),
    },
    {
      title: "First Term English Exam 2024",
      startTime: new Date("2024-12-03T09:00:00"),
      endTime: new Date("2024-12-03T11:00:00"),
    },
    {
      title: "First Term Physics Exam 2024",
      startTime: new Date("2024-12-04T09:00:00"),
      endTime: new Date("2024-12-04T11:30:00"),
    },
    {
      title: "First Term Chemistry Exam 2024",
      startTime: new Date("2024-12-05T09:00:00"),
      endTime: new Date("2024-12-05T11:00:00"),
    },
    {
      title: "First Term Biology Exam 2024",
      startTime: new Date("2024-12-06T09:00:00"),
      endTime: new Date("2024-12-06T11:00:00"),
    },
    {
      title: "Second Term Mathematics Exam 2025",
      startTime: new Date("2025-04-01T09:00:00"),
      endTime: new Date("2025-04-01T11:30:00"),
    },
    {
      title: "Second Term English Exam 2025",
      startTime: new Date("2025-04-02T09:00:00"),
      endTime: new Date("2025-04-02T11:00:00"),
    },
    {
      title: "Second Term Physics Exam 2025",
      startTime: new Date("2025-04-03T09:00:00"),
      endTime: new Date("2025-04-03T11:30:00"),
    },
    {
      title: "Mock WAEC Mathematics 2025",
      startTime: new Date("2025-05-05T08:00:00"),
      endTime: new Date("2025-05-05T11:00:00"),
    },
    {
      title: "Mock WAEC English Language 2025",
      startTime: new Date("2025-05-06T08:00:00"),
      endTime: new Date("2025-05-06T11:00:00"),
    },
  ];

  const exams = await Promise.all(
    examData.map((data) => prisma.exam.create({ data })),
  );

  /* Connect subjects to exams */
  await Promise.all([
    prisma.subject.update({
      where: { id: subjects[0].id },
      data: { exam: { connect: { id: exams[0].id } } },
    }),
    prisma.subject.update({
      where: { id: subjects[1].id },
      data: { exam: { connect: { id: exams[1].id } } },
    }),
    prisma.subject.update({
      where: { id: subjects[2].id },
      data: { exam: { connect: { id: exams[2].id } } },
    }),
    prisma.subject.update({
      where: { id: subjects[3].id },
      data: { exam: { connect: { id: exams[3].id } } },
    }),
    prisma.subject.update({
      where: { id: subjects[4].id },
      data: { exam: { connect: { id: exams[4].id } } },
    }),
  ]);

  console.log(`   ✓ Created ${exams.length} exams`);

  /* ================================================================== */
  /*  9. STUDENTS                                                         */
  /* ================================================================== */
  console.log("🎒 Seeding students...");

  const studentData = [
    {
      username: "amara.okafor",
      email: "amara.okafor@students.greenfield.edu.ng",
      firstName: "Amara",
      lastName: "Okafor",
      password,
      address: "14 Palm Avenue, Lekki, Lagos",
      phoneNumber: "+234-803-111-0001",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      classId: classes[0].id,
      guardianId: guardians[0].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[5].id,
      examId: exams[0].id,
    },
    {
      username: "chidi.eze",
      email: "chidi.eze@students.greenfield.edu.ng",
      firstName: "Chidi",
      lastName: "Eze",
      password,
      address: "7 Hibiscus Street, Surulere, Lagos",
      phoneNumber: "+234-805-222-0002",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.MALE,
      role: Role.STUDENT,
      classId: classes[1].id,
      guardianId: guardians[1].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[5].id,
      examId: exams[1].id,
    },
    {
      username: "fatima.bello",
      email: "fatima.bello@students.greenfield.edu.ng",
      firstName: "Fatima",
      lastName: "Bello",
      password,
      address: "33 Stadium Road, PH",
      phoneNumber: "+234-806-333-0003",
      accomodation: Accomodation.ONCAMPUS,
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      classId: classes[2].id,
      guardianId: guardians[2].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[4].id,
      examId: exams[2].id,
    },
    {
      username: "emeka.nwosu",
      email: "emeka.nwosu@students.greenfield.edu.ng",
      firstName: "Emeka",
      lastName: "Nwosu",
      password,
      address: "19 Katsina Road, Abuja",
      phoneNumber: null,
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.MALE,
      role: Role.STUDENT,
      classId: classes[2].id,
      guardianId: guardians[3].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[4].id,
      examId: exams[3].id,
    },
    {
      username: "zainab.yusuf",
      email: "zainab.yusuf@students.greenfield.edu.ng",
      firstName: "Zainab",
      lastName: "Yusuf",
      password,
      address: "5 Awka Road, Onitsha",
      phoneNumber: "+234-808-555-0005",
      accomodation: Accomodation.ONCAMPUS,
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      classId: classes[4].id,
      guardianId: guardians[3].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[3].id,
      examId: exams[4].id,
    },
    {
      username: "oluwaseun.adeyemi",
      email: "oluwaseun.adeyemi@students.greenfield.edu.ng",
      firstName: "Oluwaseun",
      lastName: "Adeyemi",
      password,
      address: "11 Oduduwa Avenue, Ile-Ife",
      phoneNumber: "+234-809-666-0006",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.MALE,
      role: Role.STUDENT,
      classId: classes[3].id,
      guardianId: guardians[4].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[4].id,
      examId: exams[5].id,
    },
    {
      username: "ngozi.okeke",
      email: "ngozi.okeke@students.greenfield.edu.ng",
      firstName: "Ngozi",
      lastName: "Okeke",
      password,
      address: "28 Trans-Amadi, Port Harcourt",
      phoneNumber: "+234-810-777-0007",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      classId: classes[7].id,
      guardianId: guardians[5].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[1].id,
      examId: exams[6].id,
    },
    {
      username: "ibrahim.aliyu",
      email: "ibrahim.aliyu@students.greenfield.edu.ng",
      firstName: "Ibrahim",
      lastName: "Aliyu",
      password,
      address: "62 Aba Road, Umuahia",
      phoneNumber: null,
      accomodation: Accomodation.ONCAMPUS,
      gender: Gender.MALE,
      role: Role.STUDENT,
      classId: classes[0].id,
      guardianId: guardians[6].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[5].id,
      examId: exams[7].id,
    },
    {
      username: "adaeze.okonkwo",
      email: "adaeze.okonkwo@students.greenfield.edu.ng",
      firstName: "Adaeze",
      lastName: "Okonkwo",
      password,
      address: "45 Agodi GRA, Ibadan",
      phoneNumber: "+234-812-999-0009",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      classId: classes[9].id,
      guardianId: guardians[4].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[0].id,
      examId: exams[8].id,
    },
    {
      username: "tunde.fasanya",
      email: "tunde.fasanya@students.greenfield.edu.ng",
      firstName: "Tunde",
      lastName: "Fasanya",
      password,
      address: "3 Maitama District, Abuja",
      phoneNumber: "+234-813-000-0010",
      accomodation: Accomodation.OFFCAMPUS,
      gender: Gender.MALE,
      role: Role.STUDENT,
      classId: classes[4].id,
      guardianId: guardians[9].id,
      schoolId: schools[0].id,
      gradeYearId: gradeYears[3].id,
      examId: exams[9].id,
    },
  ];

  const students = await Promise.all(
    studentData.map((data) => prisma.student.create({ data })),
  );

  console.log(`   ✓ Created ${students.length} students`);

  /* ================================================================== */
  /*  10. ADMINS                                                          */
  /* ================================================================== */
  console.log("🔐 Seeding admins...");

  const adminData = [
    {
      username: "superadmin",
      email: "superadmin@danira.ng",
      firstName: "Super",
      lastName: "Admin",
      password,
      role: Role.SUPERADMIN,
      gender: Gender.MALE,
      schoolId: null,
    },
    {
      username: "danira.admin",
      email: "admin@danira.ng",
      firstName: "Danira",
      lastName: "Admin",
      password,
      role: Role.DANIRAADMIN,
      gender: Gender.FEMALE,
      schoolId: null,
    },
    {
      username: "priya.adeyemi",
      email: "priya.adeyemi@greenfieldacademy.edu.ng",
      firstName: "Priya",
      lastName: "Adeyemi",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.FEMALE,
      schoolId: schools[0].id,
    },
    {
      username: "bode.johnson",
      email: "bode.johnson@greenfieldacademy.edu.ng",
      firstName: "Bode",
      lastName: "Johnson",
      password,
      role: Role.SUBSCHOOLADMIN,
      gender: Gender.MALE,
      schoolId: schools[0].id,
    },
    {
      username: "sunrise.admin",
      email: "admin@sunriseprimary.edu.ng",
      firstName: "Sunrise",
      lastName: "Admin",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.FEMALE,
      schoolId: schools[1].id,
    },
    {
      username: "harmony.admin",
      email: "admin@harmonyhigh.edu.ng",
      firstName: "Harmony",
      lastName: "Admin",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.MALE,
      schoolId: schools[2].id,
    },
    {
      username: "excellence.admin",
      email: "admin@excellencecollege.edu.ng",
      firstName: "Excellence",
      lastName: "Admin",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.FEMALE,
      schoolId: schools[3].id,
    },
    {
      username: "beacon.admin",
      email: "admin@beaconschool.edu.ng",
      firstName: "Beacon",
      lastName: "Admin",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.MALE,
      schoolId: schools[5].id,
    },
    {
      username: "pinnacle.admin",
      email: "admin@pinnaclecollege.edu.ng",
      firstName: "Pinnacle",
      lastName: "Admin",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.FEMALE,
      schoolId: schools[6].id,
    },
    {
      username: "royalcrown.admin",
      email: "admin@royalcrown.edu.ng",
      firstName: "Royal",
      lastName: "Crown",
      password,
      role: Role.SCHOOLADMIN,
      gender: Gender.MALE,
      schoolId: schools[9].id,
    },
  ];

  const admins = await Promise.all(
    adminData.map((data) => prisma.admin.create({ data })),
  );

  console.log(`   ✓ Created ${admins.length} admins`);

  /* ================================================================== */
  /*  11. ASSIGNMENTS                                                     */
  /* ================================================================== */
  console.log("📋 Seeding assignments...");

  const assignmentData = [
    {
      title: "Mathematics — Quadratic Equations Worksheet",
      startTime: new Date("2025-01-20T08:00:00"),
      dueDate: new Date("2025-01-27T23:59:00"),
    },
    {
      title: "English — Comprehension Passage & Essay",
      startTime: new Date("2025-01-21T08:00:00"),
      dueDate: new Date("2025-01-28T23:59:00"),
    },
    {
      title: "Physics — Laws of Motion Problem Set",
      startTime: new Date("2025-01-22T08:00:00"),
      dueDate: new Date("2025-01-29T23:59:00"),
    },
    {
      title: "Chemistry — Periodic Table Quiz & Report",
      startTime: new Date("2025-01-23T08:00:00"),
      dueDate: new Date("2025-01-30T23:59:00"),
    },
    {
      title: "Biology — Cell Structure Diagram and Notes",
      startTime: new Date("2025-01-27T08:00:00"),
      dueDate: new Date("2025-02-03T23:59:00"),
    },
    {
      title: "Economics — Demand and Supply Essay",
      startTime: new Date("2025-02-03T08:00:00"),
      dueDate: new Date("2025-02-10T23:59:00"),
    },
    {
      title: "Government — Nigerian Constitution Research Paper",
      startTime: new Date("2025-02-10T08:00:00"),
      dueDate: new Date("2025-02-17T23:59:00"),
    },
    {
      title: "Geography — Map Reading and Analysis",
      startTime: new Date("2025-02-17T08:00:00"),
      dueDate: new Date("2025-02-24T23:59:00"),
    },
    {
      title: "Further Mathematics — Calculus Practice Set",
      startTime: new Date("2025-02-24T08:00:00"),
      dueDate: new Date("2025-03-03T23:59:00"),
    },
    {
      title: "Literature — Prose Analysis — Things Fall Apart",
      startTime: new Date("2025-03-03T08:00:00"),
      dueDate: new Date("2025-03-10T23:59:00"),
    },
  ];

  const assignments = await Promise.all(
    assignmentData.map((data) => prisma.assignment.create({ data })),
  );

  console.log(`   ✓ Created ${assignments.length} assignments`);

  /* ================================================================== */
  /*  12. LESSONS                                                         */
  /* ================================================================== */
  console.log("🕐 Seeding lessons...");

  const lessonData = [
    {
      name: "Mathematics SS3A — Monday Morning",
      description: "Algebra and Quadratic Equations",
      day: Day.MONDAY,
      startTime: new Date("2025-01-20T07:30:00"),
      endTime: new Date("2025-01-20T08:20:00"),
      subjectId: subjects[0].id,
      classId: classes[0].id,
      staffId: staffs[0].id,
      assignmentId: assignments[0].id,
    },
    {
      name: "English SS3A — Monday",
      description: "Comprehension and Essay Writing",
      day: Day.MONDAY,
      startTime: new Date("2025-01-20T08:20:00"),
      endTime: new Date("2025-01-20T09:10:00"),
      subjectId: subjects[1].id,
      classId: classes[0].id,
      staffId: staffs[1].id,
      assignmentId: assignments[1].id,
    },
    {
      name: "Physics SS3A — Tuesday Morning",
      description: "Newton's Laws of Motion",
      day: Day.TUESDAY,
      startTime: new Date("2025-01-21T07:30:00"),
      endTime: new Date("2025-01-21T08:20:00"),
      subjectId: subjects[2].id,
      classId: classes[0].id,
      staffId: staffs[2].id,
      assignmentId: assignments[2].id,
    },
    {
      name: "Chemistry SS3A — Tuesday",
      description: "Organic Chemistry: Hydrocarbons",
      day: Day.TUESDAY,
      startTime: new Date("2025-01-21T09:30:00"),
      endTime: new Date("2025-01-21T10:20:00"),
      subjectId: subjects[3].id,
      classId: classes[0].id,
      staffId: staffs[4].id,
      assignmentId: assignments[3].id,
    },
    {
      name: "Biology SS2A — Wednesday",
      description: "Cell Structure and Function",
      day: Day.WEDNESDAY,
      startTime: new Date("2025-01-22T07:30:00"),
      endTime: new Date("2025-01-22T08:20:00"),
      subjectId: subjects[4].id,
      classId: classes[2].id,
      staffId: staffs[3].id,
      assignmentId: assignments[4].id,
    },
    {
      name: "Economics SS2B — Wednesday",
      description: "Law of Demand and Supply",
      day: Day.WEDNESDAY,
      startTime: new Date("2025-01-22T09:30:00"),
      endTime: new Date("2025-01-22T10:20:00"),
      subjectId: subjects[5].id,
      classId: classes[3].id,
      staffId: staffs[5].id,
      assignmentId: assignments[5].id,
    },
    {
      name: "Government SS1A — Thursday",
      description: "Nigerian Federal System",
      day: Day.THURSDAY,
      startTime: new Date("2025-01-23T07:30:00"),
      endTime: new Date("2025-01-23T08:20:00"),
      subjectId: subjects[6].id,
      classId: classes[4].id,
      staffId: staffs[6].id,
      assignmentId: assignments[6].id,
    },
    {
      name: "Geography JSS2A — Thursday",
      description: "Map Reading and Physical Features",
      day: Day.THURSDAY,
      startTime: new Date("2025-01-23T09:30:00"),
      endTime: new Date("2025-01-23T10:20:00"),
      subjectId: subjects[7].id,
      classId: classes[7].id,
      staffId: staffs[7].id,
      assignmentId: assignments[7].id,
    },
    {
      name: "Further Mathematics SS3B — Friday",
      description: "Differentiation and Integration",
      day: Day.FRIDAY,
      startTime: new Date("2025-01-24T07:30:00"),
      endTime: new Date("2025-01-24T08:20:00"),
      subjectId: subjects[8].id,
      classId: classes[1].id,
      staffId: staffs[8].id,
      assignmentId: assignments[8].id,
    },
    {
      name: "Literature SS3B — Friday",
      description: "Analysis of Things Fall Apart Ch 1-5",
      day: Day.FRIDAY,
      startTime: new Date("2025-01-24T09:30:00"),
      endTime: new Date("2025-01-24T10:20:00"),
      subjectId: subjects[9].id,
      classId: classes[1].id,
      staffId: staffs[9].id,
      assignmentId: assignments[9].id,
    },
  ];

  const lessons = await Promise.all(
    lessonData.map((data) => prisma.lesson.create({ data })),
  );

  console.log(`   ✓ Created ${lessons.length} lessons`);

  /* ================================================================== */
  /*  13. ATTENDANCES                                                     */
  /* ================================================================== */
  console.log("✅ Seeding attendances...");

  const attendanceData = [
    {
      date: new Date("2025-01-20"),
      status: AttendanceStatus.PRESENT,
      studentId: students[0].id,
      lessonId: lessons[0].id,
    },
    {
      date: new Date("2025-01-20"),
      status: AttendanceStatus.PRESENT,
      studentId: students[1].id,
      lessonId: lessons[1].id,
    },
    {
      date: new Date("2025-01-21"),
      status: AttendanceStatus.ABSENT,
      studentId: students[2].id,
      lessonId: lessons[2].id,
    },
    {
      date: new Date("2025-01-21"),
      status: AttendanceStatus.PRESENT,
      studentId: students[3].id,
      lessonId: lessons[3].id,
    },
    {
      date: new Date("2025-01-22"),
      status: AttendanceStatus.PRESENT,
      studentId: students[4].id,
      lessonId: lessons[4].id,
    },
    {
      date: new Date("2025-01-22"),
      status: AttendanceStatus.PRESENT,
      studentId: students[5].id,
      lessonId: lessons[5].id,
    },
    {
      date: new Date("2025-01-23"),
      status: AttendanceStatus.ABSENT,
      studentId: students[6].id,
      lessonId: lessons[6].id,
    },
    {
      date: new Date("2025-01-23"),
      status: AttendanceStatus.PRESENT,
      studentId: students[7].id,
      lessonId: lessons[7].id,
    },
    {
      date: new Date("2025-01-24"),
      status: AttendanceStatus.PRESENT,
      studentId: students[8].id,
      lessonId: lessons[8].id,
    },
    {
      date: new Date("2025-01-24"),
      status: AttendanceStatus.PRESENT,
      studentId: students[9].id,
      lessonId: lessons[9].id,
    },
    // Additional records for more realistic data
    {
      date: new Date("2025-01-27"),
      status: AttendanceStatus.PRESENT,
      studentId: students[0].id,
      lessonId: lessons[0].id,
    },
    {
      date: new Date("2025-01-27"),
      status: AttendanceStatus.ABSENT,
      studentId: students[1].id,
      lessonId: lessons[1].id,
    },
    {
      date: new Date("2025-01-28"),
      status: AttendanceStatus.PRESENT,
      studentId: students[2].id,
      lessonId: lessons[2].id,
    },
  ];

  const attendances = await Promise.all(
    attendanceData.map((data) => prisma.attendance.create({ data })),
  );

  console.log(`   ✓ Created ${attendances.length} attendance records`);

  /* ================================================================== */
  /*  14. RESULTS                                                         */
  /* ================================================================== */
  console.log("📊 Seeding results...");

  const resultData = [
    {
      score: 82,
      assignmentId: assignments[0].id,
      examId: exams[0].id,
      studentId: students[0].id,
    },
    {
      score: 71,
      assignmentId: assignments[1].id,
      examId: exams[1].id,
      studentId: students[1].id,
    },
    {
      score: 91,
      assignmentId: assignments[2].id,
      examId: exams[2].id,
      studentId: students[2].id,
    },
    {
      score: 55,
      assignmentId: assignments[3].id,
      examId: exams[3].id,
      studentId: students[3].id,
    },
    {
      score: 94,
      assignmentId: assignments[4].id,
      examId: exams[4].id,
      studentId: students[4].id,
    },
    {
      score: 67,
      assignmentId: assignments[5].id,
      examId: exams[5].id,
      studentId: students[5].id,
    },
    {
      score: 78,
      assignmentId: assignments[6].id,
      examId: exams[6].id,
      studentId: students[6].id,
    },
    {
      score: 48,
      assignmentId: assignments[7].id,
      examId: exams[7].id,
      studentId: students[7].id,
    },
    {
      score: 88,
      assignmentId: assignments[8].id,
      examId: exams[8].id,
      studentId: students[8].id,
    },
    {
      score: 72,
      assignmentId: assignments[9].id,
      examId: exams[9].id,
      studentId: students[9].id,
    },
    // Extra results for assignments only (no exam)
    {
      score: 85,
      assignmentId: assignments[0].id,
      examId: null,
      studentId: students[1].id,
    },
    {
      score: 63,
      assignmentId: assignments[1].id,
      examId: null,
      studentId: students[2].id,
    },
  ];

  const results = await Promise.all(
    resultData.map((data) => prisma.result.create({ data })),
  );

  console.log(`   ✓ Created ${results.length} results`);

  /* ================================================================== */
  /*  15. FEES                                                            */
  /* ================================================================== */
  console.log("💰 Seeding fees...");

  const feesData = [
    {
      name: "Second Term School Fees 2025",
      description: "Full tuition for second term",
      receipt: "usyfguiabsrhbi",
      amount: 120000,
      studentId: students[0].id,
    },
    {
      name: "Second Term School Fees 2025",
      description: "Full tuition for second term",
      receipt: "usyfguiabsrhbi",
      amount: 120000,
      studentId: students[1].id,
    },
    {
      name: "Second Term School Fees 2025",
      description: "Full tuition for second term",
      receipt: "usyfguiabsrhbi",
      amount: 105000,
      studentId: students[2].id,
    },
    {
      name: "Second Term School Fees 2025",
      description: "Full tuition for second term",
      receipt: "usyfguiabsrhbi",
      amount: 95000,
      studentId: students[3].id,
    },
    {
      name: "Second Term School Fees 2025",
      description: "Full tuition for second term",
      receipt: "usyfguiabsrhbi",
      amount: 105000,
      studentId: students[4].id,
    },
    {
      name: "Development Levy 2024/25",
      description: "Annual infrastructure development levy",
      receipt: "usyfguiabsrhbi",
      amount: 25000,
      studentId: students[0].id,
    },
    {
      name: "Development Levy 2024/25",
      description: "Annual infrastructure development levy",
      receipt: "usyfguiabsrhbi",
      amount: 25000,
      studentId: students[1].id,
    },
    {
      name: "ICT / Computer Lab Fee",
      description: "Access to computer labs and ICT resources",
      receipt: "usyfguiabsrhbi",
      amount: 15000,
      studentId: students[2].id,
    },
    {
      name: "Library Subscription Fee",
      description: "Annual library access and textbook loan",
      receipt: "usyfguiabsrhbi",
      amount: 8000,
      studentId: students[3].id,
    },
    {
      name: "Sports & Extra-Curricular Fee",
      description: "Inter-house sports, clubs and activities",
      receipt: "usyfguiabsrhbi",
      amount: 12000,
      studentId: students[4].id,
    },
    {
      name: "Hostel Fee — Second Term",
      description: "Boarding accommodation fee for second term",
      receipt: "usyfguiabsrhbi",
      amount: 85000,
      studentId: students[5].id,
    },
    {
      name: "WAEC / NECO Registration",
      description: "Exam registration for external certification exams",
      receipt: "usyfguiabsrhbi",
      amount: 20000,
      studentId: students[6].id,
    },
  ];

  const fees = await Promise.all(
    feesData.map((data) => prisma.fees.create({ data })),
  );

  console.log(`   ✓ Created ${fees.length} fee records`);

  /* ================================================================== */
  /*  16. EVENTS                                                          */
  /* ================================================================== */
  console.log("🎉 Seeding events...");

  const eventData = [
    {
      title: "Inter-House Sports Day",
      description: "Annual inter-house athletics and field games",
      date: new Date("2025-05-26T08:00:00"),
      duration: "8 hours",
      classId: classes[0].id,
    },
    {
      title: "Mid-Term Break Begins",
      description: "Students break for mid-term rest",
      date: new Date("2025-02-17T12:00:00"),
      duration: "1 week",
      classId: null,
    },
    {
      title: "Science Fair Exhibition",
      description: "Students showcase science projects to panel of judges",
      date: new Date("2025-03-15T09:00:00"),
      duration: "4 hours",
      classId: classes[0].id,
    },
    {
      title: "Prize-Giving Day Ceremony",
      description: "Annual prize-giving and end-of-term celebration",
      date: new Date("2025-07-15T10:00:00"),
      duration: "3 hours",
      classId: null,
    },
    {
      title: "Literary & Cultural Week",
      description: "Drama, poetry, debate and cultural displays",
      date: new Date("2025-03-24T08:00:00"),
      duration: "5 days",
      classId: classes[1].id,
    },
    {
      title: "Career Day",
      description: "Professionals from various fields speak to senior students",
      date: new Date("2025-04-10T09:00:00"),
      duration: "4 hours",
      classId: classes[4].id,
    },
    {
      title: "Mathematics Olympiad",
      description: "Inter-class mathematics competition",
      date: new Date("2025-02-28T09:00:00"),
      duration: "3 hours",
      classId: classes[0].id,
    },
    {
      title: "Parent-Teacher Association (PTA) Meeting",
      description: "Quarterly meeting with parents and guardians",
      date: new Date("2025-03-01T10:00:00"),
      duration: "3 hours",
      classId: null,
    },
    {
      title: "SS3 Valedictory Service",
      description: "Farewell ceremony for graduating SS3 students",
      date: new Date("2025-07-20T09:00:00"),
      duration: "2 hours",
      classId: classes[0].id,
    },
    {
      title: "Debate Championship — JSS",
      description: "Junior students debate on national and global topics",
      date: new Date("2025-04-05T10:00:00"),
      duration: "3 hours",
      classId: classes[7].id,
    },
  ];

  const events = await Promise.all(
    eventData.map((data) => prisma.event.create({ data })),
  );

  console.log(`   ✓ Created ${events.length} events`);

  /* ================================================================== */
  /*  17. ANNOUNCEMENTS                                                   */
  /* ================================================================== */
  console.log("📢 Seeding announcements...");

  const announcementData = [
    {
      title: "Second Term Exam Schedule Released",
      description:
        "Please note the detailed timetable for all second term examinations. All students must be seated 15 minutes before the exam starts.",
      date: new Date("2025-03-14T08:00:00"),
      classId: null,
    },
    {
      title: "Fee Payment Deadline Reminder",
      description:
        "All outstanding fees for the second term must be paid by February 28, 2025. Contact the bursary for assistance.",
      date: new Date("2025-02-14T08:00:00"),
      classId: null,
    },
    {
      title: "Sports Day Preparation Notice",
      description:
        "Students are reminded that inter-house sports practice begins every Friday after school. Participation is compulsory.",
      date: new Date("2025-05-01T08:00:00"),
      classId: classes[0].id,
    },
    {
      title: "Library Hours Extended",
      description:
        "The school library will now be open from 7:00 AM to 6:00 PM on weekdays to support examination preparation.",
      date: new Date("2025-03-01T08:00:00"),
      classId: null,
    },
    {
      title: "SS3 Mock Examination Alert",
      description:
        "All SS3 students must prepare for the upcoming Mock WAEC examinations scheduled for May 5–20, 2025.",
      date: new Date("2025-04-20T08:00:00"),
      classId: classes[0].id,
    },
    {
      title: "School Uniform Policy Reminder",
      description:
        "Students are required to wear the complete school uniform at all times. Violations will attract disciplinary action.",
      date: new Date("2025-01-13T08:00:00"),
      classId: null,
    },
    {
      title: "Science Fair Registration Open",
      description:
        "Students interested in participating in the Science Fair must register with their subject teacher by March 1, 2025.",
      date: new Date("2025-02-20T08:00:00"),
      classId: classes[2].id,
    },
    {
      title: "New Portal Login Credentials",
      description:
        "All students have been assigned new credentials for the student portal. Please change your password upon first login.",
      date: new Date("2025-01-10T08:00:00"),
      classId: null,
    },
    {
      title: "Debate Club — New Members Welcome",
      description:
        "The debate club is accepting new members. Interested JSS students should see Mr. Balogun after school on Wednesdays.",
      date: new Date("2025-02-03T08:00:00"),
      classId: classes[7].id,
    },
    {
      title: "Mid-Term Break Notice",
      description:
        "School will be closed from February 17–21, 2025 for mid-term break. Students resume February 24, 2025.",
      date: new Date("2025-02-10T08:00:00"),
      classId: null,
    },
  ];

  const announcements = await Promise.all(
    announcementData.map((data) => prisma.announcement.create({ data })),
  );

  console.log(`   ✓ Created ${announcements.length} announcements`);

  /* ================================================================== */
  /*  SUMMARY                                                             */
  /* ================================================================== */
  console.log("\n✅ Seed completed successfully!\n");
  console.log("📊 Seeded records summary:");
  console.log(`   Schools       : ${schools.length}`);
  console.log(`   Grade Years   : ${gradeYears.length}`);
  console.log(`   Terms         : ${terms.length}`);
  console.log(`   Guardians     : ${guardians.length}`);
  console.log(`   Staff         : ${staffs.length}`);
  console.log(`   Classes       : ${classes.length}`);
  console.log(`   Subjects      : ${subjects.length}`);
  console.log(`   Exams         : ${exams.length}`);
  console.log(`   Students      : ${students.length}`);
  console.log(`   Admins        : ${admins.length}`);
  console.log(`   Assignments   : ${assignments.length}`);
  console.log(`   Lessons       : ${lessons.length}`);
  console.log(`   Attendances   : ${attendances.length}`);
  console.log(`   Results       : ${results.length}`);
  console.log(`   Fees          : ${fees.length}`);
  console.log(`   Events        : ${events.length}`);
  console.log(`   Announcements : ${announcements.length}`);
  console.log(`\n   Default password for all users: Password@123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
