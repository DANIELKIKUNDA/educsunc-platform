import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class PaiementCree extends EvenementDomaine {
  public readonly idPaiement: string;
  public readonly idEcole: string;
  public readonly idEleve: string;
  public readonly declenchePar: string;

  constructor(idPaiement: string, idEcole: string, idEleve: string, declenchePar: string) {
    super('PaiementCree');
    this.idPaiement = idPaiement;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
    this.declenchePar = declenchePar;
  }
}
