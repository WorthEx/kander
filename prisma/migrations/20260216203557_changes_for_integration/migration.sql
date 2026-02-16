/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('manual', 'api');

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_creatorId_fkey";

-- AlterTable
ALTER TABLE "columns" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderSource" "OrderSource" NOT NULL DEFAULT 'manual',
ALTER COLUMN "priority" SET DEFAULT 'medium',
ALTER COLUMN "creatorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "apiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_apiKey_key" ON "workspaces"("apiKey");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
