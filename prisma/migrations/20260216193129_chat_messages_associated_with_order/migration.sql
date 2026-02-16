/*
  Warnings:

  - You are about to drop the column `chatId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the `order_chats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orderId` to the `chat_messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "order_chats" DROP CONSTRAINT "order_chats_orderId_fkey";

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "chatId",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- DropTable
DROP TABLE "order_chats";

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
