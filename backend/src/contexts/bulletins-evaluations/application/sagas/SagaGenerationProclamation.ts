import type { GenererProclamationClasseInput } from '../dto/input/GenererProclamationClasseInput';
import type { ProclamationClasseOutput } from '../dto/output/ProclamationClasseOutput';
import type { GenererProclamationClasseUseCase } from '../use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase';

// Cette saga orchestre la generation complete d'une proclamation.
export class SagaGenerationProclamation {
  constructor(private readonly useCase: GenererProclamationClasseUseCase) {}

  // Cette methode declenche la generation de proclamation.
  public async executer(input: GenererProclamationClasseInput): Promise<ProclamationClasseOutput> {
    return this.useCase.executer(input);
  }
}
