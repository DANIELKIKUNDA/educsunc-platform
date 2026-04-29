import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class FondsAnticipesDetectes extends EvenementDomaine {
  public readonly idCaisseJour: string;
  public readonly idEcole: string;

  constructor(idCaisseJour: string, idEcole: string) {
    super('FondsAnticipesDetectes');
    this.idCaisseJour = idCaisseJour;
    this.idEcole = idEcole;
  }
}
