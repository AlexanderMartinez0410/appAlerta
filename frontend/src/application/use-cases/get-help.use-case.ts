import { IHelpRepository } from '../../domain/repositories/help.repository';
import { HelpModel } from '../../domain/models/help.model';

export class GetHelpUseCase {
  constructor(private readonly helpRepository: IHelpRepository) {}

  async execute(): Promise<HelpModel> {
    return this.helpRepository.getHelpMessage();
  }
}
