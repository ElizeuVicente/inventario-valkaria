import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateRpgSystemDto } from './dto/create-rpg-system.dto';
import { UpdateRpgSystemDto } from './dto/update-rpg-system.dto';

@Injectable()
export class RpgSystemService {
  constructor(private prisma: PrismaService) {}

  async create(createRpgSystemDto: CreateRpgSystemDto, userId: string) {
    return this.prisma.rpgSystem.create({
      data: {
        ...createRpgSystemDto,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.rpgSystem.findMany();
  }

  async findOne(id: string) {
    const system = await this.prisma.rpgSystem.findUnique({
      where: { id },
      include: {
        attributeDefinitions: true,
        skillDefinitions: true,
        currencyDefinitions: true,
        itemCategories: true,
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
        creator: true,
      },
    });
    if (!system) {
      throw new NotFoundException(`RPG System with ID ${id} not found`);
    }
    return system;
  }

  async update(id: string, updateRpgSystemDto: UpdateRpgSystemDto) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.rpgSystem.update({
      where: { id },
      data: updateRpgSystemDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.rpgSystem.delete({
      where: { id },
    });
  }
}
