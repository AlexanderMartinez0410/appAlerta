import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { LoginRequestDto } from '../dtos/login-request.dto.js';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard.js';
import { RolesGuard } from '../../infrastructure/auth/roles.guard.js';
import { Roles } from '../../infrastructure/auth/roles.decorator.js';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '';

    return this.loginUseCase.execute({
      ...body,
      ip,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Perfil de usuario autenticado',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get('admin-dashboard')
  getAdminDashboard(@CurrentUser() user: any) {
    return {
      message: 'Bienvenido al panel de Super Administrador',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('POLICIA', 'SUPERADMIN')
  @Get('despacho-policial')
  getDespachoPolicial(@CurrentUser() user: any) {
    return {
      message: 'Bienvenido a la Central de Despacho y Monitoreo Policial',
      user,
    };
  }
}
