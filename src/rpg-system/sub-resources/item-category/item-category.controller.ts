import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../auth/auth.guard';
import { AdminGuard } from '../../../auth/admin.guard';
import { ItemCategoryService } from './item-category.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';

@ApiBearerAuth()
@ApiTags('rpg-system')
@Controller('rpg-system/:systemId/item-categories')
export class ItemCategoryController {
  constructor(private readonly itemCategoryService: ItemCategoryService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Param('systemId') systemId: string,
    @Body() createItemCategoryDto: CreateItemCategoryDto,
  ) {
    return this.itemCategoryService.create(systemId, createItemCategoryDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('systemId') systemId: string) {
    return this.itemCategoryService.findAll(systemId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async remove(@Param('systemId') systemId: string, @Param('id') id: string) {
    return this.itemCategoryService.remove(systemId, id);
  }
}
