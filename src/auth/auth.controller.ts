import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
async register(@Body() body: any) {
  return this.authService.register(body);
}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

 @UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  // Récupère explicitement userId renvoyé par la stratégie JWT
  const userId = req.user.userId || req.user.sub;
  return this.authService.getProfile(userId);
}
}