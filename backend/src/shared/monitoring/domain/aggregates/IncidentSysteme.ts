import { Alerte, DiagnosticIncident } from '../entities';
import { IncidentDetecte, IncidentEscalade } from '../events';
import type { NiveauSanteSysteme, StatutIncident } from '../enums';
import { ExceptionIncidentIncoherent } from '../exceptions';
import { PolitiqueEscaladeIncident } from '../policies';
import { ContexteMonitoring, CorrelationMonitoring, MonitoringId } from '../value-objects';

// Ce fichier declare l agregat racine d incident systeme.

/** Cette interface represente la vue serialisable d un incident. */
export interface IncidentSystemeDetails {
  readonly identifiant: string;
  readonly resume: string;
  readonly niveau: NiveauSanteSysteme;
  readonly statut: StatutIncident;
  readonly contexte: ReturnType<ContexteMonitoring['valeur']>;
  readonly correlation: ReturnType<CorrelationMonitoring['valeur']>;
  readonly alertes: readonly ReturnType<Alerte['valeur']>[];
  readonly diagnostics: readonly ReturnType<DiagnosticIncident['valeur']>[];
  readonly detecteLe: Date;
  readonly resoluLe?: Date;
}

/** Cette classe represente un incident systeme surveille par le domaine. */
export class IncidentSysteme {
  private readonly alertes: Alerte[] = [];
  private readonly diagnostics: DiagnosticIncident[] = [];
  private readonly evenements: object[] = [];
  private statut: StatutIncident = 'DETECTED';
  private resoluLe?: Date;

  constructor(
    private readonly identifiant: MonitoringId,
    private readonly resume: string,
    private readonly niveau: NiveauSanteSysteme,
    private readonly contexte: ContexteMonitoring,
    private readonly correlation: CorrelationMonitoring,
    private readonly detecteLe = new Date(),
  ) {
    this.evenements.push(new IncidentDetecte(this.details()));
  }

  /** Cette methode rattache une alerte a l incident. */
  public ajouterAlerte(alerte: Alerte): void {
    this.contexte.verifierCompatibilite(ContexteMonitoring.creer(alerte.valeur().contexte));
    this.alertes.push(alerte);
  }

  /** Cette methode rattache un diagnostic a l incident. */
  public ajouterDiagnostic(diagnostic: DiagnosticIncident): void {
    this.contexte.verifierCompatibilite(ContexteMonitoring.creer(diagnostic.valeur().contexte));
    this.diagnostics.push(diagnostic);
    this.statut = 'INVESTIGATING';
  }

  /** Cette methode escalade l incident. */
  public escalader(politique = new PolitiqueEscaladeIncident()): void {
    politique.verifier(this);
    this.statut = 'MITIGATED';
    this.evenements.push(new IncidentEscalade(this.details()));
  }

  /** Cette methode marque l incident comme resolu. */
  public resoudre(a = new Date()): void {
    if (this.alertes.length === 0) {
      throw new ExceptionIncidentIncoherent('Un incident sans alerte ne peut pas etre resolu proprement.');
    }
    this.statut = 'RESOLVED';
    this.resoluLe = a;
  }

  /** Cette methode retourne la vue serialisable de l incident. */
  public details(): IncidentSystemeDetails {
    return {
      identifiant: this.identifiant.valeur(),
      resume: this.resume,
      niveau: this.niveau,
      statut: this.statut,
      contexte: this.contexte.valeur(),
      correlation: this.correlation.valeur(),
      alertes: this.alertes.map((alerte) => alerte.valeur()),
      diagnostics: this.diagnostics.map((diagnostic) => diagnostic.valeur()),
      detecteLe: this.detecteLe,
      resoluLe: this.resoluLe,
    };
  }

  /** Cette methode retourne les evenements domaine emis. */
  public relacherEvenements(): readonly object[] {
    const copie = [...this.evenements];
    this.evenements.splice(0, this.evenements.length);
    return copie;
  }
}
