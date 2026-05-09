import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AttributeCalculatorService } from '../../common/services/attribute-calculator.service';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SetRaceDto } from './dto/set-race.dto';
import { AddClassDto } from './dto/add-class.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateItemModifierDto } from './dto/create-item-modifier.dto';
import { ToggleItemModifierDto } from './dto/toggle-item-modifier.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateEffectDto } from './dto/create-effect.dto';
import { UpdateSessionStateDto } from './dto/update-session-state.dto';
import { CreateAttributeOverrideDto } from './dto/create-attribute-override.dto';
import { SheetStatus } from '../../database/generated/prisma/enums';
import { SheetRulesValidator } from './validators/sheet-rules.validator';

@Injectable()
export class SheetService {
  constructor(
    private prisma: PrismaService,
    private attributeCalculator: AttributeCalculatorService,
  ) {}

  async create(
    tableId: string,
    userId: string,
    createSheetDto: CreateSheetDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const member = await tx.tableMember.findFirst({
        where: {
          tableId,
          userId,
        },
      });

      if (!member) {
        throw new NotFoundException(
          `User is not a member of table ${tableId}`,
        );
      }

      const template = await tx.sheetTemplate.findFirst({
        where: { tableId },
        include: {
          attributeDefinitions: true,
          skillDefinitions: true,
          system: {
            include: {
              currencyDefinitions: true,
            },
          },
        },
      });

      if (!template) {
        throw new NotFoundException(`Template for table ${tableId} not found`);
      }

      const sheet = await tx.characterSheet.create({
        data: {
          templateId: template.id,
          memberId: member.id,
          name: createSheetDto.name,
          status: createSheetDto.status || SheetStatus.DRAFT,
        },
      });

      if (template.attributeDefinitions.length > 0) {
        await tx.sheetAttribute.createMany({
          data: template.attributeDefinitions.map((attr) => ({
            sheetId: sheet.id,
            definitionId: attr.id,
            value: attr.defaultValue ?? '',
          })),
        });
      }

      if (template.skillDefinitions.length > 0) {
        await tx.sheetSkill.createMany({
          data: template.skillDefinitions.map((skill) => ({
            sheetId: sheet.id,
            definitionId: skill.id,
            value: 0,
            isProficient: false,
          })),
        });
      }

      if (template.system && template.system.currencyDefinitions.length > 0) {
        await tx.sheetCurrency.createMany({
          data: template.system.currencyDefinitions.map((currency) => ({
            sheetId: sheet.id,
            definitionId: currency.id,
            amount: 0,
          })),
        });
      }

      if (createSheetDto.raceId) {
        const race = await tx.templateRaceDefinition.findUnique({
          where: { id: createSheetDto.raceId },
          include: { traits: true },
        });

        if (race && race.templateId === template.id) {
          await tx.characterSheet.update({
            where: { id: sheet.id },
            data: { raceId: race.id },
          });

          if (race.traits.length > 0) {
            await tx.sheetRaceTrait.createMany({
              data: race.traits.map((trait) => ({
                sheetId: sheet.id,
                traitId: trait.id,
              })),
            });
          }
        }
      }

      return await tx.characterSheet.findUnique({
        where: { id: sheet.id },
        include: {
          member: {
            include: { user: true, tableRole: true },
          },
          attributes: { include: { definition: true } },
          skills: { include: { definition: true } },
          currencies: { include: { definition: true } },
          race: true,
          classes: true,
          items: { include: { modifiers: true } },
          effects: true,
          raceTraits: { include: { trait: true } },
          sessionStates: true,
          attributeOverrides: true,
        },
      });
    });
  }

  async findAll(tableId: string) {
    return await this.prisma.characterSheet.findMany({
      where: {
        template: {
          tableId,
        },
      },
      include: {
        member: {
          include: { user: true, tableRole: true },
        },
        attributes: { include: { definition: true } },
        skills: { include: { definition: true } },
        currencies: { include: { definition: true } },
        race: true,
        classes: true,
        items: { include: { modifiers: true } },
        effects: true,
        raceTraits: { include: { trait: true } },
        sessionStates: true,
        attributeOverrides: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tableId: string, sheetId: string) {
    const sheet = await this.prisma.characterSheet.findUnique({
      where: { id: sheetId },
      include: {
        member: {
          include: { user: true, tableRole: true },
        },
        attributes: { include: { definition: true } },
        skills: { include: { definition: true } },
        currencies: { include: { definition: true } },
        race: true,
        classes: true,
        items: { include: { modifiers: true } },
        effects: true,
        raceTraits: { include: { trait: true } },
        sessionStates: true,
        attributeOverrides: true,
        template: {
          include: { attributeFormulas: true },
        },
      },
    });

    if (!sheet) {
      throw new NotFoundException(`Sheet ${sheetId} not found`);
    }

    const template = await this.prisma.sheetTemplate.findUnique({
      where: { id: sheet.templateId },
    });

    if (!template || template.tableId !== tableId) {
      throw new NotFoundException(`Sheet ${sheetId} not found`);
    }

    if (sheet.template.attributeFormulas?.length > 0) {
      const baseAttributes = new Map(
        sheet.attributes.map((attr) => [attr.definition.name, attr.value]),
      );

      const activeFormulas = sheet.template.attributeFormulas.filter(
        (f) => f.isActive,
      );

      for (const attr of sheet.attributes) {
        const attrFormulas = activeFormulas.filter(
          (f) => f.targetAttr === attr.definition.name,
        );

        if (attrFormulas.length > 0) {
          const varMap = new Map<string, string | number>();
          for (const [key, value] of baseAttributes) {
            varMap.set(key.toUpperCase(), value);
          }

          let calculated: string | number = attr.value;
          for (const formula of attrFormulas.sort((a, b) => b.priority - a.priority)) {
            try {
              const vars: Record<string, string | number> = {};
              for (const [k, v] of varMap) {
                vars[k] = v;
              }
              calculated = this.attributeCalculator.evaluate(
                formula.formula,
                vars,
              );
            } catch {
              calculated = attr.value;
            }
          }

          attr.value = String(calculated);
        }
      }
    }

    return sheet;
  }

  async update(
    tableId: string,
    sheetId: string,
    updateSheetDto: UpdateSheetDto,
  ) {
    await this.findOne(tableId, sheetId);

    return await this.prisma.characterSheet.update({
      where: { id: sheetId },
      data: updateSheetDto,
      include: {
        member: {
          include: { user: true, tableRole: true },
        },
        attributes: { include: { definition: true } },
        skills: { include: { definition: true } },
        currencies: { include: { definition: true } },
        race: true,
        classes: true,
        items: { include: { modifiers: true } },
        effects: true,
        raceTraits: { include: { trait: true } },
        sessionStates: true,
        attributeOverrides: true,
      },
    });
  }

  async remove(tableId: string, sheetId: string) {
    await this.findOne(tableId, sheetId);

    return await this.prisma.characterSheet.delete({
      where: { id: sheetId },
    });
  }

  async activate(tableId: string, sheetId: string, userId: string) {
    const sheet = await this.findOne(tableId, sheetId);

    const member = await this.prisma.tableMember.findUnique({
      where: { id: sheet.memberId },
    });

    if (!member || member.userId !== userId) {
      throw new BadRequestException('Invalid sheet owner');
    }

    const existingActive = await this.prisma.characterSheet.findFirst({
      where: {
        memberId: member.id,
        status: SheetStatus.ACTIVE,
        template: {
          tableId,
        },
      },
    });

    if (existingActive) {
      throw new ConflictException(
        'Member already has an active sheet. Deactivate it first.',
      );
    }

    return await this.prisma.characterSheet.update({
      where: { id: sheetId },
      data: { status: SheetStatus.ACTIVE },
      include: {
        member: {
          include: { user: true, tableRole: true },
        },
        attributes: { include: { definition: true } },
        skills: { include: { definition: true } },
        currencies: { include: { definition: true } },
        race: true,
        classes: true,
        items: { include: { modifiers: true } },
        effects: true,
        raceTraits: { include: { trait: true } },
        sessionStates: true,
        attributeOverrides: true,
      },
    });
  }

  async updateAttributeValue(
    tableId: string,
    sheetId: string,
    attributeId: string,
    dto: UpdateAttributeValueDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const attr = await this.prisma.sheetAttribute.findUnique({
      where: { id: attributeId },
    });

    if (!attr || attr.sheetId !== sheet.id) {
      throw new NotFoundException(`Attribute ${attributeId} not found`);
    }

    const result = await this.prisma.sheetAttribute.update({
      where: { id: attributeId },
      data: { value: dto.value },
      include: { definition: true },
    });

    this.attributeCalculator.invalidateCache(sheetId);

    return result;
  }

  async updateSkill(
    tableId: string,
    sheetId: string,
    skillId: string,
    dto: UpdateSkillDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const skill = await this.prisma.sheetSkill.findUnique({
      where: { id: skillId },
    });

    if (!skill || skill.sheetId !== sheet.id) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    return await this.prisma.sheetSkill.update({
      where: { id: skillId },
      data: {
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.isProficient !== undefined && { isProficient: dto.isProficient }),
      },
      include: { definition: true },
    });
  }

  async setRace(
    tableId: string,
    sheetId: string,
    dto: SetRaceDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const race = await this.prisma.templateRaceDefinition.findUnique({
      where: { id: dto.raceId },
      include: { traits: true },
    });

    if (!race) {
      throw new NotFoundException(`Race ${dto.raceId} not found`);
    }

    const template = await this.prisma.sheetTemplate.findFirst({
      where: { tableId },
    });

    if (!template || race.templateId !== template.id) {
      throw new BadRequestException('Race does not belong to this table');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.sheetRaceTrait.deleteMany({
        where: { sheetId },
      });

      await tx.characterSheet.update({
        where: { id: sheetId },
        data: { raceId: dto.raceId },
      });

      if (race.traits.length > 0) {
        await tx.sheetRaceTrait.createMany({
          data: race.traits.map((trait) => ({
            sheetId,
            traitId: trait.id,
          })),
        });
      }

      return await tx.characterSheet.findUnique({
        where: { id: sheetId },
        include: {
          member: {
            include: { user: true, tableRole: true },
          },
          attributes: { include: { definition: true } },
          skills: { include: { definition: true } },
          currencies: { include: { definition: true } },
          race: true,
          classes: true,
          items: { include: { modifiers: true } },
          effects: true,
          raceTraits: { include: { trait: true } },
          sessionStates: true,
          attributeOverrides: true,
        },
      });
    });
  }

  async addClass(
    tableId: string,
    sheetId: string,
    dto: AddClassDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const cls = await this.prisma.templateClassDefinition.findUnique({
      where: { id: dto.classId },
      include: { features: true },
    });

    if (!cls) {
      throw new NotFoundException(`Class ${dto.classId} not found`);
    }

    const template = await this.prisma.sheetTemplate.findFirst({
      where: { tableId },
    });

    if (!template || cls.templateId !== template.id) {
      throw new BadRequestException('Class does not belong to this table');
    }

    const existingClass = await this.prisma.sheetClass.findFirst({
      where: {
        sheetId,
        classId: dto.classId,
      },
    });

    if (existingClass) {
      throw new ConflictException('Sheet already has this class');
    }

    return await this.prisma.$transaction(async (tx) => {
      const sheetClass = await tx.sheetClass.create({
        data: {
          sheetId,
          classId: dto.classId,
          level: dto.level,
        },
      });

      if (cls.features.length > 0) {
        await tx.sheetClassFeature.createMany({
          data: cls.features
            .filter((feat) => feat.levelRequired <= dto.level)
            .map((feat) => ({
              sheetClassId: sheetClass.id,
              featureId: feat.id,
            })),
        });
      }

      return sheetClass;
    });
  }

  async updateClassLevel(
    tableId: string,
    sheetId: string,
    classId: string,
    dto: UpdateClassLevelDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const sheetClass = await this.prisma.sheetClass.findUnique({
      where: { id: classId },
    });

    if (!sheetClass || sheetClass.sheetId !== sheet.id) {
      throw new NotFoundException(`Class ${classId} not found in sheet`);
    }

    return await this.prisma.sheetClass.update({
      where: { id: classId },
      data: { level: dto.level },
    });
  }

  async removeClass(tableId: string, sheetId: string, classId: string) {
    const sheet = await this.findOne(tableId, sheetId);

    const sheetClass = await this.prisma.sheetClass.findUnique({
      where: { id: classId },
    });

    if (!sheetClass || sheetClass.sheetId !== sheet.id) {
      throw new NotFoundException(`Class ${classId} not found in sheet`);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.sheetClassFeature.deleteMany({
        where: {
          sheetClassId: classId,
        },
      });

      return await tx.sheetClass.delete({
        where: { id: classId },
      });
    });
  }

  async createItem(
    tableId: string,
    sheetId: string,
    dto: CreateItemDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const category = await this.prisma.templateItemCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Item category ${dto.categoryId} not found`);
    }

    const template = await this.prisma.sheetTemplate.findFirst({
      where: { tableId },
    });

    if (!template || category.templateId !== template.id) {
      throw new BadRequestException(
        'Item category does not belong to this table',
      );
    }

    return await this.prisma.sheetItem.create({
      data: {
        sheetId,
        name: dto.name,
        categoryId: dto.categoryId,
        description: dto.description,
        quantity: dto.quantity || 1,
        weight: dto.weight,
      },
      include: { modifiers: true },
    });
  }

  async updateItem(
    tableId: string,
    sheetId: string,
    itemId: string,
    dto: UpdateItemDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const item = await this.prisma.sheetItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.sheetId !== sheet.id) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    return await this.prisma.sheetItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
      },
      include: { modifiers: true },
    });
  }

  async removeItem(tableId: string, sheetId: string, itemId: string) {
    const sheet = await this.findOne(tableId, sheetId);

    const item = await this.prisma.sheetItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.sheetId !== sheet.id) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    return await this.prisma.sheetItem.delete({
      where: { id: itemId },
    });
  }

  async addItemModifier(
    tableId: string,
    sheetId: string,
    itemId: string,
    dto: CreateItemModifierDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const item = await this.prisma.sheetItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.sheetId !== sheet.id) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    return await this.prisma.sheetItemModifier.create({
      data: {
        itemId,
        attributeName: dto.attributeName,
        modifier: dto.modifier,
        isEquipped: false,
      },
    });
  }

  async toggleItemModifier(
    tableId: string,
    sheetId: string,
    itemId: string,
    modifierId: string,
    dto: ToggleItemModifierDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const item = await this.prisma.sheetItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.sheetId !== sheet.id) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    const modifier = await this.prisma.sheetItemModifier.findUnique({
      where: { id: modifierId },
    });

    if (!modifier || modifier.itemId !== itemId) {
      throw new NotFoundException(`Modifier ${modifierId} not found`);
    }

    return await this.prisma.sheetItemModifier.update({
      where: { id: modifierId },
      data: { isEquipped: dto.isEquipped },
    });
  }

  async removeItemModifier(
    tableId: string,
    sheetId: string,
    itemId: string,
    modifierId: string,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const item = await this.prisma.sheetItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.sheetId !== sheet.id) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    const modifier = await this.prisma.sheetItemModifier.findUnique({
      where: { id: modifierId },
    });

    if (!modifier || modifier.itemId !== itemId) {
      throw new NotFoundException(`Modifier ${modifierId} not found`);
    }

    return await this.prisma.sheetItemModifier.delete({
      where: { id: modifierId },
    });
  }

  async updateCurrency(
    tableId: string,
    sheetId: string,
    currencyId: string,
    dto: UpdateCurrencyDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const currency = await this.prisma.sheetCurrency.findUnique({
      where: { id: currencyId },
    });

    if (!currency || currency.sheetId !== sheet.id) {
      throw new NotFoundException(`Currency ${currencyId} not found`);
    }

    return await this.prisma.sheetCurrency.update({
      where: { id: currencyId },
      data: { amount: dto.amount },
      include: { definition: true },
    });
  }

  async createEffect(
    tableId: string,
    sheetId: string,
    userId: string,
    dto: CreateEffectDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const member = await this.prisma.tableMember.findUnique({
      where: { id: sheet.memberId },
    });

    if (!member || member.userId !== userId) {
      throw new ForbiddenException(
        'You can only apply effects to your own character sheet',
      );
    }

    SheetRulesValidator.validateEffectDuration(dto.expiresAt);
    SheetRulesValidator.validateEffectNotDuplicate(sheet.effects, dto.name);

    return await this.prisma.sheetEffect.create({
      data: {
        sheetId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        isActive: true,
      },
    });
  }

  async toggleEffect(
    tableId: string,
    sheetId: string,
    effectId: string,
    isActive: boolean,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const effect = await this.prisma.sheetEffect.findUnique({
      where: { id: effectId },
    });

    if (!effect || effect.sheetId !== sheet.id) {
      throw new NotFoundException(`Effect ${effectId} not found`);
    }

    return await this.prisma.sheetEffect.update({
      where: { id: effectId },
      data: { isActive },
    });
  }

  async removeEffect(tableId: string, sheetId: string, effectId: string) {
    const sheet = await this.findOne(tableId, sheetId);

    const effect = await this.prisma.sheetEffect.findUnique({
      where: { id: effectId },
    });

    if (!effect || effect.sheetId !== sheet.id) {
      throw new NotFoundException(`Effect ${effectId} not found`);
    }

    return await this.prisma.sheetEffect.delete({
      where: { id: effectId },
    });
  }

  async updateSessionState(
    tableId: string,
    sheetId: string,
    userId: string,
    dto: UpdateSessionStateDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    let sessionState = await this.prisma.sheetSessionState.findFirst({
      where: {
        sheetId,
        tableId,
      },
    });

    if (!sessionState) {
      sessionState = await this.prisma.sheetSessionState.create({
        data: {
          sheetId,
          tableId,
          updatedBy: userId,
        },
      });
    }

    const newIsVisible = dto.isVisible !== undefined ? dto.isVisible : sessionState.isVisible;
    const newIsInScene = dto.isInScene !== undefined ? dto.isInScene : sessionState.isInScene;

    SheetRulesValidator.validateSessionState(newIsVisible, newIsInScene);

    return await this.prisma.sheetSessionState.update({
      where: { id: sessionState.id },
      data: {
        ...(dto.isVisible !== undefined && { isVisible: dto.isVisible }),
        ...(dto.isInScene !== undefined && { isInScene: dto.isInScene }),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  async createAttributeOverride(
    tableId: string,
    sheetId: string,
    userId: string,
    dto: CreateAttributeOverrideDto,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    return await this.prisma.sheetAttributeOverride.create({
      data: {
        sheetId,
        name: dto.name,
        label: dto.label,
        type: dto.type,
        value: dto.value,
        isVisible: dto.isVisible ?? true,
        createdBy: userId,
      },
    });
  }

  async removeAttributeOverride(
    tableId: string,
    sheetId: string,
    overrideId: string,
  ) {
    const sheet = await this.findOne(tableId, sheetId);

    const override = await this.prisma.sheetAttributeOverride.findUnique({
      where: { id: overrideId },
    });

    if (!override || override.sheetId !== sheet.id) {
      throw new NotFoundException(`Override ${overrideId} not found`);
    }

    return await this.prisma.sheetAttributeOverride.delete({
      where: { id: overrideId },
    });
  }
}
