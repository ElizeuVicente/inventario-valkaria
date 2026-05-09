import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../auth/auth.guard';
import { AdminGuard } from '../../../auth/admin.guard';
import { RaceService } from './race.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { CreateRaceTraitDto } from './dto/create-race-trait.dto';
import { CreateRaceModifierDto } from './dto/create-race-modifier.dto';

@ApiBearerAuth()
@ApiTags('rpg-system')
@Controller('rpg-system/:systemId/races')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Param('systemId') systemId: string,
    @Body() createRaceDto: CreateRaceDto,
  ) {
    return this.raceService.create(systemId, createRaceDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('systemId') systemId: string) {
    return this.raceService.findAll(systemId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
  ) {
    return this.raceService.findOne(systemId, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
    @Body() updateRaceDto: UpdateRaceDto,
  ) {
    return this.raceService.update(systemId, id, updateRaceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async remove(@Param('systemId') systemId: string, @Param('id') id: string) {
    return this.raceService.remove(systemId, id);
  }

  @Post(':raceId/traits')
  @UseGuards(AuthGuard, AdminGuard)
  async addTrait(
    @Param('systemId') systemId: string,
    @Param('raceId') raceId: string,
    @Body() createTraitDto: CreateRaceTraitDto,
  ) {
    return this.raceService.addTrait(systemId, raceId, createTraitDto);
  }

  @Delete(':raceId/traits/:traitId')
  @UseGuards(AuthGuard, AdminGuard)
  async removeTrait(
    @Param('systemId') systemId: string,
    @Param('raceId') raceId: string,
    @Param('traitId') traitId: string,
  ) {
    return this.raceService.removeTrait(systemId, raceId, traitId);
  }

  @Post(':raceId/modifiers')
  @UseGuards(AuthGuard, AdminGuard)
  async addModifier(
    @Param('systemId') systemId: string,
    @Param('raceId') raceId: string,
    @Body() createModifierDto: CreateRaceModifierDto,
  ) {
    return this.raceService.addModifier(systemId, raceId, createModifierDto);
  }

  @Delete(':raceId/modifiers/:modifierId')
  @UseGuards(AuthGuard, AdminGuard)
  async removeModifier(
    @Param('systemId') systemId: string,
    @Param('raceId') raceId: string,
    @Param('modifierId') modifierId: string,
  ) {
    return this.raceService.removeModifier(systemId, raceId, modifierId);
  }
}
