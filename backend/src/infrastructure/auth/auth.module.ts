import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthController } from '../../presentation/controllers/auth.controller.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import { PrismaUserRepository } from '../repositories/prisma-user.repository.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';
import { PermissionsGuard } from './permissions.guard.js';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'app_alerta_super_secret_jwt_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [
    LoginUseCase,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    USER_REPOSITORY,
    JwtModule,
  ],
})
export class AuthModule {}
