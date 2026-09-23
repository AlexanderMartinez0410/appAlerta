import { Injectable } from '@nestjs/common';
import { EstadoUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { PersonEntity } from '../../domain/entities/person.entity.js';
import { RoleEntity } from '../../domain/entities/role.entity.js';
import { PermissionEntity } from '../../domain/entities/permission.entity.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        persona: true,
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        persona: true,
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!raw) return null;
    return this.mapToEntity(raw);
  }

  async updateUltimoAcceso(id: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { ultimoAcceso: new Date() },
    });
  }

  async ajustarReputacion(
    usuarioId: string,
    delta: number,
    esFalsaAlarma = false,
  ): Promise<{ nuevoScore: number; estadoActualizado: string; fueBaneado: boolean }> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!user) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const nuevoScore = user.reputacionScore + delta;
    const fueBaneado = nuevoScore <= -10;
    const nuevoEstado = fueBaneado ? EstadoUsuario.BANEADO : user.estado;

    const updated = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        reputacionScore: nuevoScore,
        estado: nuevoEstado,
        alertasFalsasCount: esFalsaAlarma ? { increment: 1 } : undefined,
      },
    });

    return {
      nuevoScore: updated.reputacionScore,
      estadoActualizado: updated.estado,
      fueBaneado,
    };
  }

  async registrarDispositivo(params: {
    usuarioId: string;
    deviceId: string;
    plataforma: string;
    modelo?: string;
    versionSo?: string;
    pushToken?: string;
    ip?: string;
  }): Promise<void> {
    await this.prisma.dispositivo.upsert({
      where: {
        usuarioId_deviceId: {
          usuarioId: params.usuarioId,
          deviceId: params.deviceId,
        },
      },
      update: {
        plataforma: params.plataforma,
        modelo: params.modelo,
        versionSo: params.versionSo,
        pushToken: params.pushToken,
        ultimaIp: params.ip,
      },
      create: {
        usuarioId: params.usuarioId,
        deviceId: params.deviceId,
        plataforma: params.plataforma,
        modelo: params.modelo,
        versionSo: params.versionSo,
        pushToken: params.pushToken,
        ipRegistro: params.ip,
        ultimaIp: params.ip,
      },
    });
  }

  private mapToEntity(raw: any): UserEntity {
    const persona = raw.persona
      ? new PersonEntity(
          raw.persona.id,
          raw.persona.nombres,
          raw.persona.apellidos,
          raw.persona.tipoDocumento,
          raw.persona.numeroDocumento,
          raw.persona.telefono,
          raw.persona.direccion,
          raw.persona.fechaNacimiento,
          raw.persona.createdAt,
          raw.persona.updatedAt,
        )
      : undefined;

    const roles = (raw.roles || []).map((ur: any) => {
      const permisos = (ur.rol.permisos || []).map(
        (rp: any) =>
          new PermissionEntity(
            rp.permiso.id,
            rp.permiso.codigo,
            rp.permiso.nombre,
            rp.permiso.descripcion,
            rp.permiso.moduloId,
            rp.permiso.createdAt,
          ),
      );

      return new RoleEntity(
        ur.rol.id,
        ur.rol.codigo,
        ur.rol.nombre,
        ur.rol.descripcion,
        permisos,
      );
    });

    return new UserEntity(
      raw.id,
      raw.email,
      raw.passwordHash,
      raw.estado,
      raw.personaId,
      persona,
      roles,
      raw.reputacionScore ?? 0,
      raw.alertasEmitidasCount ?? 0,
      raw.alertasFalsasCount ?? 0,
      raw.ultimoAcceso,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
