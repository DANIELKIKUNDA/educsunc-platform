import type { DeclarerAbandonUseCase } from 'contexts/bulletins-evaluations/application/use-cases/DeclarerAbandon/DeclarerAbandonUseCase';
import type { DeclarerNonClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/DeclarerNonClasse/DeclarerNonClasseUseCase';
import type { EncoderConduiteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderConduite/EncoderConduiteUseCase';
import { EncoderConduiteValidator } from '../validators/EncoderConduiteValidator';

// Ce controleur expose l'encodage de conduite et les lectures associees.
export class ConduiteApplicationController {
  // Ce constructeur injecte les cas d'usage de conduite et les actions associees sur l'application.
  constructor(
    private readonly encoderConduiteUseCase: EncoderConduiteUseCase,
    private readonly declarerNonClasseUseCase: DeclarerNonClasseUseCase,
    private readonly declarerAbandonUseCase: DeclarerAbandonUseCase,
  ) {}

  // Cette methode encode la conduite d'une periode.
  public async encoder(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = EncoderConduiteValidator.valider(corps, headers);
    const sortie = await this.encoderConduiteUseCase.executer(entree);
    return { donnee: sortie };
  }

  // Cette methode expose une lecture simple de conduite quand la projection existe.
  public async consulterConduite(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }

  // Cette methode expose une lecture simple d'application quand la projection existe.
  public async consulterApplication(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }
}
