import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ExcedentRestitue extends EvenementDomaine {
  public readonly idRestitution: string;
  public readonly idPaiement: string;
  public readonly idEcole: string;

  constructor(idRestitution: string, idPaiement: string, idEcole: string) {
    super('ExcedentRestitue');
    this.idRestitution = idRestitution;
    this.idPaiement = idPaiement;
    this.idEcole = idEcole;
  }
}
