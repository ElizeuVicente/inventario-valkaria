import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class JoinRequestService {
  constructor(private prisma: PrismaService) {}

  async requestJoin(tableId: string, userId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    const existingMember = await this.prisma.tableMember.findFirst({
      where: {
        tableId,
        userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this table');
    }

    const existingRequest = await this.prisma.joinRequest.findUnique({
      where: {
        tableId_userId: {
          tableId,
          userId,
        },
      },
    });

    if (existingRequest && existingRequest.status === 'PENDING') {
      throw new BadRequestException('You already have a pending join request');
    }

    return this.prisma.joinRequest.upsert({
      where: {
        tableId_userId: {
          tableId,
          userId,
        },
      },
      update: {
        status: 'PENDING',
      },
      create: {
        tableId,
        userId,
        status: 'PENDING',
      },
      include: {
        table: true,
        user: true,
      },
    });
  }

  async findPendingRequests(tableId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    return this.prisma.joinRequest.findMany({
      where: {
        tableId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async handleRequest(
    tableId: string,
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const request = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        table: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!request || request.tableId !== tableId) {
      throw new NotFoundException(
        `Join request with ID ${requestId} not found`,
      );
    }

    if (status === 'APPROVED') {
      const playerRole = request.table.roles.find(
        (role) => role.name === 'PLAYER',
      );

      if (!playerRole) {
        throw new BadRequestException('Table does not have a PLAYER role');
      }

      return this.prisma.$transaction(async (tx) => {
        await tx.joinRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        });

        return tx.tableMember.create({
          data: {
            tableId,
            userId: request.userId,
            tableRoleId: playerRole.id,
          },
          include: {
            user: true,
            tableRole: {
              include: {
                permissions: true,
              },
            },
          },
        });
      });
    } else {
      return this.prisma.joinRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
        include: {
          user: true,
        },
      });
    }
  }
}
