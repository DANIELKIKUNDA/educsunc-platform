import type { DependancesRoutesNotifications } from '../../shared/notifications';
import {
  AccuserReceptionNotification,
  AdaptateurMonitoringNotification,
  CanalSseNotificationFutur,
  CanalWebSocketNotificationFutur,
  CollecteurMetriquesNotification,
  ConfigurationNotificationRuntime,
  ControleurAdministrationNotificationsHttp,
  ControleurMonitoringNotificationsHttp,
  ControleurNotificationsHttp,
  ControleurReplayNotificationHttp,
  ControleurRetryNotificationHttp,
  ControleurTempsReelNotificationFuturHttp,
  ControlerRetryNotification,
  CreerNotification,
  DepotLectureNotificationsMemoire,
  DepotModelesNotificationsMemoire,
  DepotNotificationsMemoire,
  DepotPreferencesNotificationsMemoire,
  DiffuseurTempsReelNotification,
  EscaladerNotification,
  FileEscaladeNotifications,
  FileNotifications,
  FileReplayNotifications,
  FileRetryNotifications,
  ListerNotifications,
  ObtenirArchivesNotifications,
  ObtenirChronologieNotification,
  ObtenirDeadLettersNotifications,
  ObtenirDetailsNotification,
  ObtenirDiagnosticReplayNotification,
  ObtenirHistoriqueRetriesNotification,
  ObtenirMonitoringNotifications,
  ObtenirTenantNotifications,
  ObtenirTraceEscaladeNotification,
  OrchestrateurCreationNotification,
  OrchestrateurEscaladeNotification,
  OrchestrateurMonitoringNotification,
  OrchestrateurReplayNotification,
  OrchestrateurRetryNotification,
  OrchestrateurTempsReelNotification,
  ProviderNotificationEmail,
  ProviderNotificationInApp,
  RegistreFilesNotifications,
  RegistreNotificationsMemoire,
  RegistreProvidersNotification,
  RejouerNotification,
  ServiceApplicationNotifications,
  SurveillanceProvidersNotification,
  SurveillanceQueuesNotification,
} from '../../shared/notifications';
import type { NotificationConfigurationChange } from '../../shared/notifications/integration/configuration';
import { NotificationsConfigurationIntegrationOrchestrator } from '../../shared/notifications/integration/configuration';
import type {
  CommandeCreerNotification,
  DtoCommandeCreationNotification,
} from '../../shared/notifications/application';
import { NotificationsBulletinsIntegrationOrchestrator } from '../../shared/notifications/integration/bulletins-evaluations/orchestration/NotificationsBulletinsIntegrationOrchestrator';
import { NotificationsPaiementsIntegrationOrchestrator } from '../../shared/notifications/integration/paiements-facturation/orchestration/NotificationsPaiementsIntegrationOrchestrator';
import { NotificationsScolariteIntegrationOrchestrator } from '../../shared/notifications/integration/scolarite-eleves/orchestration/NotificationsScolariteIntegrationOrchestrator';
import type {
  NotificationBulletinsIntegrationRequest,
} from '../../shared/notifications/integration/bulletins-evaluations/NotificationsBulletinsIntegrationTypes';
import type {
  NotificationPaiementsIntegrationRequest,
} from '../../shared/notifications/integration/paiements-facturation/NotificationsPaiementsIntegrationTypes';
import type {
  NotificationScolariteIntegrationRequest,
} from '../../shared/notifications/integration/scolarite-eleves/NotificationsScolariteIntegrationTypes';
import { obtenirSharedEventBus, reinitialiserSharedEventBus } from '../../shared/infrastructure/bus';
import type { SharedBusEventEnvelope, SharedBusEventHandler } from '../../shared/infrastructure/bus';

type PolitiqueScopeNotifications = 'ECOLE' | 'ORGANISATION' | 'PLATEFORME';

