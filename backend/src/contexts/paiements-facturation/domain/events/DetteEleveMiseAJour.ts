import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class DetteEleveMiseAJour extends EvenementDomaine {
  public readonly idEleve: string;
  public readonly idEcole: string;

  constructor(idEleve: string, idEcole: string) {
    super('DetteEleveMiseAJour');
    this.idEleve = idEleve;
    this.idEcole = idEcole;
  }
}
