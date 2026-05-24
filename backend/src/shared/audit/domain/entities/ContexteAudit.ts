import { Entite } from '../../../domain/Entity';
import { RequestId, CorrelationId, SourceAudit } from '../value-objects';

export interface ProprietesContexteAudit {
  idContexteAudit: string;
  requestId?: RequestId;
  correlationId?: CorrelationId;
  sessionId?: string;
  userAgent?: string;
  adresseIp?: string;
  deviceId?: string;
  modeOffline: boolean;
  sourceRuntime: SourceAudit;
  versionApplication?: string;
  versionApi?: string;
  plateforme?: string;
  environnement?: string;
}

// Cette entité capture le contexte runtime précis de l'action auditée.
export class ContexteAudit extends Entite<string> {
  private readonly requestId?: RequestId;
  private readonly correlationId?: CorrelationId;
  private readonly sessionId?: string;
  private readonly userAgent?: string;
  private readonly adresseIp?: string;
  private readonly deviceId?: string;
  private readonly modeOffline: boolean;
  private readonly sourceRuntime: SourceAudit;
  private readonly versionApplication?: string;
  private readonly versionApi?: string;
  private readonly plateforme?: string;
  private readonly environnement?: string;

  constructor(proprietes: ProprietesContexteAudit) {
    super(ContexteAudit.validerTexte(proprietes.idContexteAudit, 'idContexteAudit'));
    this.requestId = proprietes.requestId;
    this.correlationId = proprietes.correlationId;
    this.sessionId = ContexteAudit.nettoyerOptionnel(proprietes.sessionId);
    this.userAgent = ContexteAudit.nettoyerOptionnel(proprietes.userAgent);
    this.adresseIp = ContexteAudit.nettoyerOptionnel(proprietes.adresseIp);
    this.deviceId = ContexteAudit.nettoyerOptionnel(proprietes.deviceId);
    this.modeOffline = Boolean(proprietes.modeOffline);
    this.sourceRuntime = proprietes.sourceRuntime;
    this.versionApplication = ContexteAudit.nettoyerOptionnel(proprietes.versionApplication);
    this.versionApi = ContexteAudit.nettoyerOptionnel(proprietes.versionApi);
    this.plateforme = ContexteAudit.nettoyerOptionnel(proprietes.plateforme);
    this.environnement = ContexteAudit.nettoyerOptionnel(proprietes.environnement);

    if (this.sourceRuntime.obtenirValeur() === 'HTTP_API' && !this.requestId?.obtenirValeur()) {
      throw new Error("Un contexte HTTP_API doit porter un requestId.");
    }
  }

  public obtenirRequestId(): RequestId | undefined { return this.requestId; }
  public obtenirCorrelationId(): CorrelationId | undefined { return this.correlationId; }
  public obtenirSessionId(): string | undefined { return this.sessionId; }
  public obtenirUserAgent(): string | undefined { return this.userAgent; }
  public obtenirAdresseIp(): string | undefined { return this.adresseIp; }
  public obtenirDeviceId(): string | undefined { return this.deviceId; }
  public estOffline(): boolean { return this.modeOffline; }
  public obtenirSourceRuntime(): SourceAudit { return this.sourceRuntime; }
  public obtenirVersionApplication(): string | undefined { return this.versionApplication; }
  public obtenirVersionApi(): string | undefined { return this.versionApi; }
  public obtenirPlateforme(): string | undefined { return this.plateforme; }
  public obtenirEnvironnement(): string | undefined { return this.environnement; }

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
