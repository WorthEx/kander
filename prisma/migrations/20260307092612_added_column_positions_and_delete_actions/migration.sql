-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_workspaceId_fkey";

-- AlterTable
ALTER TABLE "columns" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
