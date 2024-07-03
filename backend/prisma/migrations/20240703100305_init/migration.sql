/*
  Warnings:

  - You are about to drop the column `currentGameWebSocket` on the `PlayerProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN "currentGameWebSocket";

-- CreateTable
CREATE TABLE "ActiveSession" (
    "id" SERIAL NOT NULL,
    "playerId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveSession_pkey" PRIMARY KEY ("id")
);
