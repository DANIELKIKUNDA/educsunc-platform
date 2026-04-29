import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class GrilleTarificationModifiee extends EvenementDomaine {
  public readonly idGrilleTarification: string;
  public readonly idEcole: string;
  public readonly declenchePar: string;
  public readonly dateMetier: Date;

  constructor(idGrilleTarification: string, idEcole: string, declenchePar: string, dateMetier: Date = new Date()) {
    super('GrilleTarificationModifiee');
    this.idGrilleTarification = idGrilleTarification;
    this.idEcole = idEcole;
    this.declenchePar = declenchePar;
    this.dateMetier = dateMetier;
  }
}
