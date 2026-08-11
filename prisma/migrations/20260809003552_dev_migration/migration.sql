-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "boardingHousesId" TEXT;

-- CreateTable
CREATE TABLE "BoardingHouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardingHouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardingHouseMatrons" (
    "id" TEXT NOT NULL,
    "boardingHouseId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardingHouseMatrons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardingHouses_schoolId_name_key" ON "BoardingHouses"("schoolId", "name");

-- CreateIndex
CREATE INDEX "BoardingHouseMatrons_staffId_idx" ON "BoardingHouseMatrons"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardingHouseMatrons_boardingHouseId_staffId_key" ON "BoardingHouseMatrons"("boardingHouseId", "staffId");

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_boardingHousesId_fkey" FOREIGN KEY ("boardingHousesId") REFERENCES "BoardingHouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardingHouses" ADD CONSTRAINT "BoardingHouses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardingHouseMatrons" ADD CONSTRAINT "BoardingHouseMatrons_boardingHouseId_fkey" FOREIGN KEY ("boardingHouseId") REFERENCES "BoardingHouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardingHouseMatrons" ADD CONSTRAINT "BoardingHouseMatrons_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
