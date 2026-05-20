import type { UseCase } from 'shared/application/UseCase';
import type { AttribuerTitulariatInput } from '../../dto/input';
import type { TitulariatOutput } from '../../dto/output';
import { SagaTitulariat } from '../../sagas';

export class AttribuerTitulariatUseCase implements UseCase<AttribuerTitulariatInput, TitulariatOutput> {
  constructor(private readonly sagaTitulariat: SagaTitulariat) {}
  public async executer(entree: AttribuerTitulariatInput): Promise<TitulariatOutput> {
    return this.sagaTitulariat.attribuer(entree);
  }
}
