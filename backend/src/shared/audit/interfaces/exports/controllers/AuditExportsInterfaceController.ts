import type { AuditHttpControllerResponse, AuditHttpRequest } from '../../http/controllers';
import { AuditExportsController } from '../../http/controllers';
import { extraireContexteRuntime, envelopperReponse } from '../../http/controllers/AuditControllerSupport';
import { AuditExportDownloadPolicy } from '../download/AuditExportDownloadPolicy';
import { AuditExportExpirationInterface } from '../expiration/AuditExportExpirationInterface';
import { AuditForensicExportInterface } from '../forensic/AuditForensicExportInterface';
import { AuditExportMonitoringInterface } from '../monitoring/AuditExportMonitoringInterface';
import { AuditExportsInterfacePresenter } from '../presenters';
import { AuditExportRecoveryInterface } from '../recovery/AuditExportRecoveryInterface';
import { AuditExportSecurityInterface } from '../security/AuditExportSecurityInterface';
import { AuditExportTrackingInterface } from '../tracking/AuditExportTrackingInterface';
import type {
  AuditExportMonitoringDto,
  AuditExportStatusDto,
} from '../dto';
import { AuditExportsInterfaceValidators } from '../validators';

// Ce controller expose la facade externe specialisee du sous-systeme d exports Audit.
export class AuditExportsInterfaceController {
  constructor(
    private readonly httpController: AuditExportsController,
    private readonly annulerExport?: (exportId: string, raison?: string) => Promise<void>,
    private readonly expirerExport?: (exportId: string) => Promise<void>,
    private readonly superviserExports?: () => Promise<Partial<AuditExportMonitoringDto>>,
    private readonly restaurerExport?: (exportId: string) => Promise<void>,
  ) {}

  public async demanderExport(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const corps = AuditExportsInterfaceValidators.validerDemandeExport(requete.body);
    const typeExport = corps.typeExport;
    if (AuditExportSecurityInterface.estCritique(corps)) {
      return this.httpController.exporterForensicAudit({ ...requete, body: corps });
    }

    if (typeExport === 'ANALYTICS') {
      return this.httpController.exporterAnalyticsAudit({ ...requete, body: corps });
    }

    return this.httpController.exporterAudit({ ...requete, body: corps });
  }

  public async suivreStatut(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const sortie = await this.httpController.obtenirStatut(requete);
    return sortie;
  }

  public async telecharger(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const { exportId } = AuditExportsInterfaceValidators.validerIdentifiant(requete.params);
    const sortie = await this.httpController.telecharger(requete);
    const telechargement = String(
      (((sortie.donnee as { data?: { telechargement?: string } }).data)?.telechargement) ?? 'INDISPONIBLE',
    );
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterTelechargement(
        AuditExportDownloadPolicy.creer(exportId, telechargement),
      ),
      contexte,
      startedAt,
    );
  }

  public async annuler(
    requete: AuditHttpRequest<unknown, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = AuditExportsInterfaceValidators.validerAnnulation(requete.params, requete.body);
    await this.annulerExport?.(commande.exportId, commande.raison);
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterAnnulation(commande),
      contexte,
      startedAt,
    );
  }

  public async expirer(
    requete: AuditHttpRequest<unknown, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = AuditExportsInterfaceValidators.validerExpiration(requete.params, requete.body);
    await this.expirerExport?.(commande.exportId);
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterExpiration(
        AuditExportExpirationInterface.creer(commande.exportId, commande.expirationAt),
      ),
      contexte,
      startedAt,
    );
  }

  public async tracking(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const statutSortie = await this.httpController.obtenirStatut(requete);
    const { exportId } = AuditExportsInterfaceValidators.validerIdentifiant(requete.params);
    const statut = String((((statutSortie.donnee as { data?: { statut?: string } }).data)?.statut) ?? 'INCONNU');
    const tracking = AuditExportTrackingInterface.creer(exportId, statut, {
      requestId: contexte.requestId,
      correlationId: contexte.correlationId,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      utilisateurId: contexte.utilisateurId,
    });
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterTracking(tracking),
      contexte,
      startedAt,
    );
  }

  public async monitoring(
    requete: AuditHttpRequest,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const supervision = await this.superviserExports?.();
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterMonitoring(
        AuditExportMonitoringInterface.creer(supervision),
      ),
      contexte,
      startedAt,
    );
  }

  public async restaurer(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const commande = AuditExportsInterfaceValidators.validerRestauration(requete.params);
    await this.restaurerExport?.(commande.exportId);
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterRecovery(
        AuditExportRecoveryInterface.creer(commande.exportId),
      ),
      contexte,
      startedAt,
    );
  }

  public async statutForensic(
    requete: AuditHttpRequest<never, { id?: string }>,
  ): Promise<AuditHttpControllerResponse<unknown>> {
    const startedAt = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const { exportId } = AuditExportsInterfaceValidators.validerIdentifiant(requete.params);
    const statut: AuditExportStatusDto = {
      exportId,
      status: 'EN_COURS',
      correlationId: contexte.correlationId,
    };
    const tracking = AuditForensicExportInterface.renforcer(
      AuditExportTrackingInterface.creer(exportId, statut.status, {
        correlationId: contexte.correlationId,
        requestId: contexte.requestId,
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
        utilisateurId: contexte.utilisateurId,
      }),
    );
    return envelopperReponse(
      AuditExportsInterfacePresenter.presenterTracking(tracking),
      contexte,
      startedAt,
    );
  }
}

