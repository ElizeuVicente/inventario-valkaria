import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class SheetOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { tableId, sheetId } = request.params;
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const sheet = await this.prisma.characterSheet.findUnique({
      where: { id: sheetId },
      include: {
        member: true,
        template: true,
      },
    });

    if (!sheet || sheet.template.tableId !== tableId) {
      throw new NotFoundException(`Sheet ${sheetId} not found`);
    }

    if (sheet.member.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this sheet',
      );
    }

    return true;
  }
}
