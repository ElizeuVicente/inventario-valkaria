import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { roles: { include: { role: true } } },
    });

    if (!userWithRoles) {
      throw new ForbiddenException('User not found');
    }

    const isAdmin = userWithRoles.roles.some((userRole) => userRole.role.name === 'ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('User does not have ADMIN privileges');
    }

    return true;
  }
}
