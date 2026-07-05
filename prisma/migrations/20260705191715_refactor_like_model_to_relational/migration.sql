/*
  Warnings:

  - You are about to drop the column `targetId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Like` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,postId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Like_targetType_targetId_idx";

-- DropIndex
DROP INDEX "Like_userId_targetType_targetId_key";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "postId" TEXT;

-- DropEnum
DROP TYPE "TargetType";

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_commentId_idx" ON "Like"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_commentId_key" ON "Like"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
