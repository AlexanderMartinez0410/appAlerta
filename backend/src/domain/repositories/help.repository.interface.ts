import { HelpEntity } from '../entities/help.entity.js';

export const HELP_REPOSITORY = Symbol('HELP_REPOSITORY');

export interface IHelpRepository {
  getHelpById(id: number): Promise<HelpEntity | null>;
}
