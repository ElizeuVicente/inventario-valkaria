import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createAttributeDto: CreateAttributeDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemAttributeDefinition.create({
      data: {
        ...createAttributeDto,
        systemId,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemAttributeDefinition.findMany({
      where: { systemId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(
    systemId: string,
    id: string,
    updateAttributeDto: UpdateAttributeDto,
  ) {
    await this.ensureAttributeExists(systemId, id);
    return this.prisma.systemAttributeDefinition.update({
      where: { id },
      data: updateAttributeDto,
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureAttributeExists(systemId, id);
    return this.prisma.systemAttributeDefinition.delete({
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

  private async ensureAttributeExists(systemId: string, id: string) {
    const attribute = await this.prisma.systemAttributeDefinition.findUnique({
      where: { id },
    });
    if (!attribute || attribute.systemId !== systemId) {
      throw new NotFoundException(
        `Attribute with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
