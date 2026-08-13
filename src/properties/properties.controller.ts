import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(user.userId, dto);
  }

  @Get()
  findAll(@Query() search: SearchPropertyDto) {
    return this.propertiesService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: Partial<CreatePropertyDto>,
  ) {
    return this.propertiesService.update(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.propertiesService.remove(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  addPhoto(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.propertiesService.addPhoto(id, user.userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('photos/:photoId')
  removePhoto(
    @Param('photoId') photoId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.propertiesService.removePhoto(photoId, user.userId);
  }
}