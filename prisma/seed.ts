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
} from "./generated/client";
import bcrypt from "bcryptjs";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // ======================================================
  // ADMINS
  // ======================================================

  await prisma.admin.createMany({
    data: [
      {
        id: "kjshdbf-1234-5678-9101-abcdefghijk",
        username: "superadminTemi",
        email: "superadmintemi@yopmail.com",
        firstName: "Temi",
        lastName: "Super",
        password,
        role: Role.SUPERADMIN,
        gender: Gender.MALE,
      },
      {
        id: "ewui-1234-5678-9101-lmnopqrstuv",
        username: "daniraadminTayo",
        email: "daniraadmintayo@yopmail.com",
        firstName: "Tayo",
        lastName: "Danira",
        password,
        role: Role.DANIRAADMIN,
        gender: Gender.MALE,
      },
      {
        id: "zxcvbnm-1234-5678-9101-wxyzabcdefg",
        username: "impactvilleadminSarah",
        email: "impactvilleadminSarah@yopmail.com",
        firstName: "Sarah",
        lastName: "Admin",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
      },
      {
        id: "asdfghj-1234-5678-9101-hijklmnopqr",
        username: "impactvillesubadminJohn",
        email: "impactvillesubadminJohn@yopmail.com",
        firstName: "John",
        lastName: "Cole",
        password,
        role: Role.SUBSCHOOLADMIN,
        gender: Gender.MALE,
      },
      {
        id: "qwerty-1234-5678-9101-zxcvbnmasdf",
        username: "royalcollegeadminGrace",
        email: "royalcollegeadminGrace@yopmail.com",
        firstName: "Grace",
        lastName: "Bello",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.MALE,
      },
      {
        id: "poiuytrewq-1234-5678-9101-mnbvcxzlkjh",
        username: "royalcollegesubadminDaniel",
        email: "royalcollegesubadminDaniel@yopmail.com",
        firstName: "Daniel",
        lastName: "King",
        password,
        role: Role.SUBSCHOOLADMIN,
        gender: Gender.FEMALE,
      },
      {
        id: "lkjhgfdsa-1234-5678-9101-asdfghjklqwe",
        username: "unilagadminOmolayo",
        email: "unilagadminOmolayo@yopmail.com",
        firstName: "Omolayo",
        lastName: "Adebayo",
        password,
        role: Role.SCHOOLADMIN,
        gender: Gender.FEMALE,
      },
      {
        id: "dgdfghj-1234-5678-9101-zxcvbnmasdfg",
        username: "unilagadminFemi",
        email: "unilagadminFemi@yopmail.com",
        firstName: "Femi",
        lastName: "Alabi",
        password,
        role: Role.SUBSCHOOLADMIN,
        gender: Gender.MALE,
      },
    ],
    skipDuplicates: true,
  });

  // ======================================================
  // SCHOOLS
  // ======================================================

  const schools = await Promise.all([
    prisma.school.create({
      data: {
        id: 0,
        name: "Impact Ville Primary School",
        type: SchoolType.PRIMARY,
        address: "Lekki Lagos",
        phoneNumber: "08011111111",
        email: "impactville@yopmail.com",
      },
    }),

    prisma.school.create({
      data: {
        id: 1,
        name: "Royal College",
        type: SchoolType.SECONDARY,
        address: "Ibadan Nigeria",
        phoneNumber: "08044444444",
        email: "royalcollege@yopmail.com",
      },
    }),

    prisma.school.create({
      data: {
        id: 2,
        name: "University of Lagos",
        type: SchoolType.TERTIARY,
        address: "Akoka Lagos",
        phoneNumber: "08066666666",
        email: "unilag@yopmail.com",
      },
    }),

    prisma.school.create({
      data: {
        id: 3,
        name: "Corona Primary School",
        type: SchoolType.PRIMARY,
        address: "Lekki Lagos",
        phoneNumber: "08066666666",
        email: "corona@yopmail.com",
      },
    }),

    prisma.school.create({
      data: {
        id: 4,
        name: "Caleb Secondary School",
        type: SchoolType.SECONDARY,
        address: "Ikeja Lagos",
        phoneNumber: "08066666666",
        email: "caleb@yopmail.com",
      },
    }),
    prisma.school.create({
      data: {
        id: 5,
        name: "University of Ibadan",
        type: SchoolType.TERTIARY,
        address: "Ibadan Nigeria",
        phoneNumber: "08066666666",
        email: "ui@yopmail.com",
      },
    }),
  ]);

  // ======================================================
  // GRADE YEARS
  // ======================================================

  const gradeYears = await Promise.all([
    prisma.gradeYear.create({ data: { level: "Primary 1" } }),
    prisma.gradeYear.create({ data: { level: "Primary 2" } }),
    prisma.gradeYear.create({ data: { level: "JSS 1" } }),
    prisma.gradeYear.create({ data: { level: "JSS 2" } }),
    prisma.gradeYear.create({ data: { level: "SS 1" } }),
    prisma.gradeYear.create({ data: { level: "SS 2" } }),
    prisma.gradeYear.create({ data: { level: "100 Level" } }),
    prisma.gradeYear.create({ data: { level: "200 Level" } }),
  ]);

  // ======================================================
  // Staff
  // ======================================================

  const staffs = [];

  for (let i = 1; i <= 6; i++) {
    const staff = await prisma.staff.create({
      data: {
        username: `teacher${i}`,
        email: `staff${i}@mail.com`,
        password,
        firstName: `Staff${i}`,
        lastName: "Smith",
        phoneNumber: `0801234567${i}`,
        position: `Position ${i}`,
        image: "https://via.placeholder.com/150",
        depertment: "Science",
        status: StaffStatus.FULLTIME,
        gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        address: "Lagos Nigeria",
        role: Role.TEACHER,
        schoolId: schools[i % schools.length].id,
      },
    });

    staffs.push(staff);
  }

  // ======================================================
  // SUBJECTS
  // ======================================================

  const subjectNames = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Basic Science",
    "Computer Science",
  ];

  const subjects = [];

  for (let i = 0; i < 6; i++) {
    const subject = await prisma.subject.create({
      data: {
        name: subjectNames[i],
        description: `${subjectNames[i]} description`,
        code: `SUB00${i + 1}`,
        staffs: {
          connect: {
            id: staffs[i].id,
          },
        },
      },
    });

    subjects.push(subject);
  }

  // ======================================================
  // CLASSES
  // ======================================================

  const classes = [];

  for (let i = 1; i <= 6; i++) {
    const classItem = await prisma.class.create({
      data: {
        name: `Class ${i}`,
        type: ClassType.SECONDARY,
        description: `Class ${i} Description`,
        population: 30 + i,
        supervisorId: staffs[i - 1].id,
        gradeYearId: gradeYears[i - 1].id,
      },
    });

    classes.push(classItem);
  }

  // ======================================================
  // GUARDIANS
  // ======================================================

  const guardians = [];

  for (let i = 1; i <= 6; i++) {
    const guardian = await prisma.guardian.create({
      data: {
        username: `guardian${i}`,
        email: `guardian${i}@mail.com`,
        firstName: `Guardian${i}`,
        lastName: "Johnson",
        phoneNumber: `0901234567${i}`,
        address: "Abuja Nigeria",
        password,
        gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        role: Role.GUARDIAN,
      },
    });

    guardians.push(guardian);
  }

  // ======================================================
  // STUDENTS
  // ======================================================

  const students = [];

  for (let i = 1; i <= 6; i++) {
    const student = await prisma.student.create({
      data: {
        username: `student${i}`,
        email: `student${i}@mail.com`,
        firstName: `Student${i}`,
        lastName: "Williams",
        password,
        address: "Lagos Nigeria",
        image: "https://via.placeholder.com/150",
        phoneNumber: `0701234567${i}`,
        gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        role: Role.STUDENT,

        classId: classes[i - 1].id,
        guardianId: guardians[i - 1].id,
        schoolId: schools[i - 1].id,
        gradeYearId: gradeYears[i - 1].id,
      },
    });

    students.push(student);
  }

  // ======================================================
  // ASSIGNMENTS
  // ======================================================

  const assignments = [];

  for (let i = 1; i <= 6; i++) {
    const assignment = await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startTime: new Date(),
        dueDate: new Date("2026-12-30"),
      },
    });

    assignments.push(assignment);
  }

  // ======================================================
  // EXAMS
  // ======================================================

  const exams = [];

  for (let i = 1; i <= 6; i++) {
    const exam = await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(),
        endTime: new Date(),

        subjects: {
          connect: [{ id: subjects[i - 1].id }],
        },
      },
    });

    exams.push(exam);
  }

  // ======================================================
  // LESSONS
  // ======================================================

  const lessons = [];

  for (let i = 1; i <= 6; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson ${i}`,
        description: `Lesson ${i} Description`,
        day: Object.values(Day)[i - 1],
        startTime: new Date(),
        endTime: new Date(),

        subjectId: subjects[i - 1].id,
        classId: classes[i - 1].id,
        staffId: staffs[i - 1].id,
        assignmentId: assignments[i - 1].id,
      },
    });

    lessons.push(lesson);
  }

  // ======================================================
  // ATTENDANCE
  // ======================================================

  for (let i = 1; i <= 6; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        status:
          i % 2 === 0 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,

        studentId: students[i - 1].id,
        lessonId: lessons[i - 1].id,
      },
    });
  }

  // ======================================================
  // RESULTS
  // ======================================================

  for (let i = 1; i <= 6; i++) {
    await prisma.result.create({
      data: {
        score: 60 + i,
        assignmentId: assignments[i - 1].id,
        examId: exams[i - 1].id,
        studentId: students[i - 1].id,
      },
    });
  }

  // ======================================================
  // FEES
  // ======================================================

  for (let i = 1; i <= 6; i++) {
    await prisma.fees.create({
      data: {
        name: `School Fees ${i}`,
        description: `Term ${i} Fees`,
        amount: 100000 + i * 5000,
        studentId: students[i - 1].id,
      },
    });
  }

  // ======================================================
  // EVENTS
  // ======================================================

  for (let i = 1; i <= 6; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `School Event ${i}`,
        date: new Date(),
        duration: "3 Hours",
        classId: classes[i - 1].id,
      },
    });
  }

  // ======================================================
  // ANNOUNCEMENTS
  // ======================================================

  for (let i = 1; i <= 6; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Announcement Description ${i}`,
        date: new Date(),
        classId: classes[i - 1].id,
      },
    });
  }

  console.log("✅ Database seeded successfully with 6 rows per table");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
