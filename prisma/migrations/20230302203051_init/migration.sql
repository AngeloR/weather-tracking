/*
  Warnings:

  - The primary key for the `Temperature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Temperature` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `stationId` to the `Temperature` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Temperature" DROP CONSTRAINT "Temperature_userId_fkey";

-- AlterTable
ALTER TABLE "Temperature" DROP CONSTRAINT "Temperature_pkey",
DROP COLUMN "userId",
ADD COLUMN     "stationId" TEXT NOT NULL,
ADD CONSTRAINT "Temperature_pkey" PRIMARY KEY ("id", "stationId");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "userType" "Role" NOT NULL DEFAULT 'USER',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Temperature" ADD CONSTRAINT "Temperature_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
