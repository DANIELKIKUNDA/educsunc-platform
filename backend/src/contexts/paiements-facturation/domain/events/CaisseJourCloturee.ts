import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class CaisseJourCloturee extends EvenementDomaine {
  public readonly idCaisseJour: string;
  public readonly idEcole: string;
  public readonly clotureePar: string;

  constructor(idCaisseJour: string, idEcole: string, clotureePar: string) {
    super('CaisseJourCloturee');
    this.idCaisseJour = idCaisseJour;
    this.idEcole = idEcole;
    this.clotureePar = clotureePar;
  }
}
