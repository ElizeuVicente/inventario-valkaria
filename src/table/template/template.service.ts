import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTemplateAttributeDto } from './dto/create-template-attribute.dto';
import { UpdateTemplateAttributeDto } from './dto/update-template-attribute.dto';
import { CreateTemplateSkillDto } from './dto/create-template-skill.dto';
import { UpdateTemplateSkillDto } from './dto/update-template-skill.dto';
import { CreateTemplateItemCategoryDto } from './dto/create-template-item-category.dto';
import { CreateTemplateRaceDto } from './dto/create-template-race.dto';
import { UpdateTemplateRaceDto } from './dto/update-template-race.dto';
import { CreateTemplateRaceTraitDto } from './dto/create-template-race-trait.dto';
import { CreateTemplateRaceModifierDto } from './dto/create-template-race-modifier.dto';
import { CreateTemplateClassDto } from './dto/create-template-class.dto';
import { UpdateTemplateClassDto } from './dto/update-template-class.dto';
import { CreateTemplateClassFeatureDto } from './dto/create-template-class-feature.dto';
import { CreateTemplateClassModifierDto } from './dto/create-template-class-modifier.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async cloneSystemToTemplate(
    tx: any,
    tableId: string,
    systemId: string,
    createdBy: string,
  ) {
    const system = await tx.rpgSystem.findUnique({
      where: { id: systemId },
      include: {
        attributeDefinitions: true,
        skillDefinitions: true,
        itemCategories: true,
        currencyDefinitions: true,
        raceDefinitions: {
          include: {
            attributeModifiers: true,
            traits: true,
          },
        },
        classDefinitions: {
          include: {
            attributeModifiers: true,
            features: true,
          },
        },
      },
    });

    if (!system) {
      throw new NotFoundException(`RpgSystem with ID ${systemId} not found`);
    }

    const template = await tx.sheetTemplate.create({
      data: {
        tableId,
        systemId,
        name: system.name,
        createdBy,
      },
    });

    if (system.attributeDefinitions.length > 0) {
      await tx.templateAttributeDefinition.createMany({
        data: system.attributeDefinitions.map((attr) => ({
          templateId: template.id,
          name: attr.name,
          label: attr.label,
          type: attr.type,
          defaultValue: attr.defaultValue,
          sortOrder: attr.sortOrder,
        })),
      });
    }

    if (system.skillDefinitions.length > 0) {
      await tx.templateSkillDefinition.createMany({
        data: system.skillDefinitions.map((skill) => ({
          templateId: template.id,
          name: skill.name,
          label: skill.label,
          sortOrder: skill.sortOrder,
        })),
      });
    }

    if (system.itemCategories.length > 0) {
      await tx.templateItemCategory.createMany({
        data: system.itemCategories.map((cat) => ({
          templateId: template.id,
          name: cat.name,
        })),
      });
    }

    for (const race of system.raceDefinitions) {
      const templateRace = await tx.templateRaceDefinition.create({
        data: {
          templateId: template.id,
          systemRaceId: race.id,
          name: race.name,
          description: race.description,
          sortOrder: race.sortOrder,
        },
      });

      if (race.attributeModifiers.length > 0) {
        await tx.templateRaceAttributeModifier.createMany({
          data: race.attributeModifiers.map((mod) => ({
            templateRaceId: templateRace.id,
            attributeName: mod.attributeName,
            modifier: mod.modifier,
          })),
        });
      }

      if (race.traits.length > 0) {
        await tx.templateRaceTrait.createMany({
          data: race.traits.map((trait) => ({
            templateRaceId: templateRace.id,
            name: trait.name,
            description: trait.description,
            type: trait.type,
          })),
        });
      }
    }

    for (const cls of system.classDefinitions) {
      const templateClass = await tx.templateClassDefinition.create({
        data: {
          templateId: template.id,
          systemClassId: cls.id,
          name: cls.name,
          description: cls.description,
          hitDie: cls.hitDie,
          sortOrder: cls.sortOrder,
        },
      });

      if (cls.attributeModifiers.length > 0) {
        await tx.templateClassAttributeModifier.createMany({
          data: cls.attributeModifiers.map((mod) => ({
            templateClassId: templateClass.id,
            attributeName: mod.attributeName,
            modifier: mod.modifier,
            perLevel: mod.perLevel,
          })),
        });
      }

      if (cls.features.length > 0) {
        await tx.templateClassFeature.createMany({
          data: cls.features.map((feat) => ({
            templateClassId: templateClass.id,
            name: feat.name,
            description: feat.description,
            type: feat.type,
            levelRequired: feat.levelRequired,
          })),
        });
      }
    }

    return template;
  }

  async findByTableId(tableId: string) {
    const template = await this.prisma.sheetTemplate.findFirst({
      where: { tableId },
      include: {
        attributeDefinitions: { orderBy: { sortOrder: 'asc' } },
        skillDefinitions: { orderBy: { sortOrder: 'asc' } },
        itemCategories: true,
        raceDefinitions: {
          include: {
            attributeModifiers: true,
            traits: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        classDefinitions: {
          include: {
            attributeModifiers: true,
            features: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        creator: true,
      },
    });

    if (!template) {
      throw new NotFoundException(`Template for table ${tableId} not found`);
    }

    return template;
  }

  async createAttribute(
    tableId: string,
    dto: CreateTemplateAttributeDto,
  ) {
    const template = await this.findByTableId(tableId);

    return this.prisma.templateAttributeDefinition.create({
      data: {
        templateId: template.id,
        ...dto,
      },
    });
  }

  async updateAttribute(
    tableId: string,
    attributeId: string,
    dto: UpdateTemplateAttributeDto,
  ) {
    const template = await this.findByTableId(tableId);

    const attr = await this.prisma.templateAttributeDefinition.findUnique({
      where: { id: attributeId },
    });

    if (!attr || attr.templateId !== template.id) {
      throw new NotFoundException(`Attribute ${attributeId} not found`);
    }

    return this.prisma.templateAttributeDefinition.update({
      where: { id: attributeId },
      data: dto,
    });
  }

  async deleteAttribute(tableId: string, attributeId: string) {
    const template = await this.findByTableId(tableId);

    const attr = await this.prisma.templateAttributeDefinition.findUnique({
      where: { id: attributeId },
    });

    if (!attr || attr.templateId !== template.id) {
      throw new NotFoundException(`Attribute ${attributeId} not found`);
    }

    return this.prisma.templateAttributeDefinition.delete({
      where: { id: attributeId },
    });
  }

  async createSkill(tableId: string, dto: CreateTemplateSkillDto) {
    const template = await this.findByTableId(tableId);

    return this.prisma.templateSkillDefinition.create({
      data: {
        templateId: template.id,
        ...dto,
      },
    });
  }

  async updateSkill(
    tableId: string,
    skillId: string,
    dto: UpdateTemplateSkillDto,
  ) {
    const template = await this.findByTableId(tableId);

    const skill = await this.prisma.templateSkillDefinition.findUnique({
      where: { id: skillId },
    });

    if (!skill || skill.templateId !== template.id) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    return this.prisma.templateSkillDefinition.update({
      where: { id: skillId },
      data: dto,
    });
  }

  async deleteSkill(tableId: string, skillId: string) {
    const template = await this.findByTableId(tableId);

    const skill = await this.prisma.templateSkillDefinition.findUnique({
      where: { id: skillId },
    });

    if (!skill || skill.templateId !== template.id) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    return this.prisma.templateSkillDefinition.delete({
      where: { id: skillId },
    });
  }

  async createItemCategory(
    tableId: string,
    dto: CreateTemplateItemCategoryDto,
  ) {
    const template = await this.findByTableId(tableId);

    return this.prisma.templateItemCategory.create({
      data: {
        templateId: template.id,
        ...dto,
      },
    });
  }

  async deleteItemCategory(tableId: string, categoryId: string) {
    const template = await this.findByTableId(tableId);

    const cat = await this.prisma.templateItemCategory.findUnique({
      where: { id: categoryId },
    });

    if (!cat || cat.templateId !== template.id) {
      throw new NotFoundException(`Item category ${categoryId} not found`);
    }

    return this.prisma.templateItemCategory.delete({
      where: { id: categoryId },
    });
  }

  async createRace(tableId: string, dto: CreateTemplateRaceDto) {
    const template = await this.findByTableId(tableId);

    return this.prisma.templateRaceDefinition.create({
      data: {
        templateId: template.id,
        ...dto,
      },
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async updateRace(
    tableId: string,
    raceId: string,
    dto: UpdateTemplateRaceDto,
  ) {
    const template = await this.findByTableId(tableId);

    const race = await this.prisma.templateRaceDefinition.findUnique({
      where: { id: raceId },
    });

    if (!race || race.templateId !== template.id) {
      throw new NotFoundException(`Race ${raceId} not found`);
    }

    return this.prisma.templateRaceDefinition.update({
      where: { id: raceId },
      data: dto,
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async deleteRace(tableId: string, raceId: string) {
    const template = await this.findByTableId(tableId);

    const race = await this.prisma.templateRaceDefinition.findUnique({
      where: { id: raceId },
    });

    if (!race || race.templateId !== template.id) {
      throw new NotFoundException(`Race ${raceId} not found`);
    }

    return this.prisma.templateRaceDefinition.delete({
      where: { id: raceId },
    });
  }

  async addRaceTrait(
    tableId: string,
    raceId: string,
    dto: CreateTemplateRaceTraitDto,
  ) {
    const template = await this.findByTableId(tableId);

    const race = await this.prisma.templateRaceDefinition.findUnique({
      where: { id: raceId },
    });

    if (!race || race.templateId !== template.id) {
      throw new NotFoundException(`Race ${raceId} not found`);
    }

    return this.prisma.templateRaceTrait.create({
      data: {
        templateRaceId: raceId,
        ...dto,
      },
    });
  }

  async removeRaceTrait(
    tableId: string,
    raceId: string,
    traitId: string,
  ) {
    const template = await this.findByTableId(tableId);

    const trait = await this.prisma.templateRaceTrait.findUnique({
      where: { id: traitId },
    });

    if (!trait || trait.templateRaceId !== raceId) {
      throw new NotFoundException(`Trait ${traitId} not found`);
    }

    return this.prisma.templateRaceTrait.delete({
      where: { id: traitId },
    });
  }

  async addRaceModifier(
    tableId: string,
    raceId: string,
    dto: CreateTemplateRaceModifierDto,
  ) {
    const template = await this.findByTableId(tableId);

    const race = await this.prisma.templateRaceDefinition.findUnique({
      where: { id: raceId },
    });

    if (!race || race.templateId !== template.id) {
      throw new NotFoundException(`Race ${raceId} not found`);
    }

    return this.prisma.templateRaceAttributeModifier.create({
      data: {
        templateRaceId: raceId,
        ...dto,
      },
    });
  }

  async removeRaceModifier(
    tableId: string,
    raceId: string,
    modifierId: string,
  ) {
    const template = await this.findByTableId(tableId);

    const mod = await this.prisma.templateRaceAttributeModifier.findUnique({
      where: { id: modifierId },
    });

    if (!mod || mod.templateRaceId !== raceId) {
      throw new NotFoundException(`Modifier ${modifierId} not found`);
    }

    return this.prisma.templateRaceAttributeModifier.delete({
      where: { id: modifierId },
    });
  }

  async createClass(tableId: string, dto: CreateTemplateClassDto) {
    const template = await this.findByTableId(tableId);

    return this.prisma.templateClassDefinition.create({
      data: {
        templateId: template.id,
        ...dto,
      },
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async updateClass(
    tableId: string,
    classId: string,
    dto: UpdateTemplateClassDto,
  ) {
    const template = await this.findByTableId(tableId);

    const cls = await this.prisma.templateClassDefinition.findUnique({
      where: { id: classId },
    });

    if (!cls || cls.templateId !== template.id) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    return this.prisma.templateClassDefinition.update({
      where: { id: classId },
      data: dto,
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async deleteClass(tableId: string, classId: string) {
    const template = await this.findByTableId(tableId);

    const cls = await this.prisma.templateClassDefinition.findUnique({
      where: { id: classId },
    });

    if (!cls || cls.templateId !== template.id) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    return this.prisma.templateClassDefinition.delete({
      where: { id: classId },
    });
  }

  async addClassFeature(
    tableId: string,
    classId: string,
    dto: CreateTemplateClassFeatureDto,
  ) {
    const template = await this.findByTableId(tableId);

    const cls = await this.prisma.templateClassDefinition.findUnique({
      where: { id: classId },
    });

    if (!cls || cls.templateId !== template.id) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    return this.prisma.templateClassFeature.create({
      data: {
        templateClassId: classId,
        ...dto,
      },
    });
  }

  async removeClassFeature(
    tableId: string,
    classId: string,
    featureId: string,
  ) {
    const template = await this.findByTableId(tableId);

    const feat = await this.prisma.templateClassFeature.findUnique({
      where: { id: featureId },
    });

    if (!feat || feat.templateClassId !== classId) {
      throw new NotFoundException(`Feature ${featureId} not found`);
    }

    return this.prisma.templateClassFeature.delete({
      where: { id: featureId },
    });
  }

  async addClassModifier(
    tableId: string,
    classId: string,
    dto: CreateTemplateClassModifierDto,
  ) {
    const template = await this.findByTableId(tableId);

    const cls = await this.prisma.templateClassDefinition.findUnique({
      where: { id: classId },
    });

    if (!cls || cls.templateId !== template.id) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    return this.prisma.templateClassAttributeModifier.create({
      data: {
        templateClassId: classId,
        ...dto,
      },
    });
  }

  async removeClassModifier(
    tableId: string,
    classId: string,
    modifierId: string,
  ) {
    const template = await this.findByTableId(tableId);

    const mod = await this.prisma.templateClassAttributeModifier.findUnique({
      where: { id: modifierId },
    });

    if (!mod || mod.templateClassId !== classId) {
      throw new NotFoundException(`Modifier ${modifierId} not found`);
    }

    return this.prisma.templateClassAttributeModifier.delete({
      where: { id: modifierId },
    });
  }
}
