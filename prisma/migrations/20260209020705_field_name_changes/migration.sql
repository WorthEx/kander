/*
  Warnings:

  - You are about to drop the column `name` on the `columns` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `workspaces` table. All the data in the column will be lost.
  - Added the required column `title` to the `columns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `workspaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "columns" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
