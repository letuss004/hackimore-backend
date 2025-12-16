/*
  Warnings:

  - Added the required column `reward` to the `Redemption` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('Pending', 'Archived', 'Rejected');

-- AlterTable
ALTER TABLE "Redemption" ADD COLUMN     "reward" TEXT NOT NULL,
ADD COLUMN     "status" "RedemptionStatus" NOT NULL DEFAULT 'Pending';
