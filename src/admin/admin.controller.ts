import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import type { AdminListQuery } from './admin.filters';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @Get('users')
    getUsers(@Query() query: AdminListQuery) {
        return this.adminService.getUsers(query);
    }

    @Get('users/:id')
    getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    @Patch('users/:id')
    updateUserStatus(
        @Param('id') id: string,
        @Body() body: { isActive: boolean },
    ) {
        return this.adminService.updateUserStatus(id, body.isActive);
    }

    @Get('properties')
    getProperties(@Query() query: AdminListQuery) {
        return this.adminService.getProperties(query);
    }

    @Get('properties/:id')
    getPropertyById(@Param('id') id: string) {
        return this.adminService.getPropertyById(id);
    }

    @Patch('properties/:id/status')
    updatePropertyStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
    ) {
        return this.adminService.updatePropertyStatus(id, body.status);
    }

    @Get('visits')
    getVisits(@Query() query: AdminListQuery) {
        return this.adminService.getVisits(query);
    }

    @Get('favorites')
    async getFavorites(@Query() query: AdminListQuery) {
        return this.adminService.getFavorites(query);
    }
}