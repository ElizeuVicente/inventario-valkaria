import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { Prisma } from 'src/database/generated/prisma/client';
import { UserService } from './user.service';
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {

    @Inject()
    private readonly userService: UserService;

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register new user',
        description: 'Create a new user account with email, username, and password',
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: UserEntity,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input or user already exists',
    })
    async createUser(@Body() body: CreateUserDto): Promise<UserEntity> {
        return this.userService.createUser(body);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('access_token')
    @ApiOperation({ summary: 'List users (admin only)' })
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
