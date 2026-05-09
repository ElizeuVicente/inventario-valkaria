import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InviteService {
  constructor(private prisma: PrismaService) {}

  async createInviteToken(tableId: string, userId: string, dto: CreateInviteDto) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    const token = randomUUID();

    return this.prisma.inviteToken.create({
      data: {
        tableId,
        token,
        createdBy: userId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      include: {
        table: true,
        creator: true,
      },
    });
  }

  async joinByToken(token: string, userId: string) {
    const inviteToken = await this.prisma.inviteToken.findUnique({
      where: { token },
      include: {
        table: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!inviteToken) {
      throw new NotFoundException('Invalid or expired invite token');
    }

    if (inviteToken.expiresAt && inviteToken.expiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    const existingMember = await this.prisma.tableMember.findFirst({
      where: {
        tableId: inviteToken.tableId,
        userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this table');
    }

    const playerRole = inviteToken.table.roles.find(
      (role) => role.name === 'PLAYER',
    );

    if (!playerRole) {
      throw new BadRequestException('Table does not have a PLAYER role');
    }

    return this.prisma.tableMember.create({
      data: {
        tableId: inviteToken.tableId,
        userId,
        tableRoleId: playerRole.id,
      },
      include: {
        user: true,
        tableRole: {
          include: {
            permissions: true,
          },
        },
        table: true,
      },
    });
  }
}
