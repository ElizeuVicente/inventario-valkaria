import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { TableMasterGuard } from '../guards/table-master.guard';
import { TableMemberGuard } from '../guards/table-member.guard';
import { TemplateService } from './template.service';
import { CreateTemplateAttributeDto } from './dto/create-template-attribute.dto';
import { UpdateTemplateAttributeDto } from './dto/update-template-attribute.dto';
import { CreateTemplateSkillDto } from './dto/create-template-skill.dto';
import { UpdateTemplateSkillDto } from './dto/update-template-skill.dto';
import { CreateTemplateItemCategoryDto } from './dto/create-template-item-category.dto';
import { CreateTemplateRaceDto } from './dto/create-template-race.dto';
import { UpdateTemplateRaceDto } from './dto/update-template-race.dto';
import { CreateTemplateRaceTraitDto } from './dto/create-template-race-trait.dto';
import { CreateTemplateRaceModifierDto } from './dto/create-template-race-modifier.dto';
import { CreateTemplateClassDto } from './dto/create-template-class.dto';
import { UpdateTemplateClassDto } from './dto/update-template-class.dto';
import { CreateTemplateClassFeatureDto } from './dto/create-template-class-feature.dto';
import { CreateTemplateClassModifierDto } from './dto/create-template-class-modifier.dto';

@ApiBearerAuth()
@ApiTags('tables')
@Controller('tables/:tableId/template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @UseGuards(AuthGuard, TableMemberGuard)
  async findTemplate(@Param('tableId') tableId: string) {
    return this.templateService.findByTableId(tableId);
  }

  @Post('attributes')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAttribute(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTemplateAttributeDto,
  ) {
    return this.templateService.createAttribute(tableId, dto);
  }

  @Patch('attributes/:id')
  @UseGuards(AuthGuard, TableMasterGuard)
  async updateAttribute(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateAttributeDto,
  ) {
    return this.templateService.updateAttribute(tableId, id, dto);
  }

  @Delete('attributes/:id')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttribute(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.templateService.deleteAttribute(tableId, id);
  }

  @Post('skills')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createSkill(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTemplateSkillDto,
  ) {
    return this.templateService.createSkill(tableId, dto);
  }

  @Patch('skills/:id')
  @UseGuards(AuthGuard, TableMasterGuard)
  async updateSkill(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateSkillDto,
  ) {
    return this.templateService.updateSkill(tableId, id, dto);
  }

  @Delete('skills/:id')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSkill(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.templateService.deleteSkill(tableId, id);
  }

  @Post('item-categories')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createItemCategory(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTemplateItemCategoryDto,
  ) {
    return this.templateService.createItemCategory(tableId, dto);
  }

  @Delete('item-categories/:id')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItemCategory(
    @Param('tableId') tableId: string,
    @Param('id') id: string,
  ) {
    return this.templateService.deleteItemCategory(tableId, id);
  }

  @Post('races')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRace(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTemplateRaceDto,
  ) {
    return this.templateService.createRace(tableId, dto);
  }

  @Patch('races/:raceId')
  @UseGuards(AuthGuard, TableMasterGuard)
  async updateRace(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
    @Body() dto: UpdateTemplateRaceDto,
  ) {
    return this.templateService.updateRace(tableId, raceId, dto);
  }

  @Delete('races/:raceId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRace(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
  ) {
    return this.templateService.deleteRace(tableId, raceId);
  }

  @Post('races/:raceId/traits')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async addRaceTrait(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
    @Body() dto: CreateTemplateRaceTraitDto,
  ) {
    return this.templateService.addRaceTrait(tableId, raceId, dto);
  }

  @Delete('races/:raceId/traits/:traitId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRaceTrait(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
    @Param('traitId') traitId: string,
  ) {
    return this.templateService.removeRaceTrait(tableId, raceId, traitId);
  }

  @Post('races/:raceId/modifiers')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async addRaceModifier(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
    @Body() dto: CreateTemplateRaceModifierDto,
  ) {
    return this.templateService.addRaceModifier(tableId, raceId, dto);
  }

  @Delete('races/:raceId/modifiers/:modifierId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRaceModifier(
    @Param('tableId') tableId: string,
    @Param('raceId') raceId: string,
    @Param('modifierId') modifierId: string,
  ) {
    return this.templateService.removeRaceModifier(tableId, raceId, modifierId);
  }

  @Post('classes')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createClass(
    @Param('tableId') tableId: string,
    @Body() dto: CreateTemplateClassDto,
  ) {
    return this.templateService.createClass(tableId, dto);
  }

  @Patch('classes/:classId')
  @UseGuards(AuthGuard, TableMasterGuard)
  async updateClass(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateTemplateClassDto,
  ) {
    return this.templateService.updateClass(tableId, classId, dto);
  }

  @Delete('classes/:classId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClass(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
  ) {
    return this.templateService.deleteClass(tableId, classId);
  }

  @Post('classes/:classId/features')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async addClassFeature(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
    @Body() dto: CreateTemplateClassFeatureDto,
  ) {
    return this.templateService.addClassFeature(tableId, classId, dto);
  }

  @Delete('classes/:classId/features/:featureId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeClassFeature(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.templateService.removeClassFeature(
      tableId,
      classId,
      featureId,
    );
  }

  @Post('classes/:classId/modifiers')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async addClassModifier(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
    @Body() dto: CreateTemplateClassModifierDto,
  ) {
    return this.templateService.addClassModifier(tableId, classId, dto);
  }

  @Delete('classes/:classId/modifiers/:modifierId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeClassModifier(
    @Param('tableId') tableId: string,
    @Param('classId') classId: string,
    @Param('modifierId') modifierId: string,
  ) {
    return this.templateService.removeClassModifier(
      tableId,
      classId,
      modifierId,
    );
  }
}
