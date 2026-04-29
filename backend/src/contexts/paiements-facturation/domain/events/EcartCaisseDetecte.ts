import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class EcartCaisseDetecte extends EvenementDomaine {
  public readonly idCaisseJour: string;
  public readonly idEcole: string;

  constructor(idCaisseJour: string, idEcole: string) {
    super('EcartCaisseDetecte');
    this.idCaisseJour = idCaisseJour;
    this.idEcole = idEcole;
  }
}
