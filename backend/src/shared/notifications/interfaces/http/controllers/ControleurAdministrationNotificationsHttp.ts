import type {
  ObtenirArchivesNotifications,
  ObtenirTenantNotifications,
  ObtenirTraceEscaladeNotification,
  RequeteArchivesNotifications,
  RequeteTenantNotifications,
  RequeteTraceEscaladeNotification,
} from '../../../application';
import {
  executerDependance,
  enrichirContexte,
  envelopperReponse,
  extraireContexteRuntime,
} from './NotificationsControllerSupport';
import type { ReponseControleurHttpNotifications, RequeteHttpNotifications } from './HttpNotificationsControllerTypes';
import { PresentateurHttpAdministrationNotifications } from '../presenters';

// Ce fichier declare le controller HTTP d'administration Notifications.

/** Cette classe expose les endpoints HTTP d'exploitation et d'administration du module. */
export class ControleurAdministrationNotificationsHttp {
  /** Ce constructeur assemble les cas d'usage admin du module. */
  constructor(
    private readonly obtenirArchivesNotifications: ObtenirArchivesNotifications,
    private readonly obtenirTenantNotifications: ObtenirTenantNotifications,
    private readonly obtenirTraceEscaladeNotification: ObtenirTraceEscaladeNotification,
  ) {}

  /** Cette methode retourne la vue paginee des archives Notifications. */
  public async obtenirArchives(
    requete: RequeteHttpNotifications<never, Record<string, never>, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpAdministrationNotifications.presenterArchives>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      {
        page: typeof requete.query?.page === 'number' ? requete.query.page : Number(requete.query?.page ?? 1),
        taillePage:
          typeof requete.query?.taillePage === 'number'
            ? requete.query.taillePage
            : Number(requete.query?.taillePage ?? 20),
        dateDebutArchivage:
          typeof requete.query?.dateDebutArchivage === 'string'
            ? new Date(requete.query.dateDebutArchivage)
            : undefined,
        dateFinArchivage:
          typeof requete.query?.dateFinArchivage === 'string'
            ? new Date(requete.query.dateFinArchivage)
            : undefined,
      },
      contexte,
    ) as RequeteArchivesNotifications;
    const sortie = await executerDependance(this.obtenirArchivesNotifications, query);
    return envelopperReponse(
      PresentateurHttpAdministrationNotifications.presenterArchives(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne la vue consolidee d'un tenant Notifications. */
  public async obtenirVueTenant(
    requete: RequeteHttpNotifications<never, Record<string, never>, Record<string, unknown>>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpAdministrationNotifications.presenterTenant>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      {
        organisationId: requete.query?.organisationId,
        ecoleId: requete.query?.ecoleId,
        inclureArchives: requete.query?.inclureArchives === 'true',
        inclureDeadLetters: requete.query?.inclureDeadLetters === 'true',
        inclureMonitoring: requete.query?.inclureMonitoring === 'true',
      },
      contexte,
    ) as RequeteTenantNotifications;
    const sortie = await executerDependance(this.obtenirTenantNotifications, query);
    return envelopperReponse(
      PresentateurHttpAdministrationNotifications.presenterTenant(sortie),
      contexte,
      commenceLe,
    );
  }

  /** Cette methode retourne l'historique d'escalade d'une notification. */
  public async obtenirTraceEscalade(
    requete: RequeteHttpNotifications<never, { id?: string }>,
  ): Promise<ReponseControleurHttpNotifications<ReturnType<typeof PresentateurHttpAdministrationNotifications.presenterTraceEscalade>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteRuntime(requete);
    const query = enrichirContexte(
      {
        identifiantNotification: requete.params?.id,
      },
      contexte,
    ) as RequeteTraceEscaladeNotification;
    const sortie = await executerDependance(this.obtenirTraceEscaladeNotification, query);
    return envelopperReponse(
      PresentateurHttpAdministrationNotifications.presenterTraceEscalade(sortie),
      contexte,
      commenceLe,
    );
  }
}
