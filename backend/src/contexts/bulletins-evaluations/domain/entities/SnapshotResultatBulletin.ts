import { Entite } from '../../../../shared/domain/Entity';
import { PourcentageBulletin } from '../value-objects/PourcentageBulletin';

// Cette entite fige l'etat exact d'un resultat a une date donnee.
export class SnapshotResultatBulletin extends Entite<string> {
  private idEleve: string;
  private idInscriptionScolaire: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private codeColonne: string;
  private totalObtenu?: number;
  private maximumGeneral?: number;
  private pourcentage?: PourcentageBulletin;
  private rang?: number;
  private estNonClasse: boolean;
  private versionReferentielProgramme: string;
  private dateSnapshot: Date;
  private motifSnapshot: string;
  private creePar: string;

  // Ce constructeur fige un snapshot academique immutable.
  constructor(params: {
    idSnapshotResultatBulletin: string;
    idEleve: string;
    idInscriptionScolaire: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    codeColonne: string;
    totalObtenu?: number;
    maximumGeneral?: number;
    pourcentage?: number;
    rang?: number;
    estNonClasse?: boolean;
    versionReferentielProgramme: string;
    dateSnapshot: Date;
    motifSnapshot: string;
    creePar: string;
  }) {
    super(params.idSnapshotResultatBulletin);
    this.idEleve = params.idEleve;
    this.idInscriptionScolaire = params.idInscriptionScolaire;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codeColonne = params.codeColonne;
    this.totalObtenu = params.totalObtenu;
    this.maximumGeneral = params.maximumGeneral;
    this.estNonClasse = params.estNonClasse ?? false;
    this.rang = params.rang;
    this.versionReferentielProgramme = params.versionReferentielProgramme;
    this.dateSnapshot = new Date(params.dateSnapshot.getTime());
    this.motifSnapshot = params.motifSnapshot;
    this.creePar = params.creePar;
    this.pourcentage = this.estNonClasse || params.pourcentage === undefined
      ? undefined
      : new PourcentageBulletin(params.pourcentage);
  }

  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdInscriptionScolaire(): string { return this.idInscriptionScolaire; }
  public obtenirIdClassePedagogique(): string { return this.idClassePedagogique; }
  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirCodeColonne(): string { return this.codeColonne; }
  public obtenirTotalObtenu(): number | undefined { return this.totalObtenu; }
  public obtenirMaximumGeneral(): number | undefined { return this.maximumGeneral; }
  public obtenirPourcentage(): number | undefined { return this.pourcentage?.obtenirValeur(); }
  public obtenirRang(): number | undefined { return this.rang; }
  public obtenirEstNonClasse(): boolean { return this.estNonClasse; }
  public obtenirVersionReferentielProgramme(): string { return this.versionReferentielProgramme; }
  public obtenirDateSnapshot(): Date { return new Date(this.dateSnapshot.getTime()); }
  public obtenirMotifSnapshot(): string { return this.motifSnapshot; }
  public obtenirCreePar(): string { return this.creePar; }
}
