/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PlayerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentGame" TEXT,
ADD COLUMN     "gameHistory" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
