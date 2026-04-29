import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class OperationIdempotenteRejouee extends EvenementDomaine {
  public readonly idempotencyKey: string;
  public readonly idEcole: string;
  public readonly referenceMetier: string;

  constructor(idempotencyKey: string, idEcole: string, referenceMetier: string) {
    super('OperationIdempotenteRejouee');
    this.idempotencyKey = idempotencyKey;
    this.idEcole = idEcole;
    this.referenceMetier = referenceMetier;
  }
}
