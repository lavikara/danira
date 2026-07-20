-- DropIndex
DROP INDEX "Subjects_name_key";

-- AlterTable
ALTER TABLE "Schools" ADD COLUMN     "regNumber" TEXT;

-- AlterTable
ALTER TABLE "Staffs" ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "studentId" TEXT;
