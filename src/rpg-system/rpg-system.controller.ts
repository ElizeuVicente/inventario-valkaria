import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RpgSystemService } from './rpg-system.service';
import { CreateRpgSystemDto } from './dto/create-rpg-system.dto';
import { UpdateRpgSystemDto } from './dto/update-rpg-system.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('rpg-system')
@ApiBearerAuth()
@Controller('rpg-system')
export class RpgSystemController {
  constructor(private readonly rpgSystemService: RpgSystemService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a new RPG System (ADMIN only)' })
  create(@Body() createRpgSystemDto: CreateRpgSystemDto, @Request() req) {
    return this.rpgSystemService.create(createRpgSystemDto, req.user.sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all RPG Systems' })
  findAll() {
    return this.rpgSystemService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a specific RPG System' })
  findOne(@Param('id') id: string) {
    return this.rpgSystemService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update an RPG System (ADMIN only)' })
  update(@Param('id') id: string, @Body() updateRpgSystemDto: UpdateRpgSystemDto) {
    return this.rpgSystemService.update(id, updateRpgSystemDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete an RPG System (ADMIN only)' })
  remove(@Param('id') id: string) {
    return this.rpgSystemService.remove(id);
  }
}
