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
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassFeatureDto } from './dto/create-class-feature.dto';
import { CreateClassModifierDto } from './dto/create-class-modifier.dto';

@ApiBearerAuth()
@ApiTags('rpg-system')
@Controller('rpg-system/:systemId/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Param('systemId') systemId: string,
    @Body() createClassDto: CreateClassDto,
  ) {
    return this.classService.create(systemId, createClassDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('systemId') systemId: string) {
    return this.classService.findAll(systemId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
  ) {
    return this.classService.findOne(systemId, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.update(systemId, id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async remove(@Param('systemId') systemId: string, @Param('id') id: string) {
    return this.classService.remove(systemId, id);
  }

  @Post(':classId/features')
  @UseGuards(AuthGuard, AdminGuard)
  async addFeature(
    @Param('systemId') systemId: string,
    @Param('classId') classId: string,
    @Body() createFeatureDto: CreateClassFeatureDto,
  ) {
    return this.classService.addFeature(systemId, classId, createFeatureDto);
  }

  @Delete(':classId/features/:featureId')
  @UseGuards(AuthGuard, AdminGuard)
  async removeFeature(
    @Param('systemId') systemId: string,
    @Param('classId') classId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.classService.removeFeature(systemId, classId, featureId);
  }

  @Post(':classId/modifiers')
  @UseGuards(AuthGuard, AdminGuard)
  async addModifier(
    @Param('systemId') systemId: string,
    @Param('classId') classId: string,
    @Body() createModifierDto: CreateClassModifierDto,
  ) {
    return this.classService.addModifier(systemId, classId, createModifierDto);
  }

  @Delete(':classId/modifiers/:modifierId')
  @UseGuards(AuthGuard, AdminGuard)
  async removeModifier(
    @Param('systemId') systemId: string,
    @Param('classId') classId: string,
    @Param('modifierId') modifierId: string,
  ) {
    return this.classService.removeModifier(systemId, classId, modifierId);
  }
}
