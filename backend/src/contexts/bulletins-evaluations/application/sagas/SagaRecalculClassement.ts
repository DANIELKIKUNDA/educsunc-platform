import type { ClassementClasseOutput } from '../dto/output/ClassementClasseOutput';
import type { RecalculerClassementClasseUseCase } from '../use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import type { RecalculerClassementInput } from '../dto/input/RecalculerClassementInput';

// Cette saga encapsule le recalcul complet d'un classement.
export class SagaRecalculClassement {
  constructor(private readonly useCase: RecalculerClassementClasseUseCase) {}

  // Cette methode execute le recalcul complet de classement.
  public async executer(input: RecalculerClassementInput): Promise<ClassementClasseOutput> {
    return this.useCase.executer(input);
  }
}
