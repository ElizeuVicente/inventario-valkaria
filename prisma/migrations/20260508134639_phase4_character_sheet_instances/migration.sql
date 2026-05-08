/*
  Warnings:

  - The `status` column on the `character_sheets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `SheetAttributeOverride` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SheetEffect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SheetSessionState` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "sheet_status" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'RETIRED', 'DECEASED');

-- CreateEnum
CREATE TYPE "effect_type" AS ENUM ('CONDITION', 'BUFF', 'DEBUFF', 'INJURY', 'DEATH');

-- DropForeignKey
ALTER TABLE "SheetAttributeOverride" DROP CONSTRAINT "SheetAttributeOverride_created_by_fkey";

-- DropForeignKey
ALTER TABLE "SheetAttributeOverride" DROP CONSTRAINT "SheetAttributeOverride_sheet_id_fkey";

-- DropForeignKey
ALTER TABLE "SheetEffect" DROP CONSTRAINT "SheetEffect_applied_by_fkey";

-- DropForeignKey
ALTER TABLE "SheetEffect" DROP CONSTRAINT "SheetEffect_sheet_id_fkey";

-- DropForeignKey
ALTER TABLE "SheetSessionState" DROP CONSTRAINT "SheetSessionState_sheet_id_fkey";

-- DropForeignKey
ALTER TABLE "SheetSessionState" DROP CONSTRAINT "SheetSessionState_table_id_fkey";

-- DropForeignKey
ALTER TABLE "SheetSessionState" DROP CONSTRAINT "SheetSessionState_updated_by_fkey";

-- AlterTable
ALTER TABLE "character_sheets" ADD COLUMN     "last_calculated_at" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "sheet_status" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "SheetAttributeOverride";

-- DropTable
DROP TABLE "SheetEffect";

-- DropTable
DROP TABLE "SheetSessionState";

-- CreateTable
CREATE TABLE "sheet_attributes" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "sheet_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_skills" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "is_proficient" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sheet_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_items" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION,
    "properties" JSONB,

    CONSTRAINT "sheet_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_item_modifiers" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,
    "is_equipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sheet_item_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_classes" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sheet_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_class_features" (
    "id" TEXT NOT NULL,
    "sheet_class_id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sheet_class_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_race_traits" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "trait_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sheet_race_traits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_effects" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "effect_type" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "applied_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sheet_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_session_states" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_in_scene" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "sheet_session_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_attribute_overrides" (
    "id" TEXT NOT NULL,
    "sheet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "attribute_type" NOT NULL,
    "value" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sheet_attribute_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sheet_classes_sheet_id_class_id_key" ON "sheet_classes"("sheet_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "sheet_session_states_sheet_id_table_id_key" ON "sheet_session_states"("sheet_id", "table_id");

-- AddForeignKey
ALTER TABLE "sheet_attributes" ADD CONSTRAINT "sheet_attributes_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_attributes" ADD CONSTRAINT "sheet_attributes_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "template_attribute_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_skills" ADD CONSTRAINT "sheet_skills_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_skills" ADD CONSTRAINT "sheet_skills_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "template_skill_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_items" ADD CONSTRAINT "sheet_items_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_items" ADD CONSTRAINT "sheet_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "template_item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_item_modifiers" ADD CONSTRAINT "sheet_item_modifiers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "sheet_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_classes" ADD CONSTRAINT "sheet_classes_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_classes" ADD CONSTRAINT "sheet_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "template_class_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_class_features" ADD CONSTRAINT "sheet_class_features_sheet_class_id_fkey" FOREIGN KEY ("sheet_class_id") REFERENCES "sheet_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_class_features" ADD CONSTRAINT "sheet_class_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "template_class_features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_race_traits" ADD CONSTRAINT "sheet_race_traits_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_race_traits" ADD CONSTRAINT "sheet_race_traits_trait_id_fkey" FOREIGN KEY ("trait_id") REFERENCES "template_race_traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_effects" ADD CONSTRAINT "sheet_effects_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_effects" ADD CONSTRAINT "sheet_effects_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_session_states" ADD CONSTRAINT "sheet_session_states_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_session_states" ADD CONSTRAINT "sheet_session_states_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_session_states" ADD CONSTRAINT "sheet_session_states_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_attribute_overrides" ADD CONSTRAINT "sheet_attribute_overrides_sheet_id_fkey" FOREIGN KEY ("sheet_id") REFERENCES "character_sheets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_attribute_overrides" ADD CONSTRAINT "sheet_attribute_overrides_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
