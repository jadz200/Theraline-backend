import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { MsgDto } from 'src/common/dto/msg.dto';
import { CreateConvoDto } from './dto/create_group.dto';
import { CreateGroupDto } from './dto/create_group.dto copy';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private groupService: GroupsService) {}
  @ApiBearerAuth()
  @Post('create_convo')
  @ApiOperation({ summary: 'Create personal conversation' })
  create_convo(
    @Body() dto: CreateConvoDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<MsgDto> {
    dto.users_id.push(userId.toString());
    return this.groupService.create_convo(dto);
  }
  @ApiBearerAuth()
  @Post('create_group')
  @ApiOperation({ summary: 'Create group' })
  create_group(
    @Body() dto: CreateGroupDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<MsgDto> {
    dto.users_id.push(userId.toString());
    return this.groupService.create_group(dto);
  }
}
