import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { CreateRaceTraitDto } from './dto/create-race-trait.dto';
import { CreateRaceModifierDto } from './dto/create-race-modifier.dto';

@Injectable()
export class RaceService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createRaceDto: CreateRaceDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemRaceDefinition.create({
      data: {
        ...createRaceDto,
        systemId,
      },
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemRaceDefinition.findMany({
      where: { systemId },
      orderBy: { sortOrder: 'asc' },
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async findOne(systemId: string, id: string) {
    await this.ensureRaceExists(systemId, id);
    return this.prisma.systemRaceDefinition.findUnique({
      where: { id },
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async update(
    systemId: string,
    id: string,
    updateRaceDto: UpdateRaceDto,
  ) {
    await this.ensureRaceExists(systemId, id);
    return this.prisma.systemRaceDefinition.update({
      where: { id },
      data: updateRaceDto,
      include: {
        attributeModifiers: true,
        traits: true,
      },
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureRaceExists(systemId, id);
    return this.prisma.systemRaceDefinition.delete({
      where: { id },
    });
  }

  async addTrait(
    systemId: string,
    raceId: string,
    createTraitDto: CreateRaceTraitDto,
  ) {
    await this.ensureRaceExists(systemId, raceId);
    return this.prisma.systemRaceTrait.create({
      data: {
        ...createTraitDto,
        raceDefinitionId: raceId,
      },
    });
  }

  async removeTrait(systemId: string, raceId: string, traitId: string) {
    await this.ensureRaceExists(systemId, raceId);
    const trait = await this.prisma.systemRaceTrait.findUnique({
      where: { id: traitId },
    });
    if (!trait || trait.raceDefinitionId !== raceId) {
      throw new NotFoundException(
        `Trait with ID ${traitId} not found in race ${raceId}`,
      );
    }
    return this.prisma.systemRaceTrait.delete({
      where: { id: traitId },
    });
  }

  async addModifier(
    systemId: string,
    raceId: string,
    createModifierDto: CreateRaceModifierDto,
  ) {
    await this.ensureRaceExists(systemId, raceId);
    return this.prisma.systemRaceAttributeModifier.create({
      data: {
        ...createModifierDto,
        raceDefinitionId: raceId,
      },
    });
  }

  async removeModifier(
    systemId: string,
    raceId: string,
    modifierId: string,
  ) {
    await this.ensureRaceExists(systemId, raceId);
    const modifier = await this.prisma.systemRaceAttributeModifier.findUnique({
      where: { id: modifierId },
    });
    if (!modifier || modifier.raceDefinitionId !== raceId) {
      throw new NotFoundException(
        `Modifier with ID ${modifierId} not found in race ${raceId}`,
      );
    }
    return this.prisma.systemRaceAttributeModifier.delete({
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

  private async ensureRaceExists(systemId: string, id: string) {
    const race = await this.prisma.systemRaceDefinition.findUnique({
      where: { id },
    });
    if (!race || race.systemId !== systemId) {
      throw new NotFoundException(
        `Race with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
