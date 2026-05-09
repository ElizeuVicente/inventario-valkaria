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
import { AuthGuard } from '../auth/auth.guard';
import { TableMasterGuard } from './guards/table-master.guard';
import { TableMemberGuard } from './guards/table-member.guard';
import { TableService } from './table.service';
import { InviteService } from './invite.service';
import { JoinRequestService } from './join-request.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { HandleJoinRequestDto } from './dto/handle-join-request.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('tables')
@Controller('tables')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly inviteService: InviteService,
    private readonly joinRequestService: JoinRequestService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTableDto: CreateTableDto,
    @CurrentUser() userId: string,
  ) {
    return this.tableService.create(createTableDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@CurrentUser() userId: string) {
    return this.tableService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.tableService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, TableMasterGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.tableService.remove(id);
  }

  @Post(':id/invite')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInvite(
    @Param('id') tableId: string,
    @Body() createInviteDto: CreateInviteDto,
    @CurrentUser() userId: string,
  ) {
    return this.inviteService.createInviteToken(
      tableId,
      userId,
      createInviteDto,
    );
  }

  @Post('join/:token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async joinByToken(
    @Param('token') token: string,
    @CurrentUser() userId: string,
  ) {
    return this.inviteService.joinByToken(token, userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async requestJoin(
    @Param('id') tableId: string,
    @CurrentUser() userId: string,
  ) {
    return this.joinRequestService.requestJoin(tableId, userId);
  }

  @Get(':id/join-requests')
  @UseGuards(AuthGuard, TableMasterGuard)
  async findPendingRequests(@Param('id') tableId: string) {
    return this.joinRequestService.findPendingRequests(tableId);
  }

  @Patch(':id/join-requests/:requestId')
  @UseGuards(AuthGuard, TableMasterGuard)
  async handleJoinRequest(
    @Param('id') tableId: string,
    @Param('requestId') requestId: string,
    @Body() handleJoinRequestDto: HandleJoinRequestDto,
  ) {
    return this.joinRequestService.handleRequest(
      tableId,
      requestId,
      handleJoinRequestDto.status,
    );
  }

  @Get(':id/members')
  @UseGuards(AuthGuard, TableMemberGuard)
  async getMembers(@Param('id') tableId: string) {
    return this.tableService.getMembers(tableId);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(AuthGuard, TableMasterGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') tableId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.tableService.removeMember(tableId, memberId);
  }
}
