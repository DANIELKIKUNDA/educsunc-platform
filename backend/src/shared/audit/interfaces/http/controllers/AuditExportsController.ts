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
    private readonly supprimerExport: ((
      exportId: string,
      contexte: ReturnType<typeof extraireContexteRuntime>,
    ) => Promise<void>) | undefined = undefined,
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
      AuditExportPresenter.presenterStatut(
        identifiant.exportId,
        String((sortie as { statut?: string }).statut ?? 'INCONNU'),
        sortie as Record<string, unknown>,
      ),
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

  public async preparerFichier(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<{ nomFichier: string; mimeType: string; cheminPrive: string; tailleOctets: number }> {
    const contexte = extraireContexteRuntime(requete);
    const identifiant = AuditExportDownloadValidator.valider(requete.params);
    if (!this.telechargerExport) throw new Error("Le telechargement des exports n'est pas disponible.");
    return this.telechargerExport(identifiant.exportId, contexte) as Promise<{
      nomFichier: string;
      mimeType: string;
      cheminPrive: string;
      tailleOctets: number;
    }>;
  }

  public async supprimer(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<{ exportId: string; supprime: true }>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const identifiant = AuditExportDownloadValidator.valider(requete.params);
    if (!this.supprimerExport) throw new Error("La suppression des exports n'est pas disponible.");
    await this.supprimerExport(identifiant.exportId, contexte);
    return envelopperReponse({ exportId: identifiant.exportId, supprime: true }, contexte, startedAt);
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
      demandeurId: contexte.utilisateurId,
      scope: contexte.authorizedScope,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      requestId: contexte.requestId,
      correlationId: contexte.correlationId,
      idempotencyKey: this.lireCleIdempotence(requete.headers),
      filtres: {
        ...filtresTenant,
        modeOffline: contexte.modeOffline,
        deviceId: contexte.deviceId,
      },
    });
    return envelopperReponse(AuditExportPresenter.presenter(sortie as never), contexte, startedAt);
  }

  private lireCleIdempotence(headers: AuditHttpRequest['headers']): string | undefined {
    const valeur = headers?.['idempotency-key'];
    const cle = Array.isArray(valeur) ? valeur[0] : valeur;
    if (cle === undefined) return undefined;
    const normalisee = cle.trim();
    if (!/^[A-Za-z0-9:_-]{8,160}$/.test(normalisee)) {
      throw new Error("La cle d'idempotence de l'export est invalide.");
    }
    return normalisee;
  }
}