class NotificationsRuntimeFacade {
  private readonly registreNotificationsMemoire = new RegistreNotificationsMemoire();
  private readonly registreFilesNotifications = new RegistreFilesNotifications();
  private readonly registreProvidersNotification = new RegistreProvidersNotification();
  private readonly collecteurMetriquesNotification = new CollecteurMetriquesNotification();
  private readonly surveillanceQueuesNotification = new SurveillanceQueuesNotification(
    this.registreFilesNotifications,
  );
  private readonly surveillanceProvidersNotification = new SurveillanceProvidersNotification(
    this.registreProvidersNotification,
  );
  private readonly adaptateurMonitoringNotification = new AdaptateurMonitoringNotification(
    this.collecteurMetriquesNotification,
    this.surveillanceQueuesNotification,
    this.surveillanceProvidersNotification,
  );
  private readonly configurationNotificationRuntime = new ConfigurationNotificationRuntime();
  private readonly integrationConfigurationNotifications =
    new NotificationsConfigurationIntegrationOrchestrator({
      configurationNotificationRuntime: this.configurationNotificationRuntime,
    });
  private readonly depotNotifications = new DepotNotificationsMemoire(this.registreNotificationsMemoire);
  private readonly depotModelesNotifications = new DepotModelesNotificationsMemoire(
    this.registreNotificationsMemoire,
  );
  private readonly depotPreferencesNotifications = new DepotPreferencesNotificationsMemoire(
    this.registreNotificationsMemoire,
  );
  private readonly depotLectureNotifications = new DepotLectureNotificationsMemoire(
    this.registreNotificationsMemoire,
  );
  private readonly fileNotifications = new FileNotifications(this.registreFilesNotifications);
  private readonly fileRetryNotifications = new FileRetryNotifications(this.registreFilesNotifications);
  private readonly fileReplayNotifications = new FileReplayNotifications(this.registreFilesNotifications);
  private readonly fileEscaladeNotifications = new FileEscaladeNotifications(
    this.registreFilesNotifications,
  );
  private readonly diffuseurTempsReelNotification = new DiffuseurTempsReelNotification([
    new CanalWebSocketNotificationFutur(),
    new CanalSseNotificationFutur(),
  ]);
  private readonly clesIdempotenceNotifications = new Set<string>();
  private readonly auditPort = {
    async enregistrer() {},
  };
  private readonly idempotencePort = {
    estDejaTraitee: async (cle: string) => this.clesIdempotenceNotifications.has(cle),
    enregistrerTraitement: async (cle: string) => {
      this.clesIdempotenceNotifications.add(cle);
    },
  };
  private readonly serviceApplicationNotifications = new ServiceApplicationNotifications(
    this.depotNotifications,
    this.depotModelesNotifications,
    this.depotPreferencesNotifications,
    {
      async publier() {},
    },
  );
  private readonly creerNotificationUseCase = new CreerNotification(
    new OrchestrateurCreationNotification(
      this.serviceApplicationNotifications,
      this.fileNotifications,
      this.idempotencePort,
      this.adaptateurMonitoringNotification,
      this.auditPort,
      this.configurationNotificationRuntime,
    ),
  );
  private readonly integrationPaiements = new NotificationsPaiementsIntegrationOrchestrator();
  private readonly integrationBulletins = new NotificationsBulletinsIntegrationOrchestrator();
  private readonly integrationScolarite = new NotificationsScolariteIntegrationOrchestrator();
  public readonly routesDependances: DependancesRoutesNotifications;

  public constructor() {
    this.registreProvidersNotification.enregistrer(new ProviderNotificationInApp());
    this.registreProvidersNotification.enregistrer(new ProviderNotificationEmail());
    this.routesDependances = this.creerDependancesRoutes();
    this.enregistrerHandlersSharedBus();
  }

  public async appliquerConfiguration(
    changement: NotificationConfigurationChange,
  ): Promise<void> {
    await this.integrationConfigurationNotifications.appliquerChangement(changement);
  }

  public obtenirSnapshotConfiguration() {
    return this.integrationConfigurationNotifications.obtenirSnapshot();
  }

