import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class RecuPaiementAnnule extends EvenementDomaine {
  public readonly idRecu: string;
  public readonly idPaiement: string;
  public readonly idObligation: string;

  constructor(idRecu: string, idPaiement: string, idObligation: string) {
    super('RecuPaiementAnnule');
    this.idRecu = idRecu;
    this.idPaiement = idPaiement;
    this.idObligation = idObligation;
  }
}
