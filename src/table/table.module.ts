import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { InviteService } from './invite.service';
import { JoinRequestService } from './join-request.service';
import { PermissionService } from './permission/permission.service';
import { TableMasterGuard } from './guards/table-master.guard';
import { TableMemberGuard } from './guards/table-member.guard';
import { TemplateService } from './template/template.service';
import { TemplateController } from './template/template.controller';
import { SheetService } from './sheet/sheet.service';
import { SheetController } from './sheet/sheet.controller';
import { SheetOwnerGuard } from './sheet/guards/sheet-owner.guard';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [TableController, TemplateController, SheetController],
  providers: [
    TableService,
    InviteService,
    JoinRequestService,
    PermissionService,
    TableMasterGuard,
    TableMemberGuard,
    TemplateService,
    SheetService,
    SheetOwnerGuard,
  ],
  exports: [PermissionService, TableMasterGuard, TableMemberGuard, TemplateService, SheetService, SheetOwnerGuard],
})
export class TableModule {}