  private creerDependancesRoutes(): DependancesRoutesNotifications {
    return {
      controleurNotificationsHttp: new ControleurNotificationsHttp(
        this.creerNotificationUseCase,
        new ListerNotifications(this.depotLectureNotifications),
        new ObtenirDetailsNotification(this.depotLectureNotifications),
        new ObtenirChronologieNotification(this.depotLectureNotifications),
        new AccuserReceptionNotification(
          this.depotLectureNotifications,
          this.auditPort,
          this.adaptateurMonitoringNotification,
        ),
        new EscaladerNotification(
          new OrchestrateurEscaladeNotification(
            this.serviceApplicationNotifications,
            this.fileEscaladeNotifications,
            this.auditPort,
            this.adaptateurMonitoringNotification,
          ),
        ),
      ),
      controleurReplayNotificationHttp: new ControleurReplayNotificationHttp(
        new RejouerNotification(
          new OrchestrateurReplayNotification(
            this.serviceApplicationNotifications,
            this.fileReplayNotifications,
            this.auditPort,
            this.adaptateurMonitoringNotification,
          ),
        ),
        new ObtenirDiagnosticReplayNotification(this.depotLectureNotifications),
      ),
      controleurRetryNotificationHttp: new ControleurRetryNotificationHttp(
        new ControlerRetryNotification(
          new OrchestrateurRetryNotification(
            this.serviceApplicationNotifications,
            this.fileRetryNotifications,
            this.auditPort,
            this.adaptateurMonitoringNotification,
          ),
        ),
        new ObtenirHistoriqueRetriesNotification(this.depotLectureNotifications),
      ),
      controleurMonitoringNotificationsHttp: new ControleurMonitoringNotificationsHttp(
        new ObtenirMonitoringNotifications(
          new OrchestrateurMonitoringNotification(
            this.depotLectureNotifications,
            this.adaptateurMonitoringNotification,
          ),
        ),
        new ObtenirDeadLettersNotifications(this.depotLectureNotifications),
      ),
      controleurAdministrationNotificationsHttp: new ControleurAdministrationNotificationsHttp(
        new ObtenirArchivesNotifications(this.depotLectureNotifications),
        new ObtenirTenantNotifications(this.depotLectureNotifications),
        new ObtenirTraceEscaladeNotification(this.depotLectureNotifications),
      ),
      controleurTempsReelNotificationFuturHttp: new ControleurTempsReelNotificationFuturHttp(
        new OrchestrateurTempsReelNotification(
          this.diffuseurTempsReelNotification,
          this.adaptateurMonitoringNotification,
        ),
      ),
      middlewares: {
        auth: async (requete, reponse) => {
          if (!requete.context?.utilisateurId) {
            reponse.code(401).send({
              code: 'NOTIFICATIONS_AUTH_REQUIRED',
              message: 'Authentification requise.',
            });
          }
        },
        verifierPermission: async (permission, requete, reponse) => {
          if (reponse.sent) return;
          const permissions = requete.context?.permissions ?? [];
          if (!permissions.includes(permission)) {
            reponse.code(403).send({
              code: 'NOTIFICATIONS_PERMISSION_DENIED',
              message: `Permission requise: ${permission}`,
            });
          }
        },
        verifierScope: async (scope, requete, reponse) => {
          if (reponse.sent) return;
          if (acteurPorteScopeNotifications(requete, scope as PolitiqueScopeNotifications)) return;
          reponse.code(403).send({
            code: 'NOTIFICATIONS_SCOPE_DENIED',
            message: `Scope ${scope} requis.`,
          });
        },
        gererErreur: async (erreur) => {
          const message = erreur instanceof Error ? erreur.message : 'Erreur notifications.';
          const messageMinuscule = message.toLowerCase();
          if (messageMinuscule.includes('introuvable')) {
            return { statutHttp: 404, corps: { code: 'NOTIFICATIONS_NOT_FOUND', message } };
          }
          if (messageMinuscule.includes('interdit')) {
            return { statutHttp: 403, corps: { code: 'NOTIFICATIONS_FORBIDDEN', message } };
          }
          if (
            messageMinuscule.includes('obligatoire')
            || messageMinuscule.includes('invalide')
            || messageMinuscule.includes('compatible')
          ) {
            return { statutHttp: 400, corps: { code: 'NOTIFICATIONS_BAD_REQUEST', message } };
          }
          return { statutHttp: 500, corps: { code: 'NOTIFICATIONS_INTERNAL_ERROR', message } };
        },
      },
    };
  }

  private enregistrerHandlersSharedBus(): void {
    const bus = obtenirSharedEventBus();
    bus.enregistrer(this.creerHandlerPaiements());
    bus.enregistrer(this.creerHandlerBulletins());
    bus.enregistrer(this.creerHandlerScolarite());
  }

  private creerHandlerPaiements(): SharedBusEventHandler {
    return {
      eventNames: [
        'PaiementCree',
        'PaiementValide',
        'PaiementAnnule',
        'PaiementRembourse',
        'RecuPaiementEmis',
      ],
      handle: async (envelope) => {
        const intention = await this.integrationPaiements.traiterEvenement(
          this.construireRequetePaiements(envelope),
        );
        if (intention !== null) {
          await this.creerNotificationUseCase.executer(
            normaliserCommandeCreation(intention.intention),
          );
        }
      },
    };
  }

