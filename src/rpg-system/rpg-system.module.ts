import { Module } from '@nestjs/common';
import { RpgSystemController } from './rpg-system.controller';
import { RpgSystemService } from './rpg-system.service';
import { AdminGuard } from '../auth/admin.guard';
import { AttributeController } from './sub-resources/attribute/attribute.controller';
import { AttributeService } from './sub-resources/attribute/attribute.service';
import { SkillController } from './sub-resources/skill/skill.controller';
import { SkillService } from './sub-resources/skill/skill.service';
import { CurrencyController } from './sub-resources/currency/currency.controller';
import { CurrencyService } from './sub-resources/currency/currency.service';
import { ItemCategoryController } from './sub-resources/item-category/item-category.controller';
import { ItemCategoryService } from './sub-resources/item-category/item-category.service';
import { RaceController } from './sub-resources/race/race.controller';
import { RaceService } from './sub-resources/race/race.service';
import { ClassController } from './sub-resources/class/class.controller';
import { ClassService } from './sub-resources/class/class.service';

@Module({
  controllers: [
    RpgSystemController,
    AttributeController,
    SkillController,
    CurrencyController,
    ItemCategoryController,
    RaceController,
    ClassController,
  ],
  providers: [
    RpgSystemService,
    AttributeService,
    SkillService,
    CurrencyService,
    ItemCategoryService,
    RaceService,
    ClassService,
    AdminGuard,
  ],
})
export class RpgSystemModule {}
