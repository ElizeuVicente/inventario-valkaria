import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableVisibility } from '../database/generated/prisma/enums';
import { TemplateService } from './template/template.service';

@Injectable()
export class TableService {
  constructor(
    private prisma: PrismaService,
    private templateService: TemplateService,
  ) {}

  async create(createTableDto: CreateTableDto, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const table = await tx.table.create({
        data: {
          ...createTableDto,
          ownerId: userId,
        },
        include: {
          roles: true,
          members: true,
        },
      });

      const masterRole = await tx.tableRole.create({
        data: {
          tableId: table.id,
          name: 'MASTER',
          isDefault: false,
        },
      });

      await tx.tableRole.create({
        data: {
          tableId: table.id,
          name: 'PLAYER',
          isDefault: true,
        },
      });

      await tx.tableRolePermission.createMany({
        data: [
          { tableRoleId: masterRole.id, permission: 'table.manage' },
          { tableRoleId: masterRole.id, permission: 'table.invite' },
          { tableRoleId: masterRole.id, permission: 'member.kick' },
        ],
      });

      await tx.tableMember.create({
        data: {
          tableId: table.id,
          userId,
          tableRoleId: masterRole.id,
        },
      });

      if (createTableDto.systemId) {
        await this.templateService.cloneSystemToTemplate(
          tx,
          table.id,
          createTableDto.systemId,
          userId,
        );
      }

      return await tx.table.findUnique({
        where: { id: table.id },
        include: {
          roles: {
            include: {
              permissions: true,
              members: true,
            },
          },
          members: {
            include: {
              user: true,
              tableRole: true,
            },
          },
          owner: true,
        },
      });
    });
  }

  async findAll(userId: string) {
    return this.prisma.table.findMany({
      where: {
        OR: [
          { visibility: TableVisibility.PUBLIC },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: true,
        system: true,
        members: {
          include: {
            user: true,
            tableRole: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        owner: true,
        system: true,
        roles: {
          include: {
            permissions: true,
          },
        },
        members: {
          include: {
            user: true,
            tableRole: true,
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    if (
      table.visibility !== TableVisibility.PUBLIC &&
      userId &&
      !table.members.some((m) => m.userId === userId)
    ) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    await this.findOne(id);

    return this.prisma.table.update({
      where: { id },
      data: updateTableDto,
      include: {
        owner: true,
        system: true,
        roles: {
          include: {
            permissions: true,
          },
        },
        members: {
          include: {
            user: true,
            tableRole: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.table.delete({
      where: { id },
    });
  }

  async getMembers(id: string) {
    await this.findOne(id);

    return this.prisma.tableMember.findMany({
      where: { tableId: id },
      include: {
        user: true,
        tableRole: {
          include: {
            permissions: true,
          },
        },
        permissions: true,
      },
    });
  }

  async removeMember(tableId: string, memberId: string) {
    const member = await this.prisma.tableMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.tableId !== tableId) {
      throw new NotFoundException(
        `Member with ID ${memberId} not found in table ${tableId}`,
      );
    }

    const isMaster = await this.prisma.tableRole.findFirst({
      where: {
        id: member.tableRoleId,
        name: 'MASTER',
      },
    });

    if (isMaster) {
      const otherMasters = await this.prisma.tableMember.count({
        where: {
          tableId,
          tableRole: {
            name: 'MASTER',
          },
          id: { not: memberId },
        },
      });

      if (otherMasters === 0) {
        throw new BadRequestException(
          'Cannot remove the only MASTER from the table',
        );
      }
    }

    return this.prisma.tableMember.delete({
      where: { id: memberId },
      include: {
        user: true,
        tableRole: true,
      },
    });
  }
}
