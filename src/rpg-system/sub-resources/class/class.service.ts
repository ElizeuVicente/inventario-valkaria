import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassFeatureDto } from './dto/create-class-feature.dto';
import { CreateClassModifierDto } from './dto/create-class-modifier.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createClassDto: CreateClassDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemClassDefinition.create({
      data: {
        ...createClassDto,
        systemId,
      },
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemClassDefinition.findMany({
      where: { systemId },
      orderBy: { sortOrder: 'asc' },
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async findOne(systemId: string, id: string) {
    await this.ensureClassExists(systemId, id);
    return this.prisma.systemClassDefinition.findUnique({
      where: { id },
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async update(
    systemId: string,
    id: string,
    updateClassDto: UpdateClassDto,
  ) {
    await this.ensureClassExists(systemId, id);
    return this.prisma.systemClassDefinition.update({
      where: { id },
      data: updateClassDto,
      include: {
        attributeModifiers: true,
        features: true,
      },
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureClassExists(systemId, id);
    return this.prisma.systemClassDefinition.delete({
      where: { id },
    });
  }

  async addFeature(
    systemId: string,
    classId: string,
    createFeatureDto: CreateClassFeatureDto,
  ) {
    await this.ensureClassExists(systemId, classId);
    return this.prisma.systemClassFeature.create({
      data: {
        ...createFeatureDto,
        classDefinitionId: classId,
      },
    });
  }

  async removeFeature(systemId: string, classId: string, featureId: string) {
    await this.ensureClassExists(systemId, classId);
    const feature = await this.prisma.systemClassFeature.findUnique({
      where: { id: featureId },
    });
    if (!feature || feature.classDefinitionId !== classId) {
      throw new NotFoundException(
        `Feature with ID ${featureId} not found in class ${classId}`,
      );
    }
    return this.prisma.systemClassFeature.delete({
      where: { id: featureId },
    });
  }

  async addModifier(
    systemId: string,
    classId: string,
    createModifierDto: CreateClassModifierDto,
  ) {
    await this.ensureClassExists(systemId, classId);
    return this.prisma.systemClassAttributeModifier.create({
      data: {
        ...createModifierDto,
        classDefinitionId: classId,
      },
    });
  }

  async removeModifier(
    systemId: string,
    classId: string,
    modifierId: string,
  ) {
    await this.ensureClassExists(systemId, classId);
    const modifier = await this.prisma.systemClassAttributeModifier.findUnique({
      where: { id: modifierId },
    });
    if (!modifier || modifier.classDefinitionId !== classId) {
      throw new NotFoundException(
        `Modifier with ID ${modifierId} not found in class ${classId}`,
      );
    }
    return this.prisma.systemClassAttributeModifier.delete({
      where: { id: modifierId },
    });
  }

  private async ensureSystemExists(systemId: string) {
    const system = await this.prisma.rpgSystem.findUnique({
      where: { id: systemId },
    });
    if (!system) {
      throw new NotFoundException(`RPG System with ID ${systemId} not found`);
    }
  }

  private async ensureClassExists(systemId: string, id: string) {
    const cls = await this.prisma.systemClassDefinition.findUnique({
      where: { id },
    });
    if (!cls || cls.systemId !== systemId) {
      throw new NotFoundException(
        `Class with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
