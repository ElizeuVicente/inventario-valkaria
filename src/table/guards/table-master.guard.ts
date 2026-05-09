import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class TableMasterGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const tableId = request.params?.id || request.params?.tableId;

    if (!userId || !tableId) {
      throw new ForbiddenException('Missing user or table ID');
    }

    const member = await this.prisma.tableMember.findFirst({
      where: {
        tableId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this table');
    }

    const hasMasterPermission =
      await this.permissionService.memberHasPermission(
        member.id,
        'table.manage',
      );

    if (!hasMasterPermission) {
      throw new ForbiddenException(
        'You do not have permission to manage this table',
      );
    }

    return true;
  }
}
