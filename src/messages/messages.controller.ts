import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { getChatMessagesResp } from 'src/common/swagger/message.swager';
import { SwaggerBadResponseMessage } from 'src/common/swagger/general.swagger';
import { GetCurrentUserId } from '../common/decorators';
import { PaginationParams } from '../common/dto/paginationParams.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { MessagesService } from './messages.service';
import { Message } from './schema/message.schema';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessagesService) {}

  @ApiOkResponse({
    schema: {
      example: getChatMessagesResp,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          Invalid_Group_ID: SwaggerBadResponseMessage("Group doesn't exist"),
        },
      },
    },
  })
  @ApiOperation({ summary: 'Get all chat messages for a specific chat id' })
  @ApiBearerAuth()
  @Get('/:chat_id/chat')
  async get_chat(
    @GetCurrentUserId() user_id,
    @Param('chat_id') group_id: string,
    @Query() { page }: PaginationParams,
  ): Promise<PaginateResult<Message>> {
    return this.messageService.get_chat_messages(user_id, group_id, page);
  }

  @ApiResponse({
    status: 400,
    description: 'Validation error',
    content: {
      'application/json': {
        examples: {
          Invalid_id: SwaggerBadResponseMessage('Id is not in valid format'),
          Invalid_Group_ID: SwaggerBadResponseMessage("Group doesn't exist"),
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
  ): Promise<{ msg: string }> {
    return this.messageService.sendMessage(user_id, group_id, dto);
  }
}
