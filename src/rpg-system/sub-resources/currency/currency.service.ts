import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  async create(systemId: string, createCurrencyDto: CreateCurrencyDto) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemCurrencyDefinition.create({
      data: {
        ...createCurrencyDto,
        systemId,
      },
    });
  }

  async findAll(systemId: string) {
    await this.ensureSystemExists(systemId);
    return this.prisma.systemCurrencyDefinition.findMany({
      where: { systemId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(
    systemId: string,
    id: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ) {
    await this.ensureCurrencyExists(systemId, id);
    return this.prisma.systemCurrencyDefinition.update({
      where: { id },
      data: updateCurrencyDto,
    });
  }

  async remove(systemId: string, id: string) {
    await this.ensureCurrencyExists(systemId, id);
    return this.prisma.systemCurrencyDefinition.delete({
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

  private async ensureCurrencyExists(systemId: string, id: string) {
    const currency = await this.prisma.systemCurrencyDefinition.findUnique({
      where: { id },
    });
    if (!currency || currency.systemId !== systemId) {
      throw new NotFoundException(
        `Currency with ID ${id} not found in system ${systemId}`,
      );
    }
  }
}
