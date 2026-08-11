-- CreateTable
CREATE TABLE "FeeStructureClasses" (
    "id" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeStructureClasses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeeStructureClasses_classId_idx" ON "FeeStructureClasses"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructureClasses_feeStructureId_classId_key" ON "FeeStructureClasses"("feeStructureId", "classId");

-- AddForeignKey
ALTER TABLE "FeeStructureClasses" ADD CONSTRAINT "FeeStructureClasses_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructureClasses" ADD CONSTRAINT "FeeStructureClasses_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
