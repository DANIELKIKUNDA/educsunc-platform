import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement signale qu'un archivage academique vient d'etre execute.
export class ArchivageAcademiqueExecute extends EvenementDomaine {
  public readonly idEcole: string;
  public readonly idAnneeScolaire: string;
  public readonly typeArchivage: string;
  public readonly executePar: string;
  public readonly dateArchivage: Date;

  constructor(
    idEcole: string,
    idAnneeScolaire: string,
    typeArchivage: string,
    executePar: string,
    dateArchivage: Date,
  ) {
    super('ArchivageAcademiqueExecute');
    this.idEcole = idEcole;
    this.idAnneeScolaire = idAnneeScolaire;
    this.typeArchivage = typeArchivage;
    this.executePar = executePar;
    this.dateArchivage = dateArchivage;
  }
}
