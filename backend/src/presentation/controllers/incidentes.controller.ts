import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('categorias')
  async getCategorias() {
    return this.prisma.categoriaIncidente.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      include: {
        motivos: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }
}
