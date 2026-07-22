-- AlterTable
ALTER TABLE "Classes" ADD COLUMN     "schoolsId" TEXT;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_schoolsId_fkey" FOREIGN KEY ("schoolsId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
