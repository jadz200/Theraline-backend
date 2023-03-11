import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { MsgDto } from 'src/common/dto/msg.dto';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import { RetrieveMessagesDto } from './dto/retrieveMessages.dto';

@ApiTags('Messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private groupService: MessagingService) {}
  @ApiBearerAuth()
  @Post('send_message')
  @ApiOperation({ summary: 'Send a message' })
  send_message(
    @Body() dto: SendMessageDto,
    @GetCurrentUserId() userId: mongoose.Types.ObjectId,
  ): Promise<MsgDto> {
    return this.groupService.send_message(dto, userId.toString());
  }
  @ApiBearerAuth()
  @Get('retrieve_messages/:group_id')
  @ApiOperation({ summary: 'Retrieve a group messages' })
  retrieve_messages(@Param('group_id') group_id: string): Promise<any> {
    return this.groupService.retrieve_messages(group_id);
  }
}
