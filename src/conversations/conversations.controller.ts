import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post('property/:propertyId')
  startConversation(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.conversationsService.getOrCreateForProperty(propertyId, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.conversationsService.findAllForUser(user.userId);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.conversationsService.getMessages(id, user.userId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body('content') content: string,
  ) {
    return this.conversationsService.sendMessage(id, user.userId, content);
  }
}