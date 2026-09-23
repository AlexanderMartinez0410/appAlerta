import { Controller, Get, NotFoundException } from '@nestjs/common';
import { GetHelpUseCase } from '../../application/use-cases/get-help.use-case.js';

@Controller('help')
export class HelpController {
  constructor(private readonly getHelpUseCase: GetHelpUseCase) {}

  @Get()
  async getHelp() {
    const help = await this.getHelpUseCase.execute(1);
    if (!help) {
      throw new NotFoundException('Help record not found');
    }
    return help;
  }
}
