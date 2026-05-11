import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Gender,
  SchoolType,
  StaffStatus,
  AttendanceStatus,
  ClassType,
  Day,
  Role,
  Accomodation,
  TermType,
} from "../src/generated/client.js";
import bcrypt from "bcryptjs";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  const password = await bcrypt.hash("Password123!", 10);

  // ============================================================
  // GRADE YEARS (10 records — no dependencies)
  // ============================================================
  console.log("  → Seeding GradeYears...");

  const [gy1, gy2, gy3, gy4, gy5, gy6, gy7, gy8, gy9, gy10] = await Promise.all(
    [
      prisma.gradeYear.create({
        data: {
          level: "Grade 1",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "Grade 2",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "Grade 3",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "Grade 4",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "Grade 5",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "Grade 6",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "JSS 1",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "JSS 2",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "SSS 1",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
      prisma.gradeYear.create({
        data: {
          level: "SSS 2",
          start: new Date("2024-01-08"),
          end: new Date("2024-12-13"),
        },
      }),
    ],
  );

  // ============================================================
  // SCHOOLS (10 records — no dependencies)
  // 4 PRIMARY · 4 SECONDARY · 2 TERTIARY
  // ============================================================
  console.log("  → Seeding Schools...");

  const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10] = await Promise.all([
    prisma.school.create({
      data: {
        type: SchoolType.PRIMARY,
        name: "Greenfield Primary School",
        address: "12 Greenfield Avenue, Lagos Island, Lagos",
        phoneNumber: "+2348011110001",
        email: "greenfield.primary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.PRIMARY,
        name: "Sunflower Primary School",
        address: "45 Sunflower Road, Garki, Abuja",
        phoneNumber: "+2348011110002",
        email: "sunflower.primary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.PRIMARY,
        name: "Maple Leaf Primary School",
        address: "7 Maple Close, GRA, Port Harcourt",
        phoneNumber: "+2348011110003",
        email: "mapleleaf.primary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.PRIMARY,
        name: "Riverside Primary School",
        address: "22 River Bank Road, Ibadan, Oyo",
        phoneNumber: "+2348011110004",
        email: "riverside.primary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.SECONDARY,
        name: "Oakwood Secondary School",
        address: "33 Oak Street, Victoria Island, Lagos",
        phoneNumber: "+2348011110005",
        email: "oakwood.secondary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.SECONDARY,
        name: "Hillside Secondary School",
        address: "88 Hill Avenue, Maitama, Abuja",
        phoneNumber: "+2348011110006",
        email: "hillside.secondary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.SECONDARY,
        name: "Lakewood Secondary School",
        address: "55 Lake Drive, Nasarawa GRA, Kano",
        phoneNumber: "+2348011110007",
        email: "lakewood.secondary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.SECONDARY,
        name: "Pinecrest Secondary School",
        address: "17 Pine Road, Independence Layout, Enugu",
        phoneNumber: "+2348011110008",
        email: "pinecrest.secondary@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.TERTIARY,
        name: "Capital University",
        address: "1 University Road, Jabi, Abuja",
        phoneNumber: "+2348011110009",
        email: "capital.university@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        type: SchoolType.TERTIARY,
        name: "Westbrook University",
        address: "99 Westbrook Campus Drive, Lekki, Lagos",
        phoneNumber: "+2348011110010",
        email: "westbrook.university@yopmail.com",
      },
    }),
  ]);

  // ============================================================
  // ADMINS (10 records — one per school, each is SCHOOLADMIN)
  // ============================================================
  console.log("  → Seeding Admins...");

  await Promise.all([
    prisma.admin.create({
      data: {
        username: "admin_greenfield",
        email: "admin.greenfield@yopmail.com",
        firstName: "Chidi",
        lastName: "Okonkwo",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
        schoolId: s1.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_sunflower",
        email: "admin.sunflower@yopmail.com",
        firstName: "Amaka",
        lastName: "Nwosu",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
        schoolId: s2.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_mapleleaf",
        email: "admin.mapleleaf@yopmail.com",
        firstName: "Emeka",
        lastName: "Eze",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
        schoolId: s3.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_riverside",
        email: "admin.riverside@yopmail.com",
        firstName: "Ngozi",
        lastName: "Adeyemi",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
        schoolId: s4.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_oakwood",
        email: "admin.oakwood@yopmail.com",
        firstName: "Tunde",
        lastName: "Afolabi",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
        schoolId: s5.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_hillside",
        email: "admin.hillside@yopmail.com",
        firstName: "Bisi",
        lastName: "Lawal",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
        schoolId: s6.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_lakewood",
        email: "admin.lakewood@yopmail.com",
        firstName: "Musa",
        lastName: "Aliyu",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
        schoolId: s7.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_pinecrest",
        email: "admin.pinecrest@yopmail.com",
        firstName: "Chisom",
        lastName: "Okeke",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
        schoolId: s8.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_capital",
        email: "admin.capital@yopmail.com",
        firstName: "Remi",
        lastName: "Oladele",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
        schoolId: s9.id,
      },
    }),
    prisma.admin.create({
      data: {
        username: "admin_westbrook",
        email: "admin.westbrook@yopmail.com",
        firstName: "Funmi",
        lastName: "Adebayo",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
        schoolId: s10.id,
      },
    }),
  ]);

  // ============================================================
  // STAFF (15 records)
  // s1 → st1, st2  |  s2 → st3, st4  |  s3 → st5, st6
  // s4 → st7, st8  |  s5 → st9, st10 |  s6 → st11
  // s7 → st12      |  s8 → st13      |  s9 → st14  |  s10 → st15
  // Each staff member will supervise exactly one class below.
  // ============================================================
  console.log("  → Seeding Staff...");

  const staffRecords = await Promise.all([
    // ── School 1 (Greenfield PRIMARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_ada_okafor",
        email: "ada.okafor@yopmail.com",
        firstName: "Ada",
        lastName: "Okafor",
        password,
        phoneNumber: "+2348021110001",
        position: "Class Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "10 Ada Street, Lagos",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s1.id,
      },
    }),
    prisma.staff.create({
      data: {
        username: "teacher_john_smith",
        email: "john.smith@yopmail.com",
        firstName: "John",
        lastName: "Smith",
        password,
        phoneNumber: "+2348021110002",
        position: "Mathematics Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "20 John Avenue, Lagos",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s1.id,
      },
    }),
    // ── School 2 (Sunflower PRIMARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_grace_mensah",
        email: "grace.mensah@yopmail.com",
        firstName: "Grace",
        lastName: "Mensah",
        password,
        phoneNumber: "+2348021110003",
        position: "Class Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "30 Grace Road, Abuja",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s2.id,
      },
    }),
    prisma.staff.create({
      data: {
        username: "teacher_felix_obi",
        email: "felix.obi@yopmail.com",
        firstName: "Felix",
        lastName: "Obi",
        password,
        phoneNumber: "+2348021110004",
        position: "Social Studies Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "40 Felix Close, Abuja",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s2.id,
      },
    }),
    // ── School 3 (Maple Leaf PRIMARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_nkem_johnson",
        email: "nkem.johnson@yopmail.com",
        firstName: "Nkem",
        lastName: "Johnson",
        password,
        phoneNumber: "+2348021110005",
        position: "English Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "50 Nkem Way, Port Harcourt",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s3.id,
      },
    }),
    prisma.staff.create({
      data: {
        username: "teacher_david_ibrahim",
        email: "david.ibrahim@yopmail.com",
        firstName: "David",
        lastName: "Ibrahim",
        password,
        phoneNumber: "+2348021110006",
        position: "Science Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "60 David Street, Port Harcourt",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s3.id,
      },
    }),
    // ── School 4 (Riverside PRIMARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_sola_williams",
        email: "sola.williams@yopmail.com",
        firstName: "Sola",
        lastName: "Williams",
        password,
        phoneNumber: "+2348021110007",
        position: "Class Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "70 Sola Road, Ibadan",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s4.id,
      },
    }),
    prisma.staff.create({
      data: {
        username: "teacher_emeka_james",
        email: "emeka.james@yopmail.com",
        firstName: "Emeka",
        lastName: "James",
        password,
        phoneNumber: "+2348021110008",
        position: "Civic Education Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "80 Emeka Avenue, Ibadan",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s4.id,
      },
    }),
    // ── School 5 (Oakwood SECONDARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_kemi_brown",
        email: "kemi.brown@yopmail.com",
        firstName: "Kemi",
        lastName: "Brown",
        password,
        phoneNumber: "+2348021110009",
        position: "Geography Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "90 Kemi Boulevard, Lagos",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s5.id,
      },
    }),
    prisma.staff.create({
      data: {
        username: "teacher_peter_eze",
        email: "peter.eze@yopmail.com",
        firstName: "Peter",
        lastName: "Eze",
        password,
        phoneNumber: "+2348021110010",
        position: "Physics Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "100 Peter Lane, Lagos",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s5.id,
      },
    }),
    // ── School 6 (Hillside SECONDARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_rose_adeyemi",
        email: "rose.adeyemi@yopmail.com",
        firstName: "Rose",
        lastName: "Adeyemi",
        password,
        phoneNumber: "+2348021110011",
        position: "Chemistry Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "110 Rose Court, Abuja",
        role: Role.TEACHER,
        accomodation: Accomodation.ONCAMPUS,
        schoolId: s6.id,
      },
    }),
    // ── School 7 (Lakewood SECONDARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_yusuf_musa",
        email: "yusuf.musa@yopmail.com",
        firstName: "Yusuf",
        lastName: "Musa",
        password,
        phoneNumber: "+2348021110012",
        position: "Biology Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "120 Yusuf Street, Kano",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s7.id,
      },
    }),
    // ── School 8 (Pinecrest SECONDARY) ──
    prisma.staff.create({
      data: {
        username: "teacher_chioma_okeke",
        email: "chioma.okeke@yopmail.com",
        firstName: "Chioma",
        lastName: "Okeke",
        password,
        phoneNumber: "+2348021110013",
        position: "History & Literature Teacher",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "130 Chioma Road, Enugu",
        role: Role.TEACHER,
        accomodation: Accomodation.OFFCAMPUS,
        schoolId: s8.id,
      },
    }),
    // ── School 9 (Capital University TERTIARY) ──
    prisma.staff.create({
      data: {
        username: "prof_adaora_nwosu",
        email: "adaora.nwosu.prof@yopmail.com",
        firstName: "Adaora",
        lastName: "Nwosu",
        password,
        phoneNumber: "+2348021110014",
        position: "Professor of Economics",
        status: StaffStatus.FULLTIME,
        gender: Gender.FEMALE,
        address: "140 Professor Avenue, Abuja",
        role: Role.TEACHER,
        accomodation: Accomodation.STAFFQUARTERS,
        schoolId: s9.id,
      },
    }),
    // ── School 10 (Westbrook University TERTIARY) ──
    prisma.staff.create({
      data: {
        username: "dr_samuel_osei",
        email: "samuel.osei.dr@yopmail.com",
        firstName: "Samuel",
        lastName: "Osei",
        password,
        phoneNumber: "+2348021110015",
        position: "Senior Lecturer",
        status: StaffStatus.FULLTIME,
        gender: Gender.MALE,
        address: "150 Lecture Hall Road, Lagos",
        role: Role.TEACHER,
        accomodation: Accomodation.STAFFQUARTERS,
        schoolId: s10.id,
      },
    }),
  ]);

  const [
    st1,
    st2,
    st3,
    st4,
    st5,
    st6,
    st7,
    st8,
    st9,
    st10,
    st11,
    st12,
    st13,
    st14,
    st15,
  ] = staffRecords;

  // ============================================================
  // EXAMS (12 records — no dependencies at creation time)
  // ============================================================
  console.log("  → Seeding Exams...");

  const examRecords = await Promise.all([
    prisma.exam.create({
      data: {
        title: "Term 1 Mathematics Exam 2024",
        startTime: new Date("2024-04-01T09:00:00"),
        endTime: new Date("2024-04-01T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 1 English Exam 2024",
        startTime: new Date("2024-04-02T09:00:00"),
        endTime: new Date("2024-04-02T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 1 Basic Science Exam 2024",
        startTime: new Date("2024-04-03T09:00:00"),
        endTime: new Date("2024-04-03T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 1 Social Studies Exam 2024",
        startTime: new Date("2024-04-04T09:00:00"),
        endTime: new Date("2024-04-04T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 2 Physics Exam 2024",
        startTime: new Date("2024-08-05T09:00:00"),
        endTime: new Date("2024-08-05T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 2 Chemistry Exam 2024",
        startTime: new Date("2024-08-06T09:00:00"),
        endTime: new Date("2024-08-06T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 2 Biology Exam 2024",
        startTime: new Date("2024-08-07T09:00:00"),
        endTime: new Date("2024-08-07T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 2 History Exam 2024",
        startTime: new Date("2024-08-08T09:00:00"),
        endTime: new Date("2024-08-08T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 3 Geography Exam 2024",
        startTime: new Date("2024-11-25T09:00:00"),
        endTime: new Date("2024-11-25T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 3 Literature Exam 2024",
        startTime: new Date("2024-11-26T09:00:00"),
        endTime: new Date("2024-11-26T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 3 Economics Exam 2024",
        startTime: new Date("2024-11-27T09:00:00"),
        endTime: new Date("2024-11-27T11:00:00"),
      },
    }),
    prisma.exam.create({
      data: {
        title: "Term 3 Civic Education Exam 2024",
        startTime: new Date("2024-11-28T09:00:00"),
        endTime: new Date("2024-11-28T11:00:00"),
      },
    }),
  ]);

  const [ex1, ex2, ex3, ex4, ex5, ex6, ex7, ex8, ex9, ex10, ex11, ex12] =
    examRecords;

  // ============================================================
  // TESTS (12 records — no dependencies at creation time)
  // ============================================================
  console.log("  → Seeding Tests...");

  const testRecords = await Promise.all([
    prisma.test.create({
      data: {
        title: "Mathematics CA Test 1",
        startTime: new Date("2024-02-10T10:00:00"),
        endTime: new Date("2024-02-10T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "English CA Test 1",
        startTime: new Date("2024-02-11T10:00:00"),
        endTime: new Date("2024-02-11T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Basic Science CA Test 1",
        startTime: new Date("2024-02-12T10:00:00"),
        endTime: new Date("2024-02-12T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Social Studies CA Test 1",
        startTime: new Date("2024-02-13T10:00:00"),
        endTime: new Date("2024-02-13T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Physics CA Test 1",
        startTime: new Date("2024-02-14T10:00:00"),
        endTime: new Date("2024-02-14T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Chemistry CA Test 1",
        startTime: new Date("2024-02-15T10:00:00"),
        endTime: new Date("2024-02-15T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Biology CA Test 1",
        startTime: new Date("2024-02-16T10:00:00"),
        endTime: new Date("2024-02-16T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "History CA Test 1",
        startTime: new Date("2024-02-17T10:00:00"),
        endTime: new Date("2024-02-17T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Geography CA Test 1",
        startTime: new Date("2024-02-18T10:00:00"),
        endTime: new Date("2024-02-18T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Literature CA Test 1",
        startTime: new Date("2024-02-19T10:00:00"),
        endTime: new Date("2024-02-19T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Economics CA Test 1",
        startTime: new Date("2024-02-20T10:00:00"),
        endTime: new Date("2024-02-20T11:00:00"),
      },
    }),
    prisma.test.create({
      data: {
        title: "Civic Education CA Test 1",
        startTime: new Date("2024-02-21T10:00:00"),
        endTime: new Date("2024-02-21T11:00:00"),
      },
    }),
  ]);

  const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12] = testRecords;

  // ============================================================
  // ASSIGNMENTS (12 records — no dependencies at creation time)
  // ============================================================
  console.log("  → Seeding Assignments...");

  const assignmentRecords = await Promise.all([
    prisma.assignment.create({
      data: {
        title: "Mathematics Homework Set 1",
        startTime: new Date("2024-02-01T08:00:00"),
        dueDate: new Date("2024-02-07T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "English Comprehension Exercise",
        startTime: new Date("2024-02-03T08:00:00"),
        dueDate: new Date("2024-02-10T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Basic Science Project 1",
        startTime: new Date("2024-02-05T08:00:00"),
        dueDate: new Date("2024-02-19T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Social Studies Map Work",
        startTime: new Date("2024-02-06T08:00:00"),
        dueDate: new Date("2024-02-13T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Physics Problem Set 1",
        startTime: new Date("2024-03-01T08:00:00"),
        dueDate: new Date("2024-03-08T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Chemistry Lab Report 1",
        startTime: new Date("2024-03-05T08:00:00"),
        dueDate: new Date("2024-03-12T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Biology Diagram Assignment",
        startTime: new Date("2024-03-07T08:00:00"),
        dueDate: new Date("2024-03-14T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "History Timeline Project",
        startTime: new Date("2024-03-10T08:00:00"),
        dueDate: new Date("2024-03-24T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Geography Map Study",
        startTime: new Date("2024-03-12T08:00:00"),
        dueDate: new Date("2024-03-19T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Literature Book Review",
        startTime: new Date("2024-03-15T08:00:00"),
        dueDate: new Date("2024-03-29T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Economics Case Study",
        startTime: new Date("2024-03-20T08:00:00"),
        dueDate: new Date("2024-04-03T23:59:59"),
      },
    }),
    prisma.assignment.create({
      data: {
        title: "Civic Education Research Paper",
        startTime: new Date("2024-03-22T08:00:00"),
        dueDate: new Date("2024-04-05T23:59:59"),
      },
    }),
  ]);

  const [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] = assignmentRecords;

  // ============================================================
  // SUBJECTS (12 records)
  // Each subject links to Exam, Test, and multiple Staff.
  // Primary subjects: sub1–sub4  |  Secondary: sub5–sub9
  // Literature/Economics/Civic: sub10–sub12
  // ============================================================
  console.log("  → Seeding Subjects...");

  const subjectRecords = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Mathematics",
        description: "Number, Algebra and Problem Solving",
        code: "MTH101",
        examId: ex1.id,
        testId: t1.id,
        staffs: {
          connect: [
            { id: st1.id },
            { id: st2.id },
            { id: st3.id },
            { id: st8.id },
          ],
        },
      },
    }),
    prisma.subject.create({
      data: {
        name: "English Language",
        description: "Communication, Reading and Writing",
        code: "ENG101",
        examId: ex2.id,
        testId: t2.id,
        staffs: { connect: [{ id: st1.id }, { id: st4.id }, { id: st5.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Basic Science",
        description: "Introduction to Scientific Concepts",
        code: "BSC101",
        examId: ex3.id,
        testId: t3.id,
        staffs: { connect: [{ id: st3.id }, { id: st6.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Social Studies",
        description: "Society, Culture and the Environment",
        code: "SST101",
        examId: ex4.id,
        testId: t4.id,
        staffs: { connect: [{ id: st4.id }, { id: st7.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Physics",
        description: "Matter, Energy, Forces and Motion",
        code: "PHY201",
        examId: ex5.id,
        testId: t5.id,
        staffs: { connect: [{ id: st10.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Chemistry",
        description: "Atoms, Molecules and Chemical Reactions",
        code: "CHM201",
        examId: ex6.id,
        testId: t6.id,
        staffs: { connect: [{ id: st11.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Biology",
        description: "Living Organisms and Life Processes",
        code: "BIO201",
        examId: ex7.id,
        testId: t7.id,
        staffs: { connect: [{ id: st12.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "History",
        description: "Past Events and Civilizations",
        code: "HIS201",
        examId: ex8.id,
        testId: t8.id,
        staffs: { connect: [{ id: st13.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Geography",
        description: "Earth, Environments and Spatial Thinking",
        code: "GEO201",
        examId: ex9.id,
        testId: t9.id,
        staffs: { connect: [{ id: st9.id }, { id: st14.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Literature in English",
        description: "Literary Works, Prose, Poetry and Drama",
        code: "LIT201",
        examId: ex10.id,
        testId: t10.id,
        staffs: { connect: [{ id: st13.id }, { id: st15.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Economics",
        description: "Production, Distribution and Consumption of Goods",
        code: "ECO301",
        examId: ex11.id,
        testId: t11.id,
        staffs: { connect: [{ id: st14.id }, { id: st15.id }] },
      },
    }),
    prisma.subject.create({
      data: {
        name: "Civic Education",
        description: "Rights, Responsibilities and Democratic Values",
        code: "CIV101",
        examId: ex12.id,
        testId: t12.id,
        staffs: { connect: [{ id: st7.id }, { id: st8.id }] },
      },
    }),
  ]);

  const [
    sub1,
    sub2,
    sub3,
    sub4,
    sub5,
    sub6,
    sub7,
    sub8,
    sub9,
    sub10,
    sub11,
    sub12,
  ] = subjectRecords;

  // ============================================================
  // CLASSES (15 records)
  // Every class has a supervisor from its school.
  // s1 → c1, c2  |  s2 → c3, c4  |  s3 → c5, c6
  // s4 → c7, c8  |  s5 → c9, c10 |  s6 → c11
  // s7 → c12     |  s8 → c13     |  s9 → c14  |  s10 → c15
  // ============================================================
  console.log("  → Seeding Classes...");

  const classRecords = await Promise.all([
    prisma.class.create({
      data: {
        name: "Primary 1A",
        type: ClassType.PRIMARY,
        description: "Grade 1 Class A — Greenfield",
        population: 30,
        supervisorId: st1.id,
        gradeYearId: gy1.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "Primary 2A",
        type: ClassType.PRIMARY,
        description: "Grade 2 Class A — Greenfield",
        population: 28,
        supervisorId: st2.id,
        gradeYearId: gy2.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "Primary 3A",
        type: ClassType.PRIMARY,
        description: "Grade 3 Class A — Sunflower",
        population: 32,
        supervisorId: st3.id,
        gradeYearId: gy3.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "Primary 4A",
        type: ClassType.PRIMARY,
        description: "Grade 4 Class A — Sunflower",
        population: 25,
        supervisorId: st4.id,
        gradeYearId: gy4.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "Primary 5A",
        type: ClassType.PRIMARY,
        description: "Grade 5 Class A — Maple Leaf",
        population: 27,
        supervisorId: st5.id,
        gradeYearId: gy5.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "Primary 6A",
        type: ClassType.PRIMARY,
        description: "Grade 6 Class A — Maple Leaf",
        population: 30,
        supervisorId: st6.id,
        gradeYearId: gy6.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "JSS 1A",
        type: ClassType.SECONDARY,
        description: "JSS 1 Class A — Riverside",
        population: 35,
        supervisorId: st7.id,
        gradeYearId: gy7.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "JSS 2A",
        type: ClassType.SECONDARY,
        description: "JSS 2 Class A — Riverside",
        population: 33,
        supervisorId: st8.id,
        gradeYearId: gy8.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "SSS 1A",
        type: ClassType.SECONDARY,
        description: "SSS 1 Class A — Oakwood",
        population: 40,
        supervisorId: st9.id,
        gradeYearId: gy9.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "SSS 2A",
        type: ClassType.SECONDARY,
        description: "SSS 2 Class A — Oakwood",
        population: 38,
        supervisorId: st10.id,
        gradeYearId: gy10.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "JSS 3A",
        type: ClassType.SECONDARY,
        description: "JSS 3 Class A — Hillside",
        population: 36,
        supervisorId: st11.id,
        gradeYearId: gy8.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "SSS 3A",
        type: ClassType.SECONDARY,
        description: "SSS 3 Class A — Lakewood",
        population: 34,
        supervisorId: st12.id,
        gradeYearId: gy10.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "SSS Lit & Arts",
        type: ClassType.SECONDARY,
        description: "Literature & Arts — Pinecrest",
        population: 29,
        supervisorId: st13.id,
        gradeYearId: gy10.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "100L Science",
        type: ClassType.TERTIARY,
        description: "100 Level Science — Capital Uni",
        population: 60,
        supervisorId: st14.id,
        gradeYearId: gy1.id,
      },
    }),
    prisma.class.create({
      data: {
        name: "200L Arts",
        type: ClassType.TERTIARY,
        description: "200 Level Arts — Westbrook Uni",
        population: 55,
        supervisorId: st15.id,
        gradeYearId: gy2.id,
      },
    }),
  ]);

  const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15] =
    classRecords;

  // ============================================================
  // GUARDIANS (12 records — no dependencies)
  // guardians g1–g10 will each have 2 students (20 students)
  // guardians g11 and g12 each have 1 student (2 more = 22 total)
  // ============================================================
  console.log("  → Seeding Guardians...");

  const guardianRecords = await Promise.all([
    prisma.guardian.create({
      data: {
        username: "guardian_ifeanyi_okonkwo",
        email: "ifeanyi.okonkwo@yopmail.com",
        firstName: "Ifeanyi",
        lastName: "Okonkwo",
        phoneNumber: "+2348031110001",
        address: "10 Palm Avenue, Lagos",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_toyin_adesanya",
        email: "toyin.adesanya@yopmail.com",
        firstName: "Toyin",
        lastName: "Adesanya",
        phoneNumber: "+2348031110002",
        address: "20 Bougainvillea Rd, Abuja",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_abubakar_musa",
        email: "abubakar.musa@yopmail.com",
        firstName: "Abubakar",
        lastName: "Musa",
        phoneNumber: "+2348031110003",
        address: "30 Emir Road, Kano",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_chinyere_eze",
        email: "chinyere.eze@yopmail.com",
        firstName: "Chinyere",
        lastName: "Eze",
        phoneNumber: "+2348031110004",
        address: "40 Coal City Drive, Enugu",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_rasheed_adeyemi",
        email: "rasheed.adeyemi@yopmail.com",
        firstName: "Rasheed",
        lastName: "Adeyemi",
        phoneNumber: "+2348031110005",
        address: "50 Liberty Avenue, Ibadan",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_obiageli_nwosu",
        email: "obiageli.nwosu@yopmail.com",
        firstName: "Obiageli",
        lastName: "Nwosu",
        phoneNumber: "+2348031110006",
        address: "60 Trans-Amadi, Port Harcourt",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_yakubu_bello",
        email: "yakubu.bello@yopmail.com",
        firstName: "Yakubu",
        lastName: "Bello",
        phoneNumber: "+2348031110007",
        address: "70 Kachia Road, Kaduna",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_folasade_lawal",
        email: "folasade.lawal@yopmail.com",
        firstName: "Folasade",
        lastName: "Lawal",
        phoneNumber: "+2348031110008",
        address: "80 Ikorodu Road, Lagos",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_hassan_ibrahim",
        email: "hassan.ibrahim@yopmail.com",
        firstName: "Hassan",
        lastName: "Ibrahim",
        phoneNumber: "+2348031110009",
        address: "90 Central Area, Abuja",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_abena_osei",
        email: "abena.osei@yopmail.com",
        firstName: "Abena",
        lastName: "Osei",
        phoneNumber: "+2348031110010",
        address: "100 Lekki Phase 1, Lagos",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_suleiman_aliyu",
        email: "suleiman.aliyu@yopmail.com",
        firstName: "Suleiman",
        lastName: "Aliyu",
        phoneNumber: "+2348031110011",
        address: "110 Sultan Road, Sokoto",
        password,
        gender: Gender.MALE,
        role: Role.GUARDIAN,
      },
    }),
    prisma.guardian.create({
      data: {
        username: "guardian_amara_okeke",
        email: "amara.okeke@yopmail.com",
        firstName: "Amara",
        lastName: "Okeke",
        phoneNumber: "+2348031110012",
        address: "120 Awka Road, Anambra",
        password,
        gender: Gender.FEMALE,
        role: Role.GUARDIAN,
      },
    }),
  ]);

  const [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12] = guardianRecords;

  // ============================================================
  // STUDENTS (22 records)
  // g1–g10 → 2 students each (20 students)
  // g11, g12 → 1 student each (2 students) = 22 total
  // Every student is linked to: class, guardian, school,
  // gradeYear, exam, test, assignment, and subject.
  // ============================================================
  console.log("  → Seeding Students...");

  const studentRecords = await Promise.all([
    // Guardian 1 (Ifeanyi Okonkwo) → 2 children in s1
    prisma.student.create({
      data: {
        username: "student_chioma_okonkwo",
        email: "chioma.okonkwo@yopmail.com",
        firstName: "Chioma",
        lastName: "Okonkwo",
        password,
        address: "10 Palm Avenue, Lagos",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c1.id,
        guardianId: g1.id,
        schoolId: s1.id,
        gradeYearId: gy1.id,
        examId: ex1.id,
        testId: t1.id,
        assignmentId: a1.id,
        subjectId: sub1.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_emeka_okonkwo",
        email: "emeka.okonkwo@yopmail.com",
        firstName: "Emeka",
        lastName: "Okonkwo",
        password,
        address: "10 Palm Avenue, Lagos",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c2.id,
        guardianId: g1.id,
        schoolId: s1.id,
        gradeYearId: gy2.id,
        examId: ex2.id,
        testId: t2.id,
        assignmentId: a2.id,
        subjectId: sub2.id,
      },
    }),
    // Guardian 2 (Toyin Adesanya) → 2 children in s2
    prisma.student.create({
      data: {
        username: "student_bola_adesanya",
        email: "bola.adesanya@yopmail.com",
        firstName: "Bola",
        lastName: "Adesanya",
        password,
        address: "20 Bougainvillea Rd, Abuja",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c3.id,
        guardianId: g2.id,
        schoolId: s2.id,
        gradeYearId: gy3.id,
        examId: ex3.id,
        testId: t3.id,
        assignmentId: a3.id,
        subjectId: sub3.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_seun_adesanya",
        email: "seun.adesanya@yopmail.com",
        firstName: "Seun",
        lastName: "Adesanya",
        password,
        address: "20 Bougainvillea Rd, Abuja",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c4.id,
        guardianId: g2.id,
        schoolId: s2.id,
        gradeYearId: gy4.id,
        examId: ex4.id,
        testId: t4.id,
        assignmentId: a4.id,
        subjectId: sub4.id,
      },
    }),
    // Guardian 3 (Abubakar Musa) → 2 children in s3
    prisma.student.create({
      data: {
        username: "student_fatima_musa",
        email: "fatima.musa@yopmail.com",
        firstName: "Fatima",
        lastName: "Musa",
        password,
        address: "30 Emir Road, Kano",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c5.id,
        guardianId: g3.id,
        schoolId: s3.id,
        gradeYearId: gy5.id,
        examId: ex5.id,
        testId: t5.id,
        assignmentId: a5.id,
        subjectId: sub5.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_ahmed_musa",
        email: "ahmed.musa@yopmail.com",
        firstName: "Ahmed",
        lastName: "Musa",
        password,
        address: "30 Emir Road, Kano",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c6.id,
        guardianId: g3.id,
        schoolId: s3.id,
        gradeYearId: gy6.id,
        examId: ex6.id,
        testId: t6.id,
        assignmentId: a6.id,
        subjectId: sub6.id,
      },
    }),
    // Guardian 4 (Chinyere Eze) → 2 children in s4
    prisma.student.create({
      data: {
        username: "student_adaeze_eze",
        email: "adaeze.eze@yopmail.com",
        firstName: "Adaeze",
        lastName: "Eze",
        password,
        address: "40 Coal City Drive, Enugu",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c7.id,
        guardianId: g4.id,
        schoolId: s4.id,
        gradeYearId: gy7.id,
        examId: ex7.id,
        testId: t7.id,
        assignmentId: a7.id,
        subjectId: sub7.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_chukwuemeka_eze",
        email: "chukwuemeka.eze@yopmail.com",
        firstName: "Chukwuemeka",
        lastName: "Eze",
        password,
        address: "40 Coal City Drive, Enugu",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c8.id,
        guardianId: g4.id,
        schoolId: s4.id,
        gradeYearId: gy8.id,
        examId: ex8.id,
        testId: t8.id,
        assignmentId: a8.id,
        subjectId: sub8.id,
      },
    }),
    // Guardian 5 (Rasheed Adeyemi) → 2 children in s5
    prisma.student.create({
      data: {
        username: "student_kola_adeyemi",
        email: "kola.adeyemi@yopmail.com",
        firstName: "Kola",
        lastName: "Adeyemi",
        password,
        address: "50 Liberty Avenue, Ibadan",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c9.id,
        guardianId: g5.id,
        schoolId: s5.id,
        gradeYearId: gy9.id,
        examId: ex9.id,
        testId: t9.id,
        assignmentId: a9.id,
        subjectId: sub9.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_titilayo_adeyemi",
        email: "titilayo.adeyemi@yopmail.com",
        firstName: "Titilayo",
        lastName: "Adeyemi",
        password,
        address: "50 Liberty Avenue, Ibadan",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c10.id,
        guardianId: g5.id,
        schoolId: s5.id,
        gradeYearId: gy10.id,
        examId: ex10.id,
        testId: t10.id,
        assignmentId: a10.id,
        subjectId: sub10.id,
      },
    }),
    // Guardian 6 (Obiageli Nwosu) → 2 children in s6 & s7
    prisma.student.create({
      data: {
        username: "student_udo_nwosu",
        email: "udo.nwosu@yopmail.com",
        firstName: "Udo",
        lastName: "Nwosu",
        password,
        address: "60 Trans-Amadi, Port Harcourt",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c11.id,
        guardianId: g6.id,
        schoolId: s6.id,
        gradeYearId: gy8.id,
        examId: ex11.id,
        testId: t11.id,
        assignmentId: a11.id,
        subjectId: sub11.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_ada_nwosu",
        email: "ada.nwosu@yopmail.com",
        firstName: "Ada",
        lastName: "Nwosu",
        password,
        address: "60 Trans-Amadi, Port Harcourt",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c12.id,
        guardianId: g6.id,
        schoolId: s7.id,
        gradeYearId: gy10.id,
        examId: ex12.id,
        testId: t12.id,
        assignmentId: a12.id,
        subjectId: sub12.id,
      },
    }),
    // Guardian 7 (Yakubu Bello) → 2 children in s7 & s8
    prisma.student.create({
      data: {
        username: "student_ibrahim_bello",
        email: "ibrahim.bello@yopmail.com",
        firstName: "Ibrahim",
        lastName: "Bello",
        password,
        address: "70 Kachia Road, Kaduna",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c12.id,
        guardianId: g7.id,
        schoolId: s7.id,
        gradeYearId: gy10.id,
        examId: ex1.id,
        testId: t1.id,
        assignmentId: a1.id,
        subjectId: sub1.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_zainab_bello",
        email: "zainab.bello@yopmail.com",
        firstName: "Zainab",
        lastName: "Bello",
        password,
        address: "70 Kachia Road, Kaduna",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c13.id,
        guardianId: g7.id,
        schoolId: s8.id,
        gradeYearId: gy10.id,
        examId: ex2.id,
        testId: t2.id,
        assignmentId: a2.id,
        subjectId: sub2.id,
      },
    }),
    // Guardian 8 (Folasade Lawal) → 2 children in s9 & s10
    prisma.student.create({
      data: {
        username: "student_kunle_lawal",
        email: "kunle.lawal@yopmail.com",
        firstName: "Kunle",
        lastName: "Lawal",
        password,
        address: "80 Ikorodu Road, Lagos",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c14.id,
        guardianId: g8.id,
        schoolId: s9.id,
        gradeYearId: gy1.id,
        examId: ex3.id,
        testId: t3.id,
        assignmentId: a3.id,
        subjectId: sub3.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_yetunde_lawal",
        email: "yetunde.lawal@yopmail.com",
        firstName: "Yetunde",
        lastName: "Lawal",
        password,
        address: "80 Ikorodu Road, Lagos",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c15.id,
        guardianId: g8.id,
        schoolId: s10.id,
        gradeYearId: gy2.id,
        examId: ex4.id,
        testId: t4.id,
        assignmentId: a4.id,
        subjectId: sub4.id,
      },
    }),
    // Guardian 9 (Hassan Ibrahim) → 2 children in s1 & s2
    prisma.student.create({
      data: {
        username: "student_hassan_ibrahim_jr",
        email: "hassan.ibrahim.jr@yopmail.com",
        firstName: "Hassan",
        lastName: "Ibrahim",
        password,
        address: "90 Central Area, Abuja",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c1.id,
        guardianId: g9.id,
        schoolId: s1.id,
        gradeYearId: gy1.id,
        examId: ex5.id,
        testId: t5.id,
        assignmentId: a5.id,
        subjectId: sub5.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_maryam_ibrahim",
        email: "maryam.ibrahim@yopmail.com",
        firstName: "Maryam",
        lastName: "Ibrahim",
        password,
        address: "90 Central Area, Abuja",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c3.id,
        guardianId: g9.id,
        schoolId: s2.id,
        gradeYearId: gy3.id,
        examId: ex6.id,
        testId: t6.id,
        assignmentId: a6.id,
        subjectId: sub6.id,
      },
    }),
    // Guardian 10 (Abena Osei) → 2 children in s3 & s4
    prisma.student.create({
      data: {
        username: "student_kwame_osei",
        email: "kwame.osei@yopmail.com",
        firstName: "Kwame",
        lastName: "Osei",
        password,
        address: "100 Lekki Phase 1, Lagos",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c5.id,
        guardianId: g10.id,
        schoolId: s3.id,
        gradeYearId: gy5.id,
        examId: ex7.id,
        testId: t7.id,
        assignmentId: a7.id,
        subjectId: sub7.id,
      },
    }),
    prisma.student.create({
      data: {
        username: "student_akosua_osei",
        email: "akosua.osei@yopmail.com",
        firstName: "Akosua",
        lastName: "Osei",
        password,
        address: "100 Lekki Phase 1, Lagos",
        gender: Gender.FEMALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c7.id,
        guardianId: g10.id,
        schoolId: s4.id,
        gradeYearId: gy7.id,
        examId: ex8.id,
        testId: t8.id,
        assignmentId: a8.id,
        subjectId: sub8.id,
      },
    }),
    // Guardian 11 (Suleiman Aliyu) → 1 child in s5
    prisma.student.create({
      data: {
        username: "student_umar_aliyu",
        email: "umar.aliyu@yopmail.com",
        firstName: "Umar",
        lastName: "Aliyu",
        password,
        address: "110 Sultan Road, Sokoto",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c9.id,
        guardianId: g11.id,
        schoolId: s5.id,
        gradeYearId: gy9.id,
        examId: ex9.id,
        testId: t9.id,
        assignmentId: a9.id,
        subjectId: sub9.id,
      },
    }),
    // Guardian 12 (Amara Okeke) → 1 child in s6
    prisma.student.create({
      data: {
        username: "student_chidi_okeke",
        email: "chidi.okeke@yopmail.com",
        firstName: "Chidi",
        lastName: "Okeke",
        password,
        address: "120 Awka Road, Anambra",
        gender: Gender.MALE,
        role: Role.STUDENT,
        accomodation: Accomodation.OFFCAMPUS,
        classId: c11.id,
        guardianId: g12.id,
        schoolId: s6.id,
        gradeYearId: gy8.id,
        examId: ex10.id,
        testId: t10.id,
        assignmentId: a10.id,
        subjectId: sub10.id,
      },
    }),
  ]);

  const [
    stu1,
    stu2,
    stu3,
    stu4,
    stu5,
    stu6,
    stu7,
    stu8,
    stu9,
    stu10,
    stu11,
    stu12,
    stu13,
    stu14,
    stu15,
    stu16,
    stu17,
    stu18,
    stu19,
    stu20,
    stu21,
    stu22,
  ] = studentRecords;

  // ============================================================
  // LESSONS (12 records)
  // Each lesson belongs to a Subject, Class, Staff, and Assignment.
  // The staff member is someone who teaches that subject.
  // ============================================================
  console.log("  → Seeding Lessons...");

  const lessonRecords = await Promise.all([
    prisma.lesson.create({
      data: {
        name: "Introduction to Numbers",
        description: "Counting, place value and basic arithmetic",
        day: Day.MONDAY,
        startTime: new Date("2024-01-15T08:00:00"),
        endTime: new Date("2024-01-15T09:00:00"),
        subjectId: sub1.id,
        classId: c1.id,
        staffId: st1.id,
        assignmentId: a1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Reading Comprehension Basics",
        description: "Reading passages and answering questions",
        day: Day.TUESDAY,
        startTime: new Date("2024-01-16T09:00:00"),
        endTime: new Date("2024-01-16T10:00:00"),
        subjectId: sub2.id,
        classId: c2.id,
        staffId: st1.id,
        assignmentId: a2.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "States of Matter",
        description: "Solid, liquid, gas and their properties",
        day: Day.WEDNESDAY,
        startTime: new Date("2024-01-17T08:00:00"),
        endTime: new Date("2024-01-17T09:00:00"),
        subjectId: sub3.id,
        classId: c3.id,
        staffId: st3.id,
        assignmentId: a3.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Our Community",
        description: "Understanding the local community and roles",
        day: Day.THURSDAY,
        startTime: new Date("2024-01-18T10:00:00"),
        endTime: new Date("2024-01-18T11:00:00"),
        subjectId: sub4.id,
        classId: c4.id,
        staffId: st4.id,
        assignmentId: a4.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Fractions and Decimals",
        description: "Understanding fractions, decimals and percentages",
        day: Day.FRIDAY,
        startTime: new Date("2024-01-19T08:00:00"),
        endTime: new Date("2024-01-19T09:00:00"),
        subjectId: sub1.id,
        classId: c5.id,
        staffId: st3.id,
        assignmentId: a1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Living and Non-Living Things",
        description: "Classification of organisms and objects",
        day: Day.MONDAY,
        startTime: new Date("2024-01-22T09:00:00"),
        endTime: new Date("2024-01-22T10:00:00"),
        subjectId: sub3.id,
        classId: c6.id,
        staffId: st6.id,
        assignmentId: a3.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Civic Rights and Duties",
        description: "Citizen rights, obligations and democracy",
        day: Day.TUESDAY,
        startTime: new Date("2024-01-23T08:00:00"),
        endTime: new Date("2024-01-23T09:00:00"),
        subjectId: sub12.id,
        classId: c7.id,
        staffId: st7.id,
        assignmentId: a12.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Map Reading Skills",
        description: "Map types, keys and basic navigation",
        day: Day.WEDNESDAY,
        startTime: new Date("2024-01-24T10:00:00"),
        endTime: new Date("2024-01-24T11:00:00"),
        subjectId: sub4.id,
        classId: c8.id,
        staffId: st8.id,
        assignmentId: a4.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Newton's Laws of Motion",
        description: "First, second and third laws of motion",
        day: Day.THURSDAY,
        startTime: new Date("2024-01-25T09:00:00"),
        endTime: new Date("2024-01-25T10:00:00"),
        subjectId: sub5.id,
        classId: c9.id,
        staffId: st10.id,
        assignmentId: a5.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Periodic Table of Elements",
        description: "Elements, symbols and their properties",
        day: Day.FRIDAY,
        startTime: new Date("2024-01-26T08:00:00"),
        endTime: new Date("2024-01-26T09:00:00"),
        subjectId: sub6.id,
        classId: c10.id,
        staffId: st11.id,
        assignmentId: a6.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Microeconomics Fundamentals",
        description: "Supply, demand and market equilibrium",
        day: Day.MONDAY,
        startTime: new Date("2024-01-29T10:00:00"),
        endTime: new Date("2024-01-29T11:00:00"),
        subjectId: sub11.id,
        classId: c14.id,
        staffId: st14.id,
        assignmentId: a11.id,
      },
    }),
    prisma.lesson.create({
      data: {
        name: "Poetry and Prose Analysis",
        description: "Analyzing literary devices and themes",
        day: Day.TUESDAY,
        startTime: new Date("2024-01-30T09:00:00"),
        endTime: new Date("2024-01-30T10:00:00"),
        subjectId: sub10.id,
        classId: c15.id,
        staffId: st15.id,
        assignmentId: a10.id,
      },
    }),
  ]);

  const [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12] = lessonRecords;

  // ============================================================
  // TERMS (12 records — linked to GradeYears)
  // 3 terms per gradeYear for gy1, gy2, gy3, gy4
  // ============================================================
  console.log("  → Seeding Terms...");

  await Promise.all([
    // GradeYear 1 — 3 terms
    prisma.term.create({
      data: {
        name: "First Term 2024 — Grade 1",
        start: new Date("2024-01-08"),
        end: new Date("2024-04-05"),
        type: TermType.FIRSTTERM,
        gradeYearId: gy1.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Second Term 2024 — Grade 1",
        start: new Date("2024-04-22"),
        end: new Date("2024-07-19"),
        type: TermType.SECONDTERM,
        gradeYearId: gy1.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Third Term 2024 — Grade 1",
        start: new Date("2024-09-09"),
        end: new Date("2024-12-13"),
        type: TermType.THIRDTERM,
        gradeYearId: gy1.id,
      },
    }),
    // GradeYear 2 — 3 terms
    prisma.term.create({
      data: {
        name: "First Term 2024 — Grade 2",
        start: new Date("2024-01-08"),
        end: new Date("2024-04-05"),
        type: TermType.FIRSTTERM,
        gradeYearId: gy2.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Second Term 2024 — Grade 2",
        start: new Date("2024-04-22"),
        end: new Date("2024-07-19"),
        type: TermType.SECONDTERM,
        gradeYearId: gy2.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Third Term 2024 — Grade 2",
        start: new Date("2024-09-09"),
        end: new Date("2024-12-13"),
        type: TermType.THIRDTERM,
        gradeYearId: gy2.id,
      },
    }),
    // GradeYear 3 — 3 terms
    prisma.term.create({
      data: {
        name: "First Term 2024 — Grade 3",
        start: new Date("2024-01-08"),
        end: new Date("2024-04-05"),
        type: TermType.FIRSTTERM,
        gradeYearId: gy3.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Second Term 2024 — Grade 3",
        start: new Date("2024-04-22"),
        end: new Date("2024-07-19"),
        type: TermType.SECONDTERM,
        gradeYearId: gy3.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Third Term 2024 — Grade 3",
        start: new Date("2024-09-09"),
        end: new Date("2024-12-13"),
        type: TermType.THIRDTERM,
        gradeYearId: gy3.id,
      },
    }),
    // GradeYear 4 — 3 terms
    prisma.term.create({
      data: {
        name: "First Term 2024 — Grade 4",
        start: new Date("2024-01-08"),
        end: new Date("2024-04-05"),
        type: TermType.FIRSTTERM,
        gradeYearId: gy4.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Second Term 2024 — Grade 4",
        start: new Date("2024-04-22"),
        end: new Date("2024-07-19"),
        type: TermType.SECONDTERM,
        gradeYearId: gy4.id,
      },
    }),
    prisma.term.create({
      data: {
        name: "Third Term 2024 — Grade 4",
        start: new Date("2024-09-09"),
        end: new Date("2024-12-13"),
        type: TermType.THIRDTERM,
        gradeYearId: gy4.id,
      },
    }),
  ]);

  // ============================================================
  // ATTENDANCE (15 records — depends on Student and Lesson)
  // ============================================================
  console.log("  → Seeding Attendance...");

  await Promise.all([
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-15"),
        status: AttendanceStatus.PRESENT,
        studentId: stu1.id,
        lessonId: l1.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-16"),
        status: AttendanceStatus.PRESENT,
        studentId: stu2.id,
        lessonId: l2.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-17"),
        status: AttendanceStatus.ABSENT,
        studentId: stu3.id,
        lessonId: l3.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-18"),
        status: AttendanceStatus.PRESENT,
        studentId: stu4.id,
        lessonId: l4.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-19"),
        status: AttendanceStatus.PRESENT,
        studentId: stu9.id,
        lessonId: l5.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-22"),
        status: AttendanceStatus.ABSENT,
        studentId: stu10.id,
        lessonId: l6.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-23"),
        status: AttendanceStatus.PRESENT,
        studentId: stu7.id,
        lessonId: l7.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-24"),
        status: AttendanceStatus.PRESENT,
        studentId: stu8.id,
        lessonId: l8.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-25"),
        status: AttendanceStatus.ABSENT,
        studentId: stu21.id,
        lessonId: l9.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-26"),
        status: AttendanceStatus.PRESENT,
        studentId: stu22.id,
        lessonId: l10.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-29"),
        status: AttendanceStatus.PRESENT,
        studentId: stu15.id,
        lessonId: l11.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-30"),
        status: AttendanceStatus.PRESENT,
        studentId: stu16.id,
        lessonId: l12.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-15"),
        status: AttendanceStatus.PRESENT,
        studentId: stu17.id,
        lessonId: l1.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-16"),
        status: AttendanceStatus.ABSENT,
        studentId: stu18.id,
        lessonId: l3.id,
      },
    }),
    prisma.attendance.create({
      data: {
        date: new Date("2024-01-22"),
        status: AttendanceStatus.PRESENT,
        studentId: stu5.id,
        lessonId: l5.id,
      },
    }),
  ]);

  // ============================================================
  // REPORT CARDS (12 records — depends on Student + Subject)
  // One unique subject is connected per report card to avoid
  // overwriting the Subject.reportCardId FK.
  // ============================================================
  console.log("  → Seeding ReportCards...");

  await Promise.all([
    prisma.reportCard.create({
      data: {
        testScore: 75.5,
        assignmentScore: 80.0,
        examScore: 70.0,
        attendanceScore: 90.0,
        teacherComment: "Good effort, keep it up!",
        generalComment: "Satisfactory performance overall.",
        studentId: stu1.id,
        subjects: { connect: [{ id: sub1.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 85.0,
        assignmentScore: 88.0,
        examScore: 82.0,
        attendanceScore: 95.0,
        teacherComment: "Excellent work all term!",
        generalComment: "Outstanding academic performance.",
        studentId: stu2.id,
        subjects: { connect: [{ id: sub2.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 60.0,
        assignmentScore: 65.0,
        examScore: 58.0,
        attendanceScore: 70.0,
        teacherComment: "Needs to focus more in class.",
        generalComment: "Below average. Additional support advised.",
        studentId: stu3.id,
        subjects: { connect: [{ id: sub3.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 78.0,
        assignmentScore: 82.0,
        examScore: 75.0,
        attendanceScore: 88.0,
        teacherComment: "Very active and participatory.",
        generalComment: "Good performance. Maintain the pace.",
        studentId: stu4.id,
        subjects: { connect: [{ id: sub4.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 91.0,
        assignmentScore: 90.0,
        examScore: 93.0,
        attendanceScore: 98.0,
        teacherComment: "Exceptional student — top of class!",
        generalComment: "Excellent. One of the best in cohort.",
        studentId: stu5.id,
        subjects: { connect: [{ id: sub5.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 55.0,
        assignmentScore: 60.0,
        examScore: 52.0,
        attendanceScore: 65.0,
        teacherComment: "Must put in significantly more effort.",
        generalComment: "Poor performance. Parental meeting needed.",
        studentId: stu6.id,
        subjects: { connect: [{ id: sub6.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 72.0,
        assignmentScore: 75.0,
        examScore: 70.0,
        attendanceScore: 85.0,
        teacherComment: "Consistent and steady learner.",
        generalComment: "Average performance. Room to grow.",
        studentId: stu7.id,
        subjects: { connect: [{ id: sub7.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 88.5,
        assignmentScore: 91.0,
        examScore: 86.0,
        attendanceScore: 97.0,
        teacherComment: "Very hardworking and dedicated.",
        generalComment: "Very good. Continue this level of effort.",
        studentId: stu8.id,
        subjects: { connect: [{ id: sub8.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 68.0,
        assignmentScore: 72.0,
        examScore: 65.0,
        attendanceScore: 80.0,
        teacherComment: "Can achieve more with concentration.",
        generalComment: "Fair performance. Focus is key.",
        studentId: stu9.id,
        subjects: { connect: [{ id: sub9.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 79.0,
        assignmentScore: 80.0,
        examScore: 77.0,
        attendanceScore: 90.0,
        teacherComment: "Good all-round student.",
        generalComment: "Good performance. Keep up the work.",
        studentId: stu10.id,
        subjects: { connect: [{ id: sub10.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 83.0,
        assignmentScore: 85.0,
        examScore: 81.0,
        attendanceScore: 94.0,
        teacherComment: "Showing great progress this term.",
        generalComment: "Very good. Commendable improvement.",
        studentId: stu11.id,
        subjects: { connect: [{ id: sub11.id }] },
      },
    }),
    prisma.reportCard.create({
      data: {
        testScore: 74.0,
        assignmentScore: 76.0,
        examScore: 72.0,
        attendanceScore: 87.0,
        teacherComment: "Reliable student, consistent output.",
        generalComment: "Good performance across all areas.",
        studentId: stu12.id,
        subjects: { connect: [{ id: sub12.id }] },
      },
    }),
  ]);

  // ============================================================
  // FEES (12 records — depends on Student)
  // ============================================================
  console.log("  → Seeding Fees...");

  await Promise.all([
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 50000,
        receipt: "RCP-2024-001",
        studentId: stu1.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 50000,
        receipt: "RCP-2024-002",
        studentId: stu2.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 45000,
        receipt: "RCP-2024-003",
        studentId: stu3.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 45000,
        receipt: "RCP-2024-004",
        studentId: stu4.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 60000,
        receipt: "RCP-2024-005",
        studentId: stu5.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "School Fees Term 1",
        description: "First term tuition fee 2024",
        amount: 60000,
        receipt: "RCP-2024-006",
        studentId: stu6.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "PTA Development Levy",
        description: "PTA levy for school development",
        amount: 10000,
        receipt: "RCP-2024-007",
        studentId: stu7.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "PTA Development Levy",
        description: "PTA levy for school development",
        amount: 10000,
        receipt: "RCP-2024-008",
        studentId: stu8.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "Library Fee",
        description: "Annual library access fee",
        amount: 3000,
        receipt: "RCP-2024-009",
        studentId: stu9.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "Library Fee",
        description: "Annual library access fee",
        amount: 3000,
        receipt: "RCP-2024-010",
        studentId: stu10.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "ICT / Lab Fee",
        description: "Computer & science laboratory fee",
        amount: 7500,
        receipt: "RCP-2024-011",
        studentId: stu11.id,
      },
    }),
    prisma.fees.create({
      data: {
        name: "ICT / Lab Fee",
        description: "Computer & science laboratory fee",
        amount: 7500,
        receipt: "RCP-2024-012",
        studentId: stu12.id,
      },
    }),
  ]);

  // ============================================================
  // EVENTS (12 records — depends on Class)
  // ============================================================
  console.log("  → Seeding Events...");

  await Promise.all([
    prisma.event.create({
      data: {
        title: "Sports Day 2024",
        description: "Annual inter-house sports competition.",
        date: new Date("2024-03-15"),
        duration: "6 hours",
        classId: c1.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Science Fair 2024",
        description: "Student science project exhibition and judging.",
        date: new Date("2024-04-20"),
        duration: "4 hours",
        classId: c2.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Cultural Day 2024",
        description: "Celebrating Nigerian cultures, foods and traditions.",
        date: new Date("2024-05-10"),
        duration: "5 hours",
        classId: c3.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Reading Week 2024",
        description: "A week dedicated to literacy and reading activities.",
        date: new Date("2024-06-03"),
        duration: "5 days",
        classId: c4.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Parent-Teacher Conference",
        description: "One-on-one meetings between parents and class teachers.",
        date: new Date("2024-06-15"),
        duration: "3 hours",
        classId: c5.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Environmental Clean-Up Day",
        description: "Tree planting and campus beautification exercise.",
        date: new Date("2024-06-05"),
        duration: "4 hours",
        classId: c6.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Drama & Arts Night 2024",
        description: "Student theatrical performances and art exhibition.",
        date: new Date("2024-07-05"),
        duration: "3 hours",
        classId: c7.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Mathematics Olympiad 2024",
        description: "Inter-class and inter-school mathematics competition.",
        date: new Date("2024-07-20"),
        duration: "4 hours",
        classId: c8.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Graduation Ceremony 2024",
        description: "End-of-year graduation and prize-giving ceremony.",
        date: new Date("2024-12-14"),
        duration: "3 hours",
        classId: c9.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Annual Prize Giving Day",
        description: "Awards for academic excellence and outstanding conduct.",
        date: new Date("2024-12-15"),
        duration: "2 hours",
        classId: c10.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Career Day 2024",
        description: "Professionals from various fields speak to students.",
        date: new Date("2024-09-20"),
        duration: "4 hours",
        classId: c11.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Open Day / Visiting Day",
        description: "School open to prospective families and guardians.",
        date: new Date("2024-10-05"),
        duration: "5 hours",
        classId: c12.id,
      },
    }),
  ]);

  // ============================================================
  // ANNOUNCEMENTS (12 records — depends on Class)
  // ============================================================
  console.log("  → Seeding Announcements...");

  await Promise.all([
    prisma.announcement.create({
      data: {
        title: "Welcome to Academic Year 2024",
        description:
          "Dear students and parents, welcome to the 2024 academic year. We look forward to a productive term.",
        date: new Date("2024-01-08"),
        classId: c1.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "School Fees Payment Deadline",
        description:
          "All school fees for First Term 2024 must be fully paid by January 31. Contact the bursary for details.",
        date: new Date("2024-01-10"),
        classId: c2.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Uniform Policy Reminder",
        description:
          "All students are reminded to wear full school uniform every day. Violators will be sent home to change.",
        date: new Date("2024-01-12"),
        classId: c3.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Sports Day Registration Open",
        description:
          "Students interested in competing at Sports Day should register at the school office by February 28.",
        date: new Date("2024-02-05"),
        classId: c4.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Mid-Term Break Notice",
        description:
          "Mid-term break runs from March 11 to 15, 2024. School resumes on Monday, March 18, 2024.",
        date: new Date("2024-03-05"),
        classId: c5.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "PTA Meeting — February 17",
        description:
          "The PTA meeting holds on February 17, 2024 at 10:00 AM in the school auditorium. All parents must attend.",
        date: new Date("2024-02-10"),
        classId: c6.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "First Term Exam Timetable",
        description:
          "The First Term examination timetable is now available. Collect copies at the admin office.",
        date: new Date("2024-03-15"),
        classId: c7.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "New Library Books Available",
        description:
          "New books have arrived at the school library. Students are encouraged to borrow and read widely.",
        date: new Date("2024-02-20"),
        classId: c8.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Inter-House Competition — Apr 5",
        description:
          "The inter-house sports competition holds on April 5, 2024. All students must participate in an event.",
        date: new Date("2024-03-25"),
        classId: c9.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Health Talk — Personal Hygiene",
        description:
          "A public health officer will give a talk on personal hygiene to all students on March 20, 2024.",
        date: new Date("2024-03-18"),
        classId: c10.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Second Term Resumption Date",
        description:
          "Second term resumes on Monday, April 22, 2024. All students are expected to be on time and in uniform.",
        date: new Date("2024-04-15"),
        classId: c11.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "Extracurricular Clubs Sign-Up",
        description:
          "Sign up for after-school clubs (Debate, Chess, Coding, Drama) at the student affairs office by Jan 20.",
        date: new Date("2024-01-15"),
        classId: c12.id,
      },
    }),
  ]);

  console.log("");
  console.log("✅ Seeding complete! Summary:");
  console.log("   • 10 GradeYears");
  console.log("   • 10 Schools (4 Primary · 4 Secondary · 2 Tertiary)");
  console.log("   • 10 Admins (1 SCHOOLADMIN per school)");
  console.log(
    "   • 15 Staff  (every class has a supervisor; every subject has a teacher)",
  );
  console.log("   • 12 Exams");
  console.log("   • 12 Tests");
  console.log("   • 12 Assignments");
  console.log("   • 12 Subjects (with Staff many-to-many links)");
  console.log("   • 15 Classes");
  console.log("   • 12 Guardians (10 with 2 students · 2 with 1 student)");
  console.log("   • 22 Students");
  console.log("   • 12 Lessons");
  console.log("   • 12 Terms");
  console.log("   • 15 Attendance records");
  console.log("   • 12 ReportCards");
  console.log("   • 12 Fees");
  console.log("   • 12 Events");
  console.log("   • 12 Announcements");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
