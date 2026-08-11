import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':propertyId')
  add(
    @CurrentUser() user: { userId: string },
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.add(user.userId, propertyId);
  }

  @Delete(':propertyId')
  remove(
    @CurrentUser() user: { userId: string },
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.remove(user.userId, propertyId);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.favoritesService.findAllForUser(user.userId);
  }
}