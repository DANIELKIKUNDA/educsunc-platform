import { Entite } from '../../../domain/Entity';
import { TYPE_EXECUTION_AUDIT_ENUM, type TypeExecutionAuditEnum } from '../enums';

export interface ProprietesAuditExecutionContext {
  idAuditExecutionContext: string;
  modeExecution: TypeExecutionAuditEnum;
  batchId?: string;
  retryCount?: number;
  origineExecution: string;
  queueId?: string;
}

// Cette entité complète le contexte d'exécution réel observé au runtime.
export class AuditExecutionContext extends Entite<string> {
  private readonly modeExecution: TypeExecutionAuditEnum;
  private readonly batchId?: string;
  private readonly retryCount: number;
  private readonly origineExecution: string;
  private readonly queueId?: string;

  constructor(proprietes: ProprietesAuditExecutionContext) {
    super(AuditExecutionContext.validerTexte(proprietes.idAuditExecutionContext, 'idAuditExecutionContext'));
    if (!TYPE_EXECUTION_AUDIT_ENUM.includes(proprietes.modeExecution)) {
      throw new Error(`modeExecution invalide: ${proprietes.modeExecution}`);
    }
    this.modeExecution = proprietes.modeExecution;
    this.batchId = AuditExecutionContext.nettoyerOptionnel(proprietes.batchId);
    this.retryCount = AuditExecutionContext.validerCompteur(proprietes.retryCount ?? 0, 'retryCount');
    this.origineExecution = AuditExecutionContext.validerTexte(proprietes.origineExecution, 'origineExecution');
    this.queueId = AuditExecutionContext.nettoyerOptionnel(proprietes.queueId);
  }

  public obtenirModeExecution(): TypeExecutionAuditEnum { return this.modeExecution; }
  public obtenirBatchId(): string | undefined { return this.batchId; }
  public obtenirRetryCount(): number { return this.retryCount; }
  public obtenirOrigineExecution(): string { return this.origineExecution; }
  public obtenirQueueId(): string | undefined { return this.queueId; }

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

  private static validerCompteur(valeur: number, champ: string): number {
    if (!Number.isInteger(valeur) || valeur < 0) {
      throw new Error(`Le champ ${champ} est invalide.`);
    }
    return valeur;
  }
}
