import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ConflitPaiementDetecte extends EvenementDomaine {
  public readonly idPaiement: string;
  public readonly idObligation: string;
  public readonly idEcole: string;

  constructor(idPaiement: string, idObligation: string, idEcole: string) {
    super('ConflitPaiementDetecte');
    this.idPaiement = idPaiement;
    this.idObligation = idObligation;
    this.idEcole = idEcole;
  }
}
