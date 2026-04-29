import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ObligationFinanciereSoldee extends EvenementDomaine {
  public readonly idObligation: string;
  public readonly idEcole: string;
  public readonly idEleve: string;

  constructor(idObligation: string, idEcole: string, idEleve: string) {
    super('ObligationFinanciereSoldee');
    this.idObligation = idObligation;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
  }
}
