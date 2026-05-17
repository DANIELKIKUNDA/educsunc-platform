import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une operation idempotente a ete rejouee sans doublon.
export class OperationIdempotenteRejouee extends EvenementDomaine {
  public readonly cleIdempotence: string;

  constructor(cleIdempotence: string) {
    super('OperationIdempotenteRejouee');
    this.cleIdempotence = cleIdempotence;
  }
}
