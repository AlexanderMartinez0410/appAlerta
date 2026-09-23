import { Inject, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { LoginInputDto, LoginOutputDto } from '../dtos/login.dto.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInputDto): Promise<LoginOutputDto> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.estado === 'BANEADO') {
      throw new ForbiddenException('Este usuario ha sido bloqueado/baneado del sistema');
    }

    if (user.estado === 'INACTIVO' || user.estado === 'SUSPENDIDO') {
      throw new ForbiddenException('Tu cuenta se encuentra suspendida o inactiva');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último acceso
    await this.userRepository.updateUltimoAcceso(user.id);

    // Registrar o actualizar dispositivo si viene la información
    if (input.deviceId) {
      await this.userRepository.registrarDispositivo({
        usuarioId: user.id,
        deviceId: input.deviceId,
        plataforma: input.plataforma || 'DESCONOCIDO',
        modelo: input.modelo,
        versionSo: input.versionSo,
        pushToken: input.pushToken,
        ip: input.ip,
      });
    }

    // Extraer roles y permisos únicos
    const roles = user.roles.map((r) => r.codigo);
    const permisosSet = new Set<string>();
    for (const rol of user.roles) {
      for (const perm of rol.permisos) {
        permisosSet.add(perm.codigo);
      }
    }
    const permisos = Array.from(permisosSet);

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      permisos,
      personaId: user.personaId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        estado: user.estado,
        persona: user.persona
          ? {
              id: user.persona.id,
              nombres: user.persona.nombres,
              apellidos: user.persona.apellidos,
              tipoDocumento: user.persona.tipoDocumento,
              numeroDocumento: user.persona.numeroDocumento,
              telefono: user.persona.telefono,
              direccion: user.persona.direccion,
            }
          : null,
        roles,
        permisos,
      },
    };
  }
}
