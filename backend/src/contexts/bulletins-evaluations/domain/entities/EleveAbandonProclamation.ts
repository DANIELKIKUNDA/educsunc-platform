import { SexeEleve } from '../value-objects/SexeEleve';

// Cette classe represente un eleve abandon dans la proclamation.
export class EleveAbandonProclamation {
  private idEleve: string;
  private nomComplet: string;
  private sexe: SexeEleve;
  private dateAbandon?: Date;
  private motifAbandon?: string;

  // Ce constructeur initialise la fiche d'abandon utilisee par la proclamation.
  constructor(params: {
    idEleve: string;
    nomComplet: string;
    sexe: SexeEleve;
    dateAbandon?: Date;
    motifAbandon?: string;
  }) {
    this.idEleve = params.idEleve;
    this.nomComplet = params.nomComplet;
    this.sexe = params.sexe;
    this.dateAbandon = params.dateAbandon;
    this.motifAbandon = params.motifAbandon;
  }

  // Cette methode expose l'identifiant de l'eleve abandon.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose le nom complet de l'eleve abandon.
  public obtenirNomComplet(): string {
    return this.nomComplet;
  }

  // Cette methode expose le sexe de l'eleve abandon.
  public obtenirSexe(): SexeEleve {
    return this.sexe;
  }

  // Cette methode expose la date d'abandon si elle est connue.
  public obtenirDateAbandon(): Date | undefined {
    return this.dateAbandon;
  }

  // Cette methode expose le motif libre de l'abandon.
  public obtenirMotifAbandon(): string | undefined {
    return this.motifAbandon;
  }
}
