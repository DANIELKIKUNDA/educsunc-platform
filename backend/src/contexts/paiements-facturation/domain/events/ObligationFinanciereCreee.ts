import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ObligationFinanciereCreee extends EvenementDomaine {
  public readonly idObligation: string;
  public readonly idEcole: string;
  public readonly idEleve: string;
  public readonly declenchePar?: string;

  constructor(idObligation: string, idEcole: string, idEleve: string, declenchePar?: string) {
    super('ObligationFinanciereCreee');
    this.idObligation = idObligation;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
    this.declenchePar = declenchePar;
  }
}
