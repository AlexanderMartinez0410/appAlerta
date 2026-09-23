import { UserEntity } from '../entities/user.entity.js';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  updateUltimoAcceso(id: string): Promise<void>;
  ajustarReputacion(
    usuarioId: string,
    delta: number,
    esFalsaAlarma?: boolean,
  ): Promise<{ nuevoScore: number; estadoActualizado: string; fueBaneado: boolean }>;
  registrarDispositivo(params: {
    usuarioId: string;
    deviceId: string;
    plataforma: string;
    modelo?: string;
    versionSo?: string;
    pushToken?: string;
    ip?: string;
  }): Promise<void>;
}
