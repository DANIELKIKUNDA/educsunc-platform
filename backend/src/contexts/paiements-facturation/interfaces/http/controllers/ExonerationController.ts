import {
  AccorderExonerationUseCase,
  AnnulerExonerationUseCase,
} from '../../../application/use-cases/exonerations';
import { ExonerationValidator } from '../validators/ExonerationValidator';

export class ExonerationController {
  constructor(
    private readonly accorderExonerationUseCase: AccorderExonerationUseCase,
    private readonly annulerExonerationUseCase: AnnulerExonerationUseCase,
  ) {}

  public async accorder(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ExonerationValidator.validerAccorder(corps, headers);
    const sortie = await this.accorderExonerationUseCase.executer(entree);
    return { donnee: sortie };
  }

  public async annuler(
    parametres: unknown,
    corps: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    const entree = ExonerationValidator.validerAnnuler(parametres, corps, headers);
    const sortie = await this.annulerExonerationUseCase.executer(entree);
    return { donnee: sortie };
  }
}
