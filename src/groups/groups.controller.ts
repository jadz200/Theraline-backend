import { Body, Controller, Get, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
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
import { RolesGuard } from 'src/common/guards';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetCurrentUserId, Public, Roles } from '../common/decorators/index';
import { Chat, CreateConvoDto, CreateGroupDto, getChatsDto } from './dto/index';
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
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          User_Doesnt_Exist: {
            value: {
              statusCode: 400,
              message: 'User does not exists',
              error: 'Bad Request',
            },
          },
          Already_Exists: {
            value: {
              statusCode: 400,
              message: 'Conv already exists',
              error: 'Bad Request',
            },
          },
          No_Self_Conv: {
            value: {
              statusCode: 400,
              message: "You can't create a conversation with yourself ",
              error: 'Bad Request',
            },
          },
          More_than_2_users: {
            value: {
              statusCode: 400,
              message: 'More than 2 users in this conversation',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
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
          Invalid_id: {
            value: {
              statusCode: 400,
              message: 'Id is not in valid format',
              error: 'Bad Request',
            },
          },
          User_Doesnt_Exist: {
            value: {
              statusCode: 400,
              message: 'User does not exists',
              error: 'Bad Request',
            },
          },
          Cannot_Upload_Image: {
            value: {
              statusCode: 400,
              message: 'Cannot upload image',
              error: 'Bad Request',
            },
          },
          Duplicate_Entries: {
            value: {
              statusCode: 400,
              message: 'Duplicate entries',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
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
  @ApiForbiddenResponse({
    description: 'Forbidden Acees',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
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
  async create_group(
    @Body() dto: CreateGroupDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ) {
    if (dto.image) {
      dto.image = (await this.cloudinaryService.upload(dto.image)).url;
    }
    dto.users_id.push(userId.toString());

    return this.groupService.create_group(dto);
  }

  @ApiOkResponse({
    schema: {
      example: {
        chats: [
          {
            _id: 'string',
            name: 'Super cool group',
            groupType: ['GROUP'],
            latestMessage: {
              _id: 'string',
              send_at: '2023-03-20T19:44:19.883Z',
              user_id: 'string',
              text: 'Hello!',
            },
          },
          {
            _id: 'string',
            name: 'ADHD',
            groupType: ['GROUP'],
            groupImage: 'string',
            latestMessage: {
              _id: 'string',
              send_at: '2023-04-04T08:19:08.508Z',
              user_id: 'string',
              text: 'testing time!',
            },
          },
          {
            _id: 'string',
            name: 'Jad Zarzour',
            groupType: ['PRIVATE'],
            groupImage: 'string',
            latestMessage: {
              _id: 'string',
              send_at: '2023-04-13T05:53:33.190Z',
              user_id: 'string',
              text: 'hi',
            },
          },
          {
            _id: 'string',
            name: 'Very cool',
            groupImage: 'string',
            groupType: ['GROUP'],
          },
          {
            _id: 'string',
            name: 'string string',
            groupType: ['PRIVATE'],
          },
          {
            _id: 'string',
            name: 'string string',
            groupImage: null,
            groupType: ['PRIVATE'],
          },
        ],
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
  async get_all_chats(
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<Chat[]> {
    return this.groupService.get_all_chats(userId);
  }

  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [
          {
            _id: 'string',
            email: 'string',
            firstName: 'Jhon',
            lastName: 'Doe',
          },
          {
            _id: 'string',
            email: 'string',
            firstName: 'Mart',
            lastName: 'Slavin',
          },
          {
            _id: 'string',
            email: 'string',
            firstName: 'string',
            lastName: 'string',
          },
        ],
      },
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

  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden Acees',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [
          {
            _id: 'string',
            email: 'string',
            firstName: 'Jhon',
            lastName: 'Doe',
          },
          {
            _id: 'string',
            email: 'string',
            firstName: 'Mart',
            lastName: 'Slavin',
          },
          {
            _id: 'string',
            email: 'string',
            firstName: 'string',
            lastName: 'string',
          },
        ],
      },
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

  @Public()
  @Get('test')
  async test() {
    return this.groupService.test();
  }
}
