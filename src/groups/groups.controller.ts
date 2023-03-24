import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { CreateConvoDto } from './dto/create_convo.dto';
import { CreateGroupDto } from './dto/create_group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private groupService: GroupsService) {}
  @ApiBearerAuth()
  @Post('create_convo')
  @ApiOperation({ summary: 'Create personal conversation' })
  @ApiCreatedResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Created convo',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  create_convo(
    @Body() dto: CreateConvoDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    dto.users_id.push(userId.toString());
    return this.groupService.create_convo(dto);
  }

  @ApiBearerAuth()
  @Post('create_group')
  @ApiOperation({ summary: 'Create group' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Successful Response',
    schema: {
      example: {
        msg: 'Created Group',
      },
    },
  })
  create_group(
    @Body() dto: CreateGroupDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    dto.users_id.push(userId.toString());
    return this.groupService.create_group(dto);
  }

  @ApiBearerAuth()
  @Get('get_chats')
  @ApiOperation({ summary: 'Get all groups for a user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  get_all_chats(@GetCurrentUserId() userId: mongoose.Types.ObjectId) {
    return this.groupService.get_all_chats(userId);
  }
}
