import { Inject, Injectable } from '@nestjs/common';
import {
  HELP_REPOSITORY,
  type IHelpRepository,
} from '../../domain/repositories/help.repository.interface.js';
import { HelpEntity } from '../../domain/entities/help.entity.js';

@Injectable()
export class GetHelpUseCase {
  constructor(
    @Inject(HELP_REPOSITORY)
    private readonly helpRepository: IHelpRepository,
  ) {}

  async execute(id: number = 1): Promise<HelpEntity | null> {
    return this.helpRepository.getHelpById(id);
  }
}
