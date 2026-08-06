import type { AuditExportQuery } from 'shared/audit/application';
import { enrichirTenant, executerDependance, envelopperReponse, extraireContexteRuntime } from './AuditControllerSupport';
import type { AuditExecutable, AuditHttpControllerResponse, AuditHttpRequest } from './HttpAuditControllerTypes';
import {
  AuditExportDownloadValidator,
  AuditExportRequestValidator,
  AuditExportStatusValidator,
} from '../validators';
import { AuditExportPresenter } from '../presenters';

export class AuditExportsController {
  public constructor(
    private readonly exporterAudits: AuditExecutable<AuditExportQuery, unknown>,
    private readonly exporterForensic: AuditExecutable<AuditExportQuery, unknown>,
    private readonly exporterAnalytics: AuditExecutable<AuditExportQuery, unknown>,
    private readonly exporterSecurite: AuditExecutable<AuditExportQuery, unknown>,
    private readonly obtenirStatutExport: ((
      exportId: string,
      contexte: ReturnType<typeof extraireContexteRuntime>,
    ) => Promise<unknown>) | undefined = undefined,
    private readonly telechargerExport: ((
      exportId: string,
      contexte: ReturnType<typeof extraireContexteRuntime>,
    ) => Promise<unknown>) | undefined = undefined,
  ) {}

  public async exporterAudit(
    requete: AuditHttpRequest<AuditExportQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.exporterAudits, requete, AuditExportRequestValidator.valider(requete.body));
  }

  public async exporterForensicAudit(
    requete: AuditHttpRequest<AuditExportQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.exporterForensic, requete, AuditExportRequestValidator.valider(requete.body));
  }

  public async exporterAnalyticsAudit(
    requete: AuditHttpRequest<AuditExportQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.exporterAnalytics, requete, AuditExportRequestValidator.valider(requete.body));
  }

  public async exporterAuditSecurite(
    requete: AuditHttpRequest<AuditExportQuery>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    return this.executer(this.exporterSecurite, requete, AuditExportRequestValidator.valider(requete.body));
  }

  public async obtenirStatut(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const identifiant = AuditExportStatusValidator.valider(requete.params);
    const sortie = this.obtenirStatutExport
      ? await this.obtenirStatutExport(identifiant.exportId, contexte)
      : { exportId: identifiant.exportId, statut: 'INCONNU' };
    return envelopperReponse(
      AuditExportPresenter.presenterStatut(identifiant.exportId, String((sortie as { statut?: string }).statut ?? 'INCONNU')),
      contexte,
      startedAt,
    );
  }

  public async telecharger(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const identifiant = AuditExportDownloadValidator.valider(requete.params);
    const sortie = this.telechargerExport
      ? await this.telechargerExport(identifiant.exportId, contexte)
      : { exportId: identifiant.exportId, telechargement: 'INDISPONIBLE' };
    return envelopperReponse(
      AuditExportPresenter.presenterTelechargement(
        identifiant.exportId,
        String((sortie as { telechargement?: string }).telechargement ?? 'INDISPONIBLE'),
      ),
      contexte,
      startedAt,
    );
  }

  private async executer(
    dependance: AuditExecutable<AuditExportQuery, unknown>,
    requete: AuditHttpRequest,
    body: AuditExportQuery,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const filtresTenant = enrichirTenant(body.filtres ?? {}, contexte);
    const sortie = await executerDependance(dependance, {
      ...body,
      filtres: {
        ...filtresTenant,
        correlationId: contexte.correlationId,
        modeOffline: contexte.modeOffline,
        deviceId: contexte.deviceId,
      },
    });
    return envelopperReponse(AuditExportPresenter.presenter(sortie as never), contexte, startedAt);
  }
}
