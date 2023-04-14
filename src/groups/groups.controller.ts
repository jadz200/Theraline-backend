import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetCurrentUserId } from '../common/decorators/index';
import { CreateConvoDto, CreateGroupDto, getChatsDto } from './dto/index';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private groupService: GroupsService,
    private cloudinaryService: CloudinaryService,
  ) {}
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
  @ApiBody({
    type: CreateGroupDto,
    schema: {},
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async create_group(
    @Body() dto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    // dto.users_id = dto.users_id.split(',');
    dto.image = (await this.cloudinaryService.upload(dto.image)).url;
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
  get_all_chats(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<getChatsDto> {
    return this.groupService.get_all_chats(userId);
  }
}
