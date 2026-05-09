import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';

@Injectable()
export class ItemCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createItemCategoryDto: CreateItemCategoryDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemItemCategory.create({
      data: {
        ...createItemCategoryDto,
        systemId,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemItemCategory.findMany({
      where: { systemId },
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureItemCategoryExists(systemId, id);
    return this.prisma.systemItemCategory.delete({
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

  private async ensureItemCategoryExists(systemId: string, id: string) {
    const category = await this.prisma.systemItemCategory.findUnique({
      where: { id },
    });
    if (!category || category.systemId !== systemId) {
      throw new NotFoundException(
        `Item Category with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
