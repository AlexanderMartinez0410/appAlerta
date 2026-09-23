import { HelpModel } from '../models/help.model';

export interface IHelpRepository {
  getHelpMessage(): Promise<HelpModel>;
}
