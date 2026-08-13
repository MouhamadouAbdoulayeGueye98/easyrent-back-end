import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: { propertyId: string; date: string },
  ) {
    return this.visitsService.create(
      req.user.userId,
      body.propertyId,
      new Date(body.date),
    );
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.visitsService.findAllForUser(req.user.userId);
  }

  @Patch(':id/accept')
  accept(@Param('id') visitId: string, @Req() req: AuthenticatedRequest) {
    return this.visitsService.accept(visitId, req.user.userId);
  }

  @Patch(':id/refuse')
  refuse(@Param('id') visitId: string, @Req() req: AuthenticatedRequest) {
    return this.visitsService.refuse(visitId, req.user.userId);
  }
}