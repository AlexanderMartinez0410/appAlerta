import { PersonEntity } from './person.entity.js';
import { RoleEntity } from './role.entity.js';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly estado: string,
    public readonly personaId: string,
    public readonly persona?: PersonEntity,
    public readonly roles: RoleEntity[] = [],
    public readonly reputacionScore: number = 0,
    public readonly alertasEmitidasCount: number = 0,
    public readonly alertasFalsasCount: number = 0,
    public readonly ultimoAcceso?: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  public get esValido(): boolean {
    return this.estado === 'ACTIVO' && this.reputacionScore > -10;
  }

  public get estaBaneadoPorReputacion(): boolean {
    return this.reputacionScore <= -10;
  }
}
