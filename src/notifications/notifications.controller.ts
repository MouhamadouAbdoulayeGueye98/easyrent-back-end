import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.findAllForUser(
      req.user.userId,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') notificationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationsService.markAsRead(
      notificationId,
      req.user.userId,
    );
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    );
  }
}