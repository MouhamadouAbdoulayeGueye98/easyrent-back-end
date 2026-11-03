
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() body: { subject: string; message: string },
  ) {
    return this.supportService.createTicket(
      req.user.userId,
      body,
    );
  }

  @Get('my-tickets')
  async getMyTickets(@Req() req: AuthenticatedRequest) {
    return this.supportService.getMyTickets(req.user.userId);
  }
}
