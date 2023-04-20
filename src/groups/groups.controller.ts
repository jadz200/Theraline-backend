import {
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { RolesGuard } from '../common/guards';
import {
  getChatsResp,
  getUserChatResp,
  SwaggerBadResponseMessage,
  SwaggerForbiddenResponse,
  SwaggerResponseSuccessfulWithMessage,
  SwaggerUnauthorizedResponse,
} from '../common/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetCurrentUserId, Roles } from '../common/decorators/index';
import { Chat, CreateConvoDto, CreateGroupDto } from './dto/index';
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
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          User_Doesnt_Exist: SwaggerBadResponseMessage('User does not exists'),
          Already_Exists: SwaggerBadResponseMessage('Conv already exists'),
          No_Self_Conv: SwaggerBadResponseMessage(
            "You can't create a conversation with yourself",
          ),
          More_than_2_users: SwaggerBadResponseMessage(
            'More than 2 users in this conversation',
          ),
        },
      },
    },
  })
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse(SwaggerResponseSuccessfulWithMessage('Created convo'))
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  create_convo(
    @Body() dto: CreateConvoDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    dto.users_id.push(userId.toString());
    return this.groupService.create_convo(dto);
  }

  @Roles('DOCTOR')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @Post('create_group')
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          User_Doesnt_Exist: SwaggerBadResponseMessage('User does not exists'),
          Cannot_Upload_Image: SwaggerBadResponseMessage('Cannot upload image'),
          Duplicate_Entries: SwaggerBadResponseMessage('Duplicate entries'),
        },
      },
    },
  })
  @ApiOperation({ summary: 'Create group' })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiCreatedResponse(SwaggerResponseSuccessfulWithMessage('Created Group'))
  @UsePipes(ValidationPipe)
  async create_group(
    @Body() dto: CreateGroupDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    dto.users_id.push(userId.toString());

    const copyDto = { ...dto };
    if (dto.image) {
      copyDto.image = (await this.cloudinaryService.upload(dto.image)).url;
    }

    return this.groupService.create_group(copyDto);
  }

  @ApiOkResponse({
    schema: {
      example: getChatsResp,
    },
  })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiBearerAuth()
  @Get('get_chats')
  @ApiOperation({ summary: 'Get all groups for a user' })
  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  async get_all_chats(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<Chat[]> {
    return this.groupService.get_all_chats(userId);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiOkResponse({
    schema: {
      example: getUserChatResp,
    },
  })
  @ApiBearerAuth()
  @Get('/user_convo')
  @ApiOperation({
    summary: 'Gets all the users that a user can create a convo with',
  })
  get_users_to_create_convo(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    return this.groupService.get_users_to_create_chat(userId);
  }

  @ApiUnauthorizedResponse(SwaggerUnauthorizedResponse)
  @ApiForbiddenResponse(SwaggerForbiddenResponse)
  @ApiOkResponse({
    schema: {
      example: getUserChatResp,
    },
  })
  @ApiBearerAuth()
  @Get('/user_group')
  @ApiOperation({
    summary: 'Gets all the users that a doctor can create a group with',
  })
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  get_users_to_create_group(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    return this.groupService.get_users_to_create_group(userId);
  }
}
