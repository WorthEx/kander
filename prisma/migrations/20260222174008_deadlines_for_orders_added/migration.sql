/*
  Warnings:

  - Added the required column `deadline` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deadline" DATE NOT NULL;
