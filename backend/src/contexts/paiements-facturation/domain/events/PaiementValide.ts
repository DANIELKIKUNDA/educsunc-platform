import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class PaiementValide extends EvenementDomaine {
  public readonly idPaiement: string;
  public readonly idEcole: string;
  public readonly idEleve: string;

  constructor(idPaiement: string, idEcole: string, idEleve: string) {
    super('PaiementValide');
    this.idPaiement = idPaiement;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
  }
}
