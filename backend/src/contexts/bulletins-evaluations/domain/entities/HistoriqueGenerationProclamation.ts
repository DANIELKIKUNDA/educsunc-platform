import { Entite } from '../../../../shared/domain/Entity';

// Cette entite historise chaque generation de proclamation de classe.
export class HistoriqueGenerationProclamation extends Entite<string> {
  private dateGeneration: Date;
  private genereePar: string;
  private motifGeneration?: string;
  private versionReferentielProgramme?: string;

  // Ce constructeur enregistre une generation de proclamation.
  constructor(params: {
    idHistoriqueGenerationProclamation: string;
    dateGeneration: Date;
    genereePar: string;
    motifGeneration?: string;
    versionReferentielProgramme?: string;
  }) {
    super(params.idHistoriqueGenerationProclamation);
    this.dateGeneration = params.dateGeneration;
    this.genereePar = params.genereePar;
    this.motifGeneration = params.motifGeneration;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
  }

  // Cette methode expose la date de generation.
  public obtenirDateGeneration(): Date {
    return this.dateGeneration;
  }

  // Cette methode expose l'utilisateur ayant declenche la proclamation.
  public obtenirGenereePar(): string {
    return this.genereePar;
  }

  // Cette methode expose le motif explicatif s'il existe.
  public obtenirMotifGeneration(): string | undefined {
    return this.motifGeneration;
  }

  // Cette methode expose la version du programme de reference si elle est connue.
  public obtenirVersionReferentielProgramme(): string | undefined {
    return this.versionReferentielProgramme;
  }
}
