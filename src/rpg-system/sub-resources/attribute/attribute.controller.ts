import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../auth/auth.guard';
import { AdminGuard } from '../../../auth/admin.guard';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@ApiBearerAuth()
@ApiTags('rpg-system')
@Controller('rpg-system/:systemId/attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Param('systemId') systemId: string,
    @Body() createAttributeDto: CreateAttributeDto,
  ) {
    return this.attributeService.create(systemId, createAttributeDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('systemId') systemId: string) {
    return this.attributeService.findAll(systemId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributeService.update(systemId, id, updateAttributeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async remove(@Param('systemId') systemId: string, @Param('id') id: string) {
    return this.attributeService.remove(systemId, id);
  }
}
