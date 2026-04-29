import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class PaiementRembourse extends EvenementDomaine {
  public readonly idPaiement: string;
  public readonly idEcole: string;
  public readonly idEleve: string;

  constructor(idPaiement: string, idEcole: string, idEleve: string) {
    super('PaiementRembourse');
    this.idPaiement = idPaiement;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
  }
}
