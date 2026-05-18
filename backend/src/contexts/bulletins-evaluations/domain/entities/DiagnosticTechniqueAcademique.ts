import { Entite } from '../../../../shared/domain/Entity';
import { NiveauGraviteAnomalie } from '../value-objects/NiveauGraviteAnomalie';
import { TypeAnomalieAcademique } from '../value-objects/TypeAnomalieAcademique';

// Cette entite represente une anomalie technique ou pedagogique expliquable.
export class DiagnosticTechniqueAcademique extends Entite<string> {
  private idEcole: string;
  private idClassePedagogique: string;
  private idEleve?: string;
  private idReferentielCours?: string;
  private codeColonne?: string;
  private typeAnomalie: TypeAnomalieAcademique;
  private niveauGravite: NiveauGraviteAnomalie;
  private message: string;
  private details?: string;
  private detecteLe: Date;
  private detecteParMoteur: string;
  private resolu: boolean;
  private dateResolution?: Date;

  // Ce constructeur fige un diagnostic academique complet.
  constructor(params: {
    idDiagnosticTechniqueAcademique: string;
    idEcole: string;
    idClassePedagogique: string;
    idEleve?: string;
    idReferentielCours?: string;
    codeColonne?: string;
    typeAnomalie: TypeAnomalieAcademique;
    niveauGravite: NiveauGraviteAnomalie;
    message: string;
    details?: string;
    detecteLe: Date;
    detecteParMoteur: string;
    resolu?: boolean;
    dateResolution?: Date;
  }) {
    super(params.idDiagnosticTechniqueAcademique);
    this.idEcole = params.idEcole;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idEleve = params.idEleve;
    this.idReferentielCours = params.idReferentielCours;
    this.codeColonne = params.codeColonne;
    this.typeAnomalie = params.typeAnomalie;
    this.niveauGravite = params.niveauGravite;
    this.message = params.message;
    this.details = params.details;
    this.detecteLe = new Date(params.detecteLe.getTime());
    this.detecteParMoteur = params.detecteParMoteur;
    this.resolu = params.resolu ?? false;
    this.dateResolution = params.dateResolution;
  }

  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdClassePedagogique(): string { return this.idClassePedagogique; }
  public obtenirIdEleve(): string | undefined { return this.idEleve; }
  public obtenirIdReferentielCours(): string | undefined { return this.idReferentielCours; }
  public obtenirCodeColonne(): string | undefined { return this.codeColonne; }
  public obtenirTypeAnomalie(): TypeAnomalieAcademique { return this.typeAnomalie; }
  public obtenirNiveauGravite(): NiveauGraviteAnomalie { return this.niveauGravite; }
  public obtenirMessage(): string { return this.message; }
  public obtenirDetails(): string | undefined { return this.details; }
  public obtenirDetecteLe(): Date { return new Date(this.detecteLe.getTime()); }
  public obtenirDetecteParMoteur(): string { return this.detecteParMoteur; }
  public obtenirResolu(): boolean { return this.resolu; }
  public obtenirDateResolution(): Date | undefined { return this.dateResolution ? new Date(this.dateResolution.getTime()) : undefined; }
  public estBloquanteOuCritique(): boolean {
    return this.niveauGravite === NiveauGraviteAnomalie.BLOQUANT
      || this.niveauGravite === NiveauGraviteAnomalie.CRITIQUE;
  }
}
