import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationParameters } from 'mongoose-paginate-v2';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { PaginationParams } from 'src/common/dto/paginationParams.dto';
import { MessagesService } from './messages.service';

@ApiTags('message')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessagesService) {}
  @ApiBearerAuth()
  @Get('/:id/chat')
  async get_chat(
    @GetCurrentUserId() user_id,
    @Param('id') group_id: string,
    @Query() { page }: PaginationParams,
  ) {
    return this.messageService.get_chat(user_id, group_id, page);
  }
}
