import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { Prisma } from 'src/database/generated/prisma/client';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {

    @Inject()
    private readonly userService: UserService;

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new user' })
    async createUser(@Body() body: CreateUserDto): Promise<UserEntity> {
        return this.userService.createUser(body);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find many users' })
    @UseGuards(AuthGuard)
    async findMany(@Query() query: Prisma.UserWhereInput): Promise<UserEntity[]> {
        return this.userService.findMany(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find user by id' })
    @UseGuards(AuthGuard)
    async findUserById(@Param('id') id: string): Promise<UserEntity> {
        return this.userService.findUserById(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update user' })
    @UseGuards(AuthGuard)
    async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<UserEntity> {
        return this.userService.updateUser(id, body);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete user' })
    @UseGuards(AuthGuard)
    async deleteUser(@Param('id') id: string): Promise<UserEntity> {
        return this.userService.deleteUser(id);
    }
}
