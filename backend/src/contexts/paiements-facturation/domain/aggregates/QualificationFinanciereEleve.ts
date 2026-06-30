import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { CodeQualificationFinanciereEleve } from '../value-objects/CodeQualificationFinanciereEleve';
import { StatutQualificationFinanciereEleve } from '../value-objects/StatutQualificationFinanciereEleve';

export interface ProprietesQualificationFinanciereEleve {
  idQualification: string;
  idOrganisation?: string;
  idEcole: string;
  idEleve: string;
  codeQualification: CodeQualificationFinanciereEleve;
  statut: StatutQualificationFinanciereEleve;
  raison?: string;
  details?: Record<string, unknown>;
  dateDebutEffet?: string;
  dateFinEffet?: string;
  creePar: string;
  creeLe: Date;
  version: number;
}

export class QualificationFinanciereEleve extends RacineAgregat<string> {
  private idOrganisation?: string;
  private idEcole: string;
  private idEleve: string;
  private codeQualification: CodeQualificationFinanciereEleve;
  private statut: StatutQualificationFinanciereEleve;
  private raison?: string;
  private details?: Record<string, unknown>;
  private dateDebutEffet?: string;
  private dateFinEffet?: string;
  private creePar: string;
  private creeLe: Date;
  private version: number;

  constructor(proprietes: ProprietesQualificationFinanciereEleve) {
    super(QualificationFinanciereEleve.validerTexte(proprietes.idQualification, 'idQualification'));
    this.idOrganisation = proprietes.idOrganisation?.trim() || undefined;
    this.idEcole = QualificationFinanciereEleve.validerTexte(proprietes.idEcole, 'idEcole');
    this.idEleve = QualificationFinanciereEleve.validerTexte(proprietes.idEleve, 'idEleve');
    this.codeQualification = proprietes.codeQualification;
    this.statut = proprietes.statut;
    this.raison = proprietes.raison?.trim() || undefined;
    this.details = proprietes.details;
    this.dateDebutEffet = proprietes.dateDebutEffet?.trim() || undefined;
    this.dateFinEffet = proprietes.dateFinEffet?.trim() || undefined;
    this.creePar = QualificationFinanciereEleve.validerTexte(proprietes.creePar, 'creePar');
    this.creeLe = QualificationFinanciereEleve.validerDate(proprietes.creeLe);
    this.version = proprietes.version;
  }

  public static activer(
    proprietes: Omit<
      ProprietesQualificationFinanciereEleve,
      'statut' | 'creeLe' | 'version'
    > & { creeLe?: Date; version?: number },
  ): QualificationFinanciereEleve {
    return new QualificationFinanciereEleve({
      ...proprietes,
      statut: StatutQualificationFinanciereEleve.ACTIVE,
      creeLe: proprietes.creeLe ?? new Date(),
      version: proprietes.version ?? 1,
    });
  }

  public obtenirIdOrganisation(): string | undefined { return this.idOrganisation; }
  public obtenirIdEcole(): string { return this.idEcole; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirCodeQualification(): CodeQualificationFinanciereEleve { return this.codeQualification; }
  public obtenirStatut(): StatutQualificationFinanciereEleve { return this.statut; }
  public obtenirRaison(): string | undefined { return this.raison; }
  public obtenirDetails(): Record<string, unknown> | undefined { return this.details; }
  public obtenirDateDebutEffet(): string | undefined { return this.dateDebutEffet; }
  public obtenirDateFinEffet(): string | undefined { return this.dateFinEffet; }
  public obtenirCreePar(): string { return this.creePar; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirVersion(): number { return this.version; }

  public desactiver(raison?: string, dateFinEffet?: string): void {
    this.statut = StatutQualificationFinanciereEleve.DESACTIVEE;
    this.raison = raison?.trim() || this.raison;
    this.dateFinEffet = dateFinEffet?.trim() || this.dateFinEffet;
    this.version += 1;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date technique de qualification est invalide.');
    }
    return new Date(valeur.getTime());
  }
}
