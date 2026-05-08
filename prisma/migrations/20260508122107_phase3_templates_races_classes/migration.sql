/*
  Warnings:

  - You are about to drop the `SheetTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "trait_type" AS ENUM ('PASSIVE', 'ACTIVE', 'RESISTANCE', 'SENSE', 'MOVEMENT');

-- DropForeignKey
ALTER TABLE "SheetTemplate" DROP CONSTRAINT "SheetTemplate_created_by_fkey";

-- DropForeignKey
ALTER TABLE "SheetTemplate" DROP CONSTRAINT "SheetTemplate_system_id_fkey";

-- DropForeignKey
ALTER TABLE "SheetTemplate" DROP CONSTRAINT "SheetTemplate_table_id_fkey";

-- DropForeignKey
ALTER TABLE "character_sheets" DROP CONSTRAINT "character_sheets_template_id_fkey";

-- AlterTable
ALTER TABLE "character_sheets" ADD COLUMN     "race_id" TEXT;

-- DropTable
DROP TABLE "SheetTemplate";

-- CreateTable
CREATE TABLE "system_race_definitions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "system_race_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_race_attribute_modifiers" (
    "id" TEXT NOT NULL,
    "race_definition_id" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,

    CONSTRAINT "system_race_attribute_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_race_traits" (
    "id" TEXT NOT NULL,
    "race_definition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "trait_type" NOT NULL,

    CONSTRAINT "system_race_traits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_class_definitions" (
    "id" TEXT NOT NULL,
    "system_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hit_die" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "system_class_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_class_attribute_modifiers" (
    "id" TEXT NOT NULL,
    "class_definition_id" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,
    "per_level" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "system_class_attribute_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_class_features" (
    "id" TEXT NOT NULL,
    "class_definition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "trait_type" NOT NULL,
    "level_required" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "system_class_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_templates" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "system_id" TEXT,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sheet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_attribute_definitions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "attribute_type" NOT NULL,
    "default_value" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_attribute_formulas" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "target_attr" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "depends_on" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "template_attribute_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_skill_definitions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_skill_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_item_categories" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "template_item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_race_definitions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "system_race_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_race_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_race_attribute_modifiers" (
    "id" TEXT NOT NULL,
    "template_race_id" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,

    CONSTRAINT "template_race_attribute_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_race_traits" (
    "id" TEXT NOT NULL,
    "template_race_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "trait_type" NOT NULL,

    CONSTRAINT "template_race_traits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_class_definitions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "system_class_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hit_die" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "template_class_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_class_attribute_modifiers" (
    "id" TEXT NOT NULL,
    "template_class_id" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,
    "per_level" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "template_class_attribute_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_class_features" (
    "id" TEXT NOT NULL,
    "template_class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "trait_type" NOT NULL,
    "level_required" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "template_class_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sheet_templates_table_id_key" ON "sheet_templates"("table_id");

-- AddForeignKey
ALTER TABLE "system_race_definitions" ADD CONSTRAINT "system_race_definitions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_race_attribute_modifiers" ADD CONSTRAINT "system_race_attribute_modifiers_race_definition_id_fkey" FOREIGN KEY ("race_definition_id") REFERENCES "system_race_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_race_traits" ADD CONSTRAINT "system_race_traits_race_definition_id_fkey" FOREIGN KEY ("race_definition_id") REFERENCES "system_race_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_class_definitions" ADD CONSTRAINT "system_class_definitions_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_class_attribute_modifiers" ADD CONSTRAINT "system_class_attribute_modifiers_class_definition_id_fkey" FOREIGN KEY ("class_definition_id") REFERENCES "system_class_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_class_features" ADD CONSTRAINT "system_class_features_class_definition_id_fkey" FOREIGN KEY ("class_definition_id") REFERENCES "system_class_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_templates" ADD CONSTRAINT "sheet_templates_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_templates" ADD CONSTRAINT "sheet_templates_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "rpg_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_templates" ADD CONSTRAINT "sheet_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_attribute_definitions" ADD CONSTRAINT "template_attribute_definitions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_attribute_formulas" ADD CONSTRAINT "template_attribute_formulas_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_skill_definitions" ADD CONSTRAINT "template_skill_definitions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_item_categories" ADD CONSTRAINT "template_item_categories_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_race_definitions" ADD CONSTRAINT "template_race_definitions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_race_definitions" ADD CONSTRAINT "template_race_definitions_system_race_id_fkey" FOREIGN KEY ("system_race_id") REFERENCES "system_race_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_race_attribute_modifiers" ADD CONSTRAINT "template_race_attribute_modifiers_template_race_id_fkey" FOREIGN KEY ("template_race_id") REFERENCES "template_race_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_race_traits" ADD CONSTRAINT "template_race_traits_template_race_id_fkey" FOREIGN KEY ("template_race_id") REFERENCES "template_race_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_class_definitions" ADD CONSTRAINT "template_class_definitions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_class_definitions" ADD CONSTRAINT "template_class_definitions_system_class_id_fkey" FOREIGN KEY ("system_class_id") REFERENCES "system_class_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_class_attribute_modifiers" ADD CONSTRAINT "template_class_attribute_modifiers_template_class_id_fkey" FOREIGN KEY ("template_class_id") REFERENCES "template_class_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_class_features" ADD CONSTRAINT "template_class_features_template_class_id_fkey" FOREIGN KEY ("template_class_id") REFERENCES "template_class_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "template_race_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
