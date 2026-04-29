import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class CaisseJourOuverte extends EvenementDomaine {
  public readonly idCaisseJour: string;
  public readonly idEcole: string;
  public readonly ouvertePar: string;

  constructor(idCaisseJour: string, idEcole: string, ouvertePar: string) {
    super('CaisseJourOuverte');
    this.idCaisseJour = idCaisseJour;
    this.idEcole = idEcole;
    this.ouvertePar = ouvertePar;
  }
}
