-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "locationNormalized" TEXT NOT NULL,
    "locationDisplay" TEXT NOT NULL,
    "phoneDigits" TEXT NOT NULL,
    "phoneDisplay" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "lastDonationDate" TIMESTAMP(3),
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donor_bloodGroup_idx" ON "Donor"("bloodGroup");

-- CreateIndex
CREATE INDEX "Donor_locationNormalized_idx" ON "Donor"("locationNormalized");

-- CreateIndex
CREATE INDEX "Donor_phoneDigits_idx" ON "Donor"("phoneDigits");

-- CreateIndex
CREATE INDEX "Donor_isAvailable_idx" ON "Donor"("isAvailable");

-- CreateIndex
CREATE INDEX "Donor_bloodGroup_locationNormalized_isAvailable_idx" ON "Donor"("bloodGroup", "locationNormalized", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_phoneDigits_bloodGroup_locationNormalized_key" ON "Donor"("phoneDigits", "bloodGroup", "locationNormalized");
