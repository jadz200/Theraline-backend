import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUserId } from '../common/decorators';
import { PaginationParams } from '../common/dto/paginationParams.dto';
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
