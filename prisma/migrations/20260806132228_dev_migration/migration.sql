-- AlterTable
ALTER TABLE "Terms" ADD COLUMN     "schoolId" TEXT;

-- CreateIndex
CREATE INDEX "Terms_schoolId_status_idx" ON "Terms"("schoolId", "status");

-- AddForeignKey
ALTER TABLE "Terms" ADD CONSTRAINT "Terms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
