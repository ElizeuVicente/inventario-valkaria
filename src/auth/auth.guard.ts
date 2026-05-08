import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY || 'SECRET',
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token not found');
    }
  }
}
