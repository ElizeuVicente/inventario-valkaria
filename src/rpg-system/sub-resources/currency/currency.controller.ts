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
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@ApiBearerAuth()
@ApiTags('rpg-system')
@Controller('rpg-system/:systemId/currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async create(
    @Param('systemId') systemId: string,
    @Body() createCurrencyDto: CreateCurrencyDto,
  ) {
    return this.currencyService.create(systemId, createCurrencyDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('systemId') systemId: string) {
    return this.currencyService.findAll(systemId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async update(
    @Param('systemId') systemId: string,
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(systemId, id, updateCurrencyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async remove(@Param('systemId') systemId: string, @Param('id') id: string) {
    return this.currencyService.remove(systemId, id);
  }
}
