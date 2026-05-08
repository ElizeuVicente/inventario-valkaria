import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    @Inject()
    private readonly userService: UserService;

    @Inject()
    private readonly jwtService: JwtService;

    async signIn(login: LoginDto): Promise<AuthResponseDto> {
        const user = await this.userService.findUserByEmailOrUsername(login.login);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(login.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = { sub: user.id, username: user.username, name: user.name };
        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }
}
