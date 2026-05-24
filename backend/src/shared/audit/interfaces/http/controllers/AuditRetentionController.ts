import type { SearchAuditQuery } from 'shared/audit/application';
import { executerDependance, enrichirTenant, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import { AuditRetentionCommandValidator, AuditRetentionStatusValidator } from '../validators';
import { AuditMonitoringPresenter, AuditRetentionPresenter } from '../presenters';

export class AuditRetentionController {
  public constructor(
    private readonly preparerArchivage: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly archiverAudits: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly consulterArchives: AuditExecutable<SearchAuditQuery, unknown>,
    private readonly purgerAudits: ((payload: SearchAuditQuery) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async preparer(requete: AuditHttpRequest<SearchAuditQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.preparerArchivage, requete, AuditRetentionCommandValidator.valider(requete.body ?? requete.query));
  }
  public async archiver(requete: AuditHttpRequest<SearchAuditQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.archiverAudits, requete, AuditRetentionCommandValidator.valider(requete.body ?? requete.query));
  }
  public async statut(requete: AuditHttpRequest<never, Record<string, unknown>, SearchAuditQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.consulterArchives, requete, AuditRetentionStatusValidator.valider(requete.query));
  }
  public async purge(requete: AuditHttpRequest<SearchAuditQuery>): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const payload = enrichirTenant(AuditRetentionCommandValidator.valider(requete.body ?? requete.query), contexte);
    const sortie = this.purgerAudits ? await this.purgerAudits(payload) : { accepte: true, payload };
    return envelopperReponse(AuditMonitoringPresenter.presenter(sortie), contexte, startedAt);
  }

  private async executer(
    dependance: AuditExecutable<SearchAuditQuery, unknown>,
    requete: AuditHttpRequest<SearchAuditQuery, Record<string, unknown>, SearchAuditQuery>,
    payload: SearchAuditQuery,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const sortie = await executerDependance(dependance, enrichirTenant(payload, contexte));
    return envelopperReponse(
      dependance === this.consulterArchives
        ? AuditRetentionPresenter.presenterStatut(sortie as never)
        : AuditRetentionPresenter.presenterAction(sortie as never),
      contexte,
      startedAt,
    );
  }
}
