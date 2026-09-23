import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { AuthModule } from './infrastructure/auth/auth.module.js';
import { HelpController } from './presentation/controllers/help.controller.js';
import { GetHelpUseCase } from './application/use-cases/get-help.use-case.js';
import { HELP_REPOSITORY } from './domain/repositories/help.repository.interface.js';
import { PrismaHelpRepository } from './infrastructure/repositories/prisma-help.repository.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { IncidentesController } from './presentation/controllers/incidentes.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController, HelpController, IncidentesController],
  providers: [
    AppService,
    GetHelpUseCase,
    {
      provide: HELP_REPOSITORY,
      useClass: PrismaHelpRepository,
    },
  ],
})
export class AppModule {}
