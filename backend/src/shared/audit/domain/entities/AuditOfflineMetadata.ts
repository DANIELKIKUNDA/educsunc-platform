import { Entite } from '../../../domain/Entity';
import { StatutSynchronisationAudit } from '../value-objects';

export interface ProprietesAuditOfflineMetadata {
  idAuditOfflineMetadata: string;
  statutSynchronisation: StatutSynchronisationAudit;
  dateLocaleAction?: Date;
  dateSynchronisation?: Date;
  synchronise: boolean;
  replay: boolean;
  retry: boolean;
  conflit: boolean;
  resolutionConflit?: string;
  sourceOffline?: string;
}

// Cette entité décrit la vie offline-first de l'action auditée.
export class AuditOfflineMetadata extends Entite<string> {
  private readonly statutSynchronisation: StatutSynchronisationAudit;
  private readonly dateLocaleAction?: Date;
  private readonly dateSynchronisation?: Date;
  private readonly synchronise: boolean;
  private readonly replay: boolean;
  private readonly retry: boolean;
  private readonly conflit: boolean;
  private readonly resolutionConflit?: string;
  private readonly sourceOffline?: string;

  constructor(proprietes: ProprietesAuditOfflineMetadata) {
    super(AuditOfflineMetadata.validerTexte(proprietes.idAuditOfflineMetadata, 'idAuditOfflineMetadata'));
    this.statutSynchronisation = proprietes.statutSynchronisation;
    this.dateLocaleAction = AuditOfflineMetadata.clonerDate(proprietes.dateLocaleAction);
    this.dateSynchronisation = AuditOfflineMetadata.clonerDate(proprietes.dateSynchronisation);
    this.synchronise = Boolean(proprietes.synchronise);
    this.replay = Boolean(proprietes.replay);
    this.retry = Boolean(proprietes.retry);
    this.conflit = Boolean(proprietes.conflit);
    this.resolutionConflit = AuditOfflineMetadata.nettoyerOptionnel(proprietes.resolutionConflit);
    this.sourceOffline = AuditOfflineMetadata.nettoyerOptionnel(proprietes.sourceOffline);
  }

  public obtenirStatutSynchronisation(): StatutSynchronisationAudit { return this.statutSynchronisation; }
  public obtenirDateLocaleAction(): Date | undefined { return AuditOfflineMetadata.clonerDate(this.dateLocaleAction); }
  public obtenirDateSynchronisation(): Date | undefined { return AuditOfflineMetadata.clonerDate(this.dateSynchronisation); }
  public estSynchronise(): boolean { return this.synchronise; }
  public estReplay(): boolean { return this.replay; }
  public estRetry(): boolean { return this.retry; }
  public estConflit(): boolean { return this.conflit; }
  public obtenirResolutionConflit(): string | undefined { return this.resolutionConflit; }
  public obtenirSourceOffline(): string | undefined { return this.sourceOffline; }

  private static validerTexte(valeur: string, champ: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${champ} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  private static clonerDate(valeur?: Date): Date | undefined {
    return valeur ? new Date(valeur.getTime()) : undefined;
  }
}
