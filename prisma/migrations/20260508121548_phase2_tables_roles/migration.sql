/*
  Warnings:

  - The `visibility` column on the `tables` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `TableMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TableMemberPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "table_visibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- DropForeignKey
ALTER TABLE "TableMember" DROP CONSTRAINT "TableMember_table_id_fkey";

-- DropForeignKey
ALTER TABLE "TableMember" DROP CONSTRAINT "TableMember_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TableMemberPermission" DROP CONSTRAINT "TableMemberPermission_member_id_fkey";

-- DropForeignKey
ALTER TABLE "character_sheets" DROP CONSTRAINT "character_sheets_member_id_fkey";

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "description" TEXT,
DROP COLUMN "visibility",
ADD COLUMN     "visibility" "table_visibility" NOT NULL DEFAULT 'PUBLIC';

-- DropTable
DROP TABLE "TableMember";

-- DropTable
DROP TABLE "TableMemberPermission";

-- CreateTable
CREATE TABLE "table_roles" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "table_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_role_permissions" (
    "id" TEXT NOT NULL,
    "table_role_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "table_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_members" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "table_role_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "table_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_member_permissions" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,

    CONSTRAINT "table_member_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "table_members_table_id_user_id_key" ON "table_members"("table_id", "user_id");

-- AddForeignKey
ALTER TABLE "table_roles" ADD CONSTRAINT "table_roles_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_role_permissions" ADD CONSTRAINT "table_role_permissions_table_role_id_fkey" FOREIGN KEY ("table_role_id") REFERENCES "table_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_members" ADD CONSTRAINT "table_members_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_members" ADD CONSTRAINT "table_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_members" ADD CONSTRAINT "table_members_table_role_id_fkey" FOREIGN KEY ("table_role_id") REFERENCES "table_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_member_permissions" ADD CONSTRAINT "table_member_permissions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "table_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "table_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
