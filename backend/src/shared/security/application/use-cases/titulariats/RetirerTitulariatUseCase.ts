import type { UseCase } from 'shared/application/UseCase';
import type { RetirerTitulariatInput } from '../../dto/input';
import type { TitulariatOutput } from '../../dto/output';
import { SagaTitulariat } from '../../sagas';

export class RetirerTitulariatUseCase implements UseCase<RetirerTitulariatInput, TitulariatOutput> {
  constructor(private readonly sagaTitulariat: SagaTitulariat) {}
  public async executer(entree: RetirerTitulariatInput): Promise<TitulariatOutput> {
    return this.sagaTitulariat.retirer(entree);
  }
}
