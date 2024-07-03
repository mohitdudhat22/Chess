-- DropForeignKey
ALTER TABLE "PlayerProfile" DROP CONSTRAINT "PlayerProfile_userId_fkey";

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "currentGameWebSocket" TEXT,
ALTER COLUMN "username" DROP NOT NULL;
