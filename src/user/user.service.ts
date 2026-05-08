import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    @Inject()
    private readonly prisma: PrismaService;

    async createUser(data: CreateUserDto): Promise<UserEntity> {
        const hashPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: { ...data, password: hashPassword }
        })
        return new UserEntity(user);
    }

    async findMany(where: Prisma.UserWhereInput): Promise<UserEntity[]> {
        const users = await this.prisma.user.findMany({
            where,
        });
        return users.map((user) => new UserEntity(user));
    }

    async findUserById(id: string): Promise<UserEntity> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        })
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return new UserEntity(user);
    }

    async findUserByEmailOrUsername(param: string): Promise<UserEntity> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: param },
                    { username: param },
                ],
            },
        })
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return new UserEntity(user);
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<UserEntity> {

        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data,
        })
        return new UserEntity(user);
    }

    async deleteUser(id: string): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        })
        return new UserEntity(user);
    }
}
