import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createSkillDto: CreateSkillDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemSkillDefinition.create({
      data: {
        ...createSkillDto,
        systemId,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemSkillDefinition.findMany({
      where: { systemId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(
    systemId: string,
    id: string,
    updateSkillDto: UpdateSkillDto,
  ) {
    await this.ensureSkillExists(systemId, id);
    return this.prisma.systemSkillDefinition.update({
      where: { id },
      data: updateSkillDto,
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureSkillExists(systemId, id);
    return this.prisma.systemSkillDefinition.delete({
      where: { id },
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

  private async ensureSkillExists(systemId: string, id: string) {
    const skill = await this.prisma.systemSkillDefinition.findUnique({
      where: { id },
    });
    if (!skill || skill.systemId !== systemId) {
      throw new NotFoundException(
        `Skill with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