  private creerHandlerBulletins(): SharedBusEventHandler {
    return {
      eventNames: [
        'BulletinGenere',
        'BulletinValideOfficiellement',
        'BulletinVersionFigee',
        'ProclamationClasseGeneree',
        'CoteEncodee',
        'CoteModifiee',
        'ResultatBulletinRecalcule',
        'EleveMarqueNonClasse',
      ],
      handle: async (envelope) => {
        const intention = await this.integrationBulletins.traiterEvenement(
          this.construireRequeteBulletins(envelope),
        );
        if (intention !== null) {
          await this.creerNotificationUseCase.executer(
            normaliserCommandeCreation(intention.intention),
          );
        }
      },
    };
  }

  private creerHandlerScolarite(): SharedBusEventHandler {
    return {
      eventNames: [
        'InscriptionScolaireValidee',
        'EleveTransfere',
        'EleveAbandonne',
        'EleveReactive',
        'ClasseAffectationChangee',
        'EleveAffecteAClasse',
        'EleveSuspendu',
        'EleveCree',
      ],
      handle: async (envelope) => {
        const intention = await this.integrationScolarite.traiterEvenement(
          this.construireRequeteScolarite(envelope),
        );
        if (intention !== null) {
          await this.creerNotificationUseCase.executer(
            normaliserCommandeCreation(intention.intention),
          );
        }
      },
    };
  }

  private construireRequetePaiements(
    envelope: SharedBusEventEnvelope,
  ): NotificationPaiementsIntegrationRequest {
    return {
      evenement: envelope.payload as unknown as NotificationPaiementsIntegrationRequest['evenement'],
      organisationId: envelope.metadata.organisationId,
      ecoleId: envelope.metadata.ecoleId ?? this.extraireChamp(envelope.payload, 'idEcole'),
      acteurId: envelope.metadata.utilisateurId ?? this.extraireChamp(envelope.payload, 'declenchePar'),
    };
  }

  private construireRequeteBulletins(
    envelope: SharedBusEventEnvelope,
  ): NotificationBulletinsIntegrationRequest {
    return {
      evenement: envelope.payload as unknown as NotificationBulletinsIntegrationRequest['evenement'],
      organisationId: envelope.metadata.organisationId,
      ecoleId: envelope.metadata.ecoleId,
      acteurId: envelope.metadata.utilisateurId,
    };
  }

  private construireRequeteScolarite(
    envelope: SharedBusEventEnvelope,
  ): NotificationScolariteIntegrationRequest {
    return {
      evenement: envelope.payload as unknown as NotificationScolariteIntegrationRequest['evenement'],
    };
  }

  private extraireChamp(payload: Record<string, unknown>, cle: string): string | undefined {
    const valeur = payload[cle];
    return typeof valeur === 'string' ? valeur : undefined;
  }
}

function normaliserCommandeCreation(
  commande: DtoCommandeCreationNotification,
): CommandeCreerNotification {
  return {
    ...commande,
    datePlanification:
      typeof commande.datePlanification === 'string'
        ? new Date(commande.datePlanification)
        : undefined,
    dateExpiration:
      typeof commande.dateExpiration === 'string'
        ? new Date(commande.dateExpiration)
        : undefined,
  };
}

function acteurPorteScopeNotifications(requete: any, scope: PolitiqueScopeNotifications): boolean {
  const scopes = requete.context?.scopes ?? [];

  if (scope === 'PLATEFORME') {
    return scopes.some(
      (scopeAcces: any) => scopeAcces.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
    );
  }

  if (scope === 'ORGANISATION') {
    const organisationActiveId = requete.context?.organisationActiveId;
    return Boolean(
      organisationActiveId
      && scopes.some(
        (scopeAcces: any) =>
          scopeAcces.obtenirTypeScope().obtenirValeur() === 'ORGANISATION'
          && scopeAcces.obtenirValeurScope() === organisationActiveId,
      ),
    );
  }

  const ecoleActiveId = requete.context?.ecoleActiveId;
  return Boolean(
    ecoleActiveId
    && scopes.some(
      (scopeAcces: any) =>
        scopeAcces.obtenirTypeScope().obtenirValeur() === 'ECOLE'
        && scopeAcces.obtenirValeurScope() === ecoleActiveId,
    ),
  );
}

let runtimeNotifications: NotificationsRuntimeFacade | null = null;

export function obtenirNotificationsRuntime(): NotificationsRuntimeFacade {
  if (runtimeNotifications === null) {
    runtimeNotifications = new NotificationsRuntimeFacade();
  }
  return runtimeNotifications;
}

export function reinitialiserNotificationsRuntime(): void {
  runtimeNotifications = null;
  reinitialiserSharedEventBus();
}
