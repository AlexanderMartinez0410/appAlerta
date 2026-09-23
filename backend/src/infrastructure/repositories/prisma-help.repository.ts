import { Injectable } from '@nestjs/common';
import { IHelpRepository } from '../../domain/repositories/help.repository.interface.js';
import { HelpEntity } from '../../domain/entities/help.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaHelpRepository implements IHelpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getHelpById(id: number): Promise<HelpEntity | null> {
    return new HelpEntity(id, 'App Alerta API en línea con PostgreSQL y Prisma');
  }
}
