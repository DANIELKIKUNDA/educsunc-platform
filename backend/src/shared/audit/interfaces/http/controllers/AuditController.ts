import type { SearchAuditQuery, AuditTimelineQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditDetailValidator, AuditHistoryValidator, AuditListValidator, AuditTimelineValidator } from '../validators';
import { AuditPresenter } from '../presenters';

export class AuditController {
  public constructor(
    private readonly rechercherAudits: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly consulterAudit: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly obtenirTimelineAudit: AuditExecutable<AuditTimelineQuery, unknown>,
    private readonly consulterHistoriqueActeur: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly consulterHistoriqueRessource: AuditExecutable<SearchAuditQuery, unknown>,
  ) {}

  public async lister(
    requete: AuditHttpRequest<never, Record<string, unknown>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(this.rechercherAudits, enrichirTenant(AuditListValidator.valider(requete.query), contexte));
    return envelopperReponse(AuditPresenter.presenterListe(sortie as never), contexte, startedAt);
  }

  public async consulterParId(
    requete: AuditHttpRequest<never, { id?: string }, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(
      this.consulterAudit,
      enrichirTenant(AuditDetailValidator.valider(requete.params, requete.query), contexte),
    );
    return envelopperReponse(AuditPresenter.presenterDetail(sortie as never), contexte, startedAt);
  }

  public async obtenirTimeline(
    requete: AuditHttpRequest<never, Record<string, never>, AuditTimelineQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(
      this.obtenirTimelineAudit,
      enrichirTenant(AuditTimelineValidator.valider(requete.query), contexte),
    );
    return envelopperReponse(AuditPresenter.presenterTimeline(sortie as never), contexte, startedAt);
  }

  public async obtenirHistorique(
    requete: AuditHttpRequest<never, Record<string, never>, SearchAuditQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirTenant(AuditHistoryValidator.valider(requete.query), contexte);
    const dependance = query.ressourceId ? this.consulterHistoriqueRessource : this.consulterHistoriqueActeur;
    const sortie = await executerDependance(dependance, query);
    return envelopperReponse(AuditPresenter.presenterListe(sortie as never), contexte, startedAt);
  }
}
