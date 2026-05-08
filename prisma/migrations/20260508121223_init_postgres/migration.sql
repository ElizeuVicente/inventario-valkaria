-- CreateEnum
CREATE TYPE "attribute_type" AS ENUM ('NUMBER', 'TEXT', 'BOOLEAN', 'MODIFIER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "rpg_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "rpg_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_attribute_definitions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "attribute_type" NOT NULL,
    "default_value" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "system_attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_skill_definitions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "system_skill_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_currency_definitions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "system_currency_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_item_categories" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "system_item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "system_id" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableMember" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "TableMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableMemberPermission" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "TableMemberPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetTemplate" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "system_id" TEXT,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "SheetTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_sheets" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetEffect" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "applied_by" TEXT,

    CONSTRAINT "SheetEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetSessionState" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "SheetSessionState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_currencies" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sheet_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetAttributeOverride" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "SheetAttributeOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SheetTemplate_table_id_key" ON "SheetTemplate"("table_id");

-- CreateIndex
CREATE UNIQUE INDEX "sheet_currencies_sheet_id_definition_id_key" ON "sheet_currencies"("sheet_id", "definition_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rpg_systems" ADD CONSTRAINT "rpg_systems_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_attribute_definitions" ADD CONSTRAINT "system_attribute_definitions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_skill_definitions" ADD CONSTRAINT "system_skill_definitions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_currency_definitions" ADD CONSTRAINT "system_currency_definitions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_item_categories" ADD CONSTRAINT "system_item_categories_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableMember" ADD CONSTRAINT "TableMember_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableMember" ADD CONSTRAINT "TableMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableMemberPermission" ADD CONSTRAINT "TableMemberPermission_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "TableMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplate" ADD CONSTRAINT "SheetTemplate_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplate" ADD CONSTRAINT "SheetTemplate_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetTemplate" ADD CONSTRAINT "SheetTemplate_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "TableMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "SheetTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetEffect" ADD CONSTRAINT "SheetEffect_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetEffect" ADD CONSTRAINT "SheetEffect_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSessionState" ADD CONSTRAINT "SheetSessionState_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSessionState" ADD CONSTRAINT "SheetSessionState_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSessionState" ADD CONSTRAINT "SheetSessionState_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_currencies" ADD CONSTRAINT "sheet_currencies_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_currencies" ADD CONSTRAINT "sheet_currencies_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "system_currency_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetAttributeOverride" ADD CONSTRAINT "SheetAttributeOverride_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetAttributeOverride" ADD CONSTRAINT "SheetAttributeOverride_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
