import type { AuditForensicQuery, SearchAuditQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import {
  AuditSecurityAccessValidator,
  AuditSecurityAnomaliesValidator,
  AuditSecurityIncidentValidator,
} from '../validators';
import { AuditAnalyticsPresenter, AuditForensicPresenter, AuditMonitoringPresenter } from '../presenters';

export class AuditSecurityController {
  public constructor(
    private readonly investiguerIncidentSecurite: AuditExecutable<AuditForensicQuery, unknown>,
    private readonly detecterEchecsRepetees: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly detecterExportsMassifs: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly obtenirAcces: ((payload: SearchAuditQuery) => Promise<unknown>) | undefined = undefined,
    private readonly verifierIntegriteEntree: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
    private readonly verifierIntegritePlage: ((payload: Record<string, unknown>) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async incidents(
    requete: AuditHttpRequest<never, { id?: string }, AuditForensicQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(
      this.investiguerIncidentSecurite,
      enrichirTenant(AuditSecurityIncidentValidator.valider(requete.params, requete.query), contexte),
    );
    return envelopperReponse(AuditForensicPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async anomalies(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.detecterEchecsRepetees, enrichirTenant(AuditSecurityAnomaliesValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditAnalyticsPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async exportsMassifs(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.detecterExportsMassifs, enrichirTenant(AuditSecurityAnomaliesValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditAnalyticsPresenter.presenter(sortie as never), contexte, startedAt);
  }

  public async acces(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const payload = enrichirTenant(AuditSecurityAccessValidator.valider(requete.query), contexte);
    const sortie = this.obtenirAcces ? await this.obtenirAcces(payload) : { acces: 'RESTREINT', payload };
    return envelopperReponse(AuditMonitoringPresenter.presenter(sortie), contexte, startedAt);
  }

  public async integriteEntree(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const id = requete.params?.id?.trim();
    if (!id) throw new Error("L'identifiant de l'evenement est requis.");
    if (!this.verifierIntegriteEntree) throw new Error("La verification d'integrite n'est pas disponible.");
    return envelopperReponse(await this.verifierIntegriteEntree(enrichirTenant({ idAuditEntry: id }, contexte)), contexte, startedAt);
  }

  public async integritePlage(
    requete: AuditHttpRequest<Record<string, unknown>>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    if (!this.verifierIntegritePlage) throw new Error("La verification d'integrite n'est pas disponible.");
    const source = requete.body ?? {};
    const limite = typeof source.limite === 'number' ? source.limite : 100;
    if (!Number.isInteger(limite) || limite < 1 || limite > 1_000) throw new Error('La limite doit etre comprise entre 1 et 1000.');
    const payload = enrichirTenant({
      dateDebut: typeof source.dateDebut === 'string' ? source.dateDebut : undefined,
      dateFin: typeof source.dateFin === 'string' ? source.dateFin : undefined,
      organisationId: typeof source.organisationId === 'string' ? source.organisationId : undefined,
      ecoleId: typeof source.ecoleId === 'string' ? source.ecoleId : undefined,
      limite,
    }, contexte);
    return envelopperReponse(await this.verifierIntegritePlage(payload), contexte, startedAt);
  }
}
