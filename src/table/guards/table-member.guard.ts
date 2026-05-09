import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class TableMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

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
      throw new ForbiddenException('You are not a member of this table');
    }

    return true;
  }
}
