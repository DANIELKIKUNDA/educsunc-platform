import { Entite } from '../../../domain/Entity';
import { CorrelationId } from '../value-objects';

export interface ProprietesAuditCorrelation {
  idAuditCorrelation: string;
  correlationId?: CorrelationId;
  workflowId?: string;
  operationGlobale?: string;
}

// Cette entité relie les audits qui appartiennent au même flux métier global.
export class AuditCorrelation extends Entite<string> {
  private readonly correlationId?: CorrelationId;
  private readonly workflowId?: string;
  private readonly operationGlobale?: string;

  constructor(proprietes: ProprietesAuditCorrelation) {
    super(AuditCorrelation.validerTexte(proprietes.idAuditCorrelation, 'idAuditCorrelation'));
    this.correlationId = proprietes.correlationId;
    this.workflowId = AuditCorrelation.nettoyerOptionnel(proprietes.workflowId);
    this.operationGlobale = AuditCorrelation.nettoyerOptionnel(proprietes.operationGlobale);
  }

  public obtenirCorrelationId(): CorrelationId | undefined { return this.correlationId; }
  public obtenirWorkflowId(): string | undefined { return this.workflowId; }
  public obtenirOperationGlobale(): string | undefined { return this.operationGlobale; }

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
}
