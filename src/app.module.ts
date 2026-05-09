import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { RpgSystemModule } from './rpg-system/rpg-system.module';
import { TableModule } from './table/table.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, RpgSystemModule, TableModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

