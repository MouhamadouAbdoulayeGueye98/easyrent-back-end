import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @Get('users')
    getUsers() {
        return this.adminService.getUsers();
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
}