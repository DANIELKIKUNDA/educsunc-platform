import type { GenererSyntheseEcoleInput } from '../dto/input/GenererSyntheseEcoleInput';
import type { SyntheseEcoleOutput } from '../dto/output/SyntheseEcoleOutput';
import type { GenererSyntheseResultatsEcoleUseCase } from '../use-cases/GenererSyntheseResultatsEcole/GenererSyntheseResultatsEcoleUseCase';

// Cette saga orchestre la generation complete d'une synthese globale d'ecole.
export class SagaGenerationSyntheseEcole {
  constructor(private readonly useCase: GenererSyntheseResultatsEcoleUseCase) {}

  // Cette methode declenche la generation de synthese ecole.
  public async executer(input: GenererSyntheseEcoleInput): Promise<SyntheseEcoleOutput> {
    return this.useCase.executer(input);
  }
}
