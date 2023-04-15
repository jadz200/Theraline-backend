import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from '../common/decorators';
import { PaginationParams } from '../common/dto/paginationParams.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { MessagesService } from './messages.service';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessagesService) {}
  @ApiBearerAuth()
  @Get('/:chat_id/chat')
  async get_chat(
    @GetCurrentUserId() user_id,
    @Param('chat_id') group_id: string,
    @Query() { page }: PaginationParams,
  ) {
    return this.messageService.get_chat(user_id, group_id, page);
  }

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
