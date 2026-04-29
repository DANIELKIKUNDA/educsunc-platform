import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class ArriereDetecte extends EvenementDomaine {
  public readonly idEleve: string;
  public readonly idEcole: string;
  public readonly idAnneeScolaire: string;

  constructor(idEleve: string, idEcole: string, idAnneeScolaire: string) {
    super('ArriereDetecte');
    this.idEleve = idEleve;
    this.idEcole = idEcole;
    this.idAnneeScolaire = idAnneeScolaire;
  }
}
