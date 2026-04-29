import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class PaiementReparti extends EvenementDomaine {
  public readonly idPaiement: string;
  public readonly idEcole: string;
  public readonly idEleve: string;

  constructor(idPaiement: string, idEcole: string, idEleve: string) {
    super('PaiementReparti');
    this.idPaiement = idPaiement;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
  }
}
