import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement signale qu'un snapshot academique vient d'etre cree.
export class SnapshotAcademiqueGenere extends EvenementDomaine {
  public readonly idSnapshotResultatBulletin: string;
  public readonly idEleve: string;
  public readonly idClassePedagogique: string;
  public readonly idAnneeScolaire: string;
  public readonly codeColonne: string;
  public readonly versionReferentielProgramme: string;
  public readonly dateSnapshot: Date;
  public readonly motifSnapshot: string;

  constructor(params: {
    idSnapshotResultatBulletin: string;
    idEleve: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    codeColonne: string;
    versionReferentielProgramme: string;
    dateSnapshot: Date;
    motifSnapshot: string;
  }) {
    super('SnapshotAcademiqueGenere');
    this.idSnapshotResultatBulletin = params.idSnapshotResultatBulletin;
    this.idEleve = params.idEleve;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codeColonne = params.codeColonne;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.dateSnapshot = params.dateSnapshot;
    this.motifSnapshot = params.motifSnapshot;
  }
}
