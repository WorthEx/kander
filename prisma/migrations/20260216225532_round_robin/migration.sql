/*
  Warnings:

  - You are about to drop the column `orderSource` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "orderSource",
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "lastAssignedManagerId" TEXT;
