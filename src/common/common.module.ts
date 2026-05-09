import { Module } from '@nestjs/common';
import { AttributeCalculatorService } from './services/attribute-calculator.service';

@Module({
  providers: [AttributeCalculatorService],
  exports: [AttributeCalculatorService],
})
export class CommonModule {}
