import { Injectable } from '@nestjs/common';
import { IHelpRepository } from '../../domain/repositories/help.repository.interface.js';
import { HelpEntity } from '../../domain/entities/help.entity.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class PostgresHelpRepository implements IHelpRepository {
  constructor(private readonly db: DatabaseService) {}

  async getHelpById(id: number): Promise<HelpEntity | null> {
    const result = await this.db.query<{ id: number; texto: string }>(
      'SELECT id, texto FROM help WHERE id = $1 LIMIT 1',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new HelpEntity(row.id, row.texto);
  }
}
