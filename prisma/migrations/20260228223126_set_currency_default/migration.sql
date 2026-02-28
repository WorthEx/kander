/*
  Warnings:

  - You are about to drop the column `defaultCurrency` on the `workspaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "defaultCurrency",
ADD COLUMN     "currency" TEXT DEFAULT 'USD';
