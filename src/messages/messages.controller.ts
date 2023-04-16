import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUserId } from '../common/decorators';
import { PaginationParams } from '../common/dto/paginationParams.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { MessagesService } from './messages.service';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessagesService) {}

  @ApiOkResponse({
    schema: {
      example: {
        docs: [
          {
            _id: 'string',
            text: 'Hello',
            user_id: 'string',
            group_id: 'string',
            send_at: '2023-04-15T11:48:49.442Z',
            __v: 0,
            sentByMe: 'NO',
          },
          {
            _id: 'string',
            text: 'string',
            user_id: 'string',
            group_id: 'string',
            send_at: '2023-04-14T12:12:06.714Z',
            __v: 0,
            sentByMe: 'NO',
          },
          {
            _id: 'string',
            text: 'jj',
            user_id: 'string',
            group_id: 'string',
            send_at: '2023-04-13T10:50:33.992Z',
            __v: 0,
            sentByMe: 'NO',
          },
        ],
        totalDocs: 34,
        limit: 30,
        totalPages: 2,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: true,
        prevPage: null,
        nextPage: 2,
      },
    },
  })
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
          Invalid_Group_ID: {
            value: {
              statusCode: 400,
              message: "Group doesn't exist",
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all chats for a specific user' })
  @Get('/:chat_id/chat')
  async get_chat(
    @GetCurrentUserId() user_id,
    @Param('chat_id') group_id: string,
    @Query() { page }: PaginationParams,
  ) {
    return this.messageService.get_chat(user_id, group_id, page);
  }

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
          Invalid_Group_ID: {
            value: {
              statusCode: 400,
              message: "Group doesn't exist",
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Sends a Message to a specific Group' })
  @ApiBearerAuth()
  @Post('/:chat_id/send_message')
  async send_chat_message(
    @GetCurrentUserId() user_id,
    @Param('chat_id') group_id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(user_id, group_id, dto);
  }
}
