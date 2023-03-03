-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userType" "Role" NOT NULL DEFAULT 'USER',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temperature" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "takenDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Temperature_pkey" PRIMARY KEY ("id","userId")
);

-- AddForeignKey
ALTER TABLE "Temperature" ADD CONSTRAINT "Temperature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
