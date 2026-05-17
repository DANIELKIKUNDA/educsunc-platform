import { Entite } from '../../../../shared/domain/Entity';

// Cette entite garde la trace de chaque generation de bulletin.
export class HistoriqueGenerationBulletin extends Entite<string> {
  private dateGeneration: Date;
  private generePar: string;
  private motifGeneration?: string;
  private versionBulletin: number;
  private versionReferentielProgramme: string;

  // Ce constructeur enregistre une generation de bulletin de maniere immuable.
  constructor(params: {
    idHistoriqueGenerationBulletin: string;
    dateGeneration: Date;
    generePar: string;
    motifGeneration?: string;
    versionBulletin: number;
    versionReferentielProgramme: string;
  }) {
    super(params.idHistoriqueGenerationBulletin);
    this.dateGeneration = params.dateGeneration;
    this.generePar = params.generePar;
    this.motifGeneration = params.motifGeneration;
    this.versionBulletin = params.versionBulletin;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
  }

  // Cette methode expose la date de generation.
  public obtenirDateGeneration(): Date {
    return this.dateGeneration;
  }

  // Cette methode expose l'utilisateur ayant genere le bulletin.
  public obtenirGenerePar(): string {
    return this.generePar;
  }

  // Cette methode expose le motif explicatif si present.
  public obtenirMotifGeneration(): string | undefined {
    return this.motifGeneration;
  }

  // Cette methode expose la version metier du bulletin.
  public obtenirVersionBulletin(): number {
    return this.versionBulletin;
  }

  // Cette methode expose la version du programme source.
  public obtenirVersionReferentielProgramme(): string {
    return this.versionReferentielProgramme;
  }
}
