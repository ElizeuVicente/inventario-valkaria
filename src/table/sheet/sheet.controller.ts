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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TableMasterGuard } from '../guards/table-master.guard';
import { TableMemberGuard } from '../guards/table-member.guard';
import { SheetOwnerGuard } from './guards/sheet-owner.guard';
import { SheetService } from './sheet.service';
import { CreateSheetDto } from './dto/create-sheet.dto';
import { UpdateSheetDto } from './dto/update-sheet.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SetRaceDto } from './dto/set-race.dto';
import { AddClassDto } from './dto/add-class.dto';
import { UpdateClassLevelDto } from './dto/update-class-level.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateItemModifierDto } from './dto/create-item-modifier.dto';
import { ToggleItemModifierDto } from './dto/toggle-item-modifier.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CreateEffectDto } from './dto/create-effect.dto';
import { UpdateSessionStateDto } from './dto/update-session-state.dto';
import { CreateAttributeOverrideDto } from './dto/create-attribute-override.dto';

@ApiBearerAuth('access_token')
@ApiTags('Character Sheet')
@ApiParam({ name: 'tableId', description: 'Table ID' })
@ApiParam({ name: 'sheetId', description: 'Character sheet ID' })
@Controller('tables/:tableId/sheets')
export class SheetController {
  constructor(private readonly sheetService: SheetService) {}

  @Post()
  @UseGuards(AuthGuard, TableMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create character sheet',
    description: 'Create a new character sheet with auto-populated attributes, skills, and currencies',
  })
  @ApiResponse({
    status: 201,
    description: 'Character sheet created with auto-populated attributes',
  })
  @ApiResponse({
    status: 403,
    description: 'Not a table member',
  })
  async create(
    @Param('tableId') tableId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateSheetDto,
  ) {
    return this.sheetService.create(tableId, userId, dto);
  }

  @Get()
  @UseGuards(AuthGuard, TableMemberGuard)
  async findAll(@Param('tableId') tableId: string) {
    return this.sheetService.findAll(tableId);
  }

  @Get(':sheetId')
  @UseGuards(AuthGuard, TableMemberGuard)
  async findOne(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
  ) {
    return this.sheetService.findOne(tableId, sheetId);
  }

  @Patch(':sheetId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async update(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: UpdateSheetDto,
  ) {
    return this.sheetService.update(tableId, sheetId, dto);
  }

  @Delete(':sheetId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
  ) {
    return this.sheetService.remove(tableId, sheetId);
  }

  @Patch(':sheetId/activate')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async activate(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @CurrentUser() userId: string,
  ) {
    return this.sheetService.activate(tableId, sheetId, userId);
  }

  @Patch(':sheetId/attributes/:attrId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async updateAttribute(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('attrId') attributeId: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.sheetService.updateAttributeValue(
      tableId,
      sheetId,
      attributeId,
      dto,
    );
  }

  @Patch(':sheetId/skills/:skillId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async updateSkill(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.sheetService.updateSkill(tableId, sheetId, skillId, dto);
  }

  @Patch(':sheetId/race')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async setRace(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: SetRaceDto,
  ) {
    return this.sheetService.setRace(tableId, sheetId, dto);
  }

  @Post(':sheetId/classes')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  async addClass(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: AddClassDto,
  ) {
    return this.sheetService.addClass(tableId, sheetId, dto);
  }

  @Patch(':sheetId/classes/:classId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async updateClassLevel(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassLevelDto,
  ) {
    return this.sheetService.updateClassLevel(
      tableId,
      sheetId,
      classId,
      dto,
    );
  }

  @Delete(':sheetId/classes/:classId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeClass(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('classId') classId: string,
  ) {
    return this.sheetService.removeClass(tableId, sheetId, classId);
  }

  @Post(':sheetId/items')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  async createItem(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.sheetService.createItem(tableId, sheetId, dto);
  }

  @Patch(':sheetId/items/:itemId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async updateItem(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.sheetService.updateItem(tableId, sheetId, itemId, dto);
  }

  @Delete(':sheetId/items/:itemId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.sheetService.removeItem(tableId, sheetId, itemId);
  }

  @Post(':sheetId/items/:itemId/modifiers')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  async addItemModifier(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CreateItemModifierDto,
  ) {
    return this.sheetService.addItemModifier(
      tableId,
      sheetId,
      itemId,
      dto,
    );
  }

  @Patch(':sheetId/items/:itemId/modifiers/:modId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async toggleItemModifier(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('itemId') itemId: string,
    @Param('modId') modifierId: string,
    @Body() dto: ToggleItemModifierDto,
  ) {
    return this.sheetService.toggleItemModifier(
      tableId,
      sheetId,
      itemId,
      modifierId,
      dto,
    );
  }

  @Delete(':sheetId/items/:itemId/modifiers/:modId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItemModifier(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('itemId') itemId: string,
    @Param('modId') modifierId: string,
  ) {
    return this.sheetService.removeItemModifier(
      tableId,
      sheetId,
      itemId,
      modifierId,
    );
  }

  @Patch(':sheetId/currencies/:currencyId')
  @UseGuards(AuthGuard, SheetOwnerGuard)
  async updateCurrency(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('currencyId') currencyId: string,
    @Body() dto: UpdateCurrencyDto,
  ) {
    return this.sheetService.updateCurrency(
      tableId,
      sheetId,
      currencyId,
      dto,
    );
  }

  @Post(':sheetId/effects')
  @UseGuards(AuthGuard, TableMemberGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEffect(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateEffectDto,
  ) {
    return this.sheetService.createEffect(tableId, sheetId, userId, dto);
  }

  @Patch(':sheetId/effects/:effectId')
  @UseGuards(AuthGuard, TableMemberGuard)
  async toggleEffect(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('effectId') effectId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.sheetService.toggleEffect(tableId, sheetId, effectId, isActive);
  }

  @Delete(':sheetId/effects/:effectId')
  @UseGuards(AuthGuard, TableMemberGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEffect(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('effectId') effectId: string,
  ) {
    return this.sheetService.removeEffect(tableId, sheetId, effectId);
  }

  @Patch(':sheetId/session-state')
  @UseGuards(AuthGuard, TableMasterGuard)
  async updateSessionState(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @CurrentUser() userId: string,
    @Body() dto: UpdateSessionStateDto,
  ) {
    return this.sheetService.updateSessionState(tableId, sheetId, userId, dto);
  }

  @Post(':sheetId/attribute-overrides')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAttributeOverride(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateAttributeOverrideDto,
  ) {
    return this.sheetService.createAttributeOverride(tableId, sheetId, userId, dto);
  }

  @Delete(':sheetId/attribute-overrides/:overrideId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAttributeOverride(
    @Param('tableId') tableId: string,
    @Param('sheetId') sheetId: string,
    @Param('overrideId') overrideId: string,
  ) {
    return this.sheetService.removeAttributeOverride(
      tableId,
      sheetId,
      overrideId,
    );
  }
}
