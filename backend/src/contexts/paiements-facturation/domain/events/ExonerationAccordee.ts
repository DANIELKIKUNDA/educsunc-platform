import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ExonerationAccordee extends EvenementDomaine {
  public readonly idExoneration: string;
  public readonly idObligation: string;
  public readonly idEcole: string;

  constructor(idExoneration: string, idObligation: string, idEcole: string) {
    super('ExonerationAccordee');
    this.idExoneration = idExoneration;
    this.idObligation = idObligation;
    this.idEcole = idEcole;
  }
}
