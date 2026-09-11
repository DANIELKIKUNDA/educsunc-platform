import type { DependancesRoutesNotifications } from '../../shared/notifications';
import {
  AccuserReceptionNotification,
  AdaptateurMonitoringNotification,
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
  DepotLectureNotificationsPostgres,
  DepotModelesNotificationsMemoire,
  DepotNotificationsMemoire,
  DepotNotificationsPostgres,
  DepotNotificationsComposite,
  DepotPreferencesNotificationsMemoire,
  DiffuseurTempsReelNotification,
  EscaladerNotification,
  FileEscaladeNotificationsBullMq,
  FileNotificationsBullMq,
  FileReplayNotificationsBullMq,
  FileRetryNotificationsBullMq,
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
  ProviderNotificationSms,
  ProviderNotificationPush,
  RegistreNotificationsMemoire,
  RegistreProvidersNotification,
  RejouerNotification,
  ServiceApplicationNotifications,
  SurveillanceProvidersNotification,
  SurveillanceQueuesNotificationBullMq,
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
import { obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';
import type { SharedBusEventEnvelope, SharedBusEventHandler } from '../../shared/infrastructure/bus';

type PolitiqueScopeNotifications = 'ECOLE' | 'ORGANISATION' | 'PLATEFORME';
type VerificateurActivationNotifications = (contexte: {
  readonly organisationId: string;
  readonly ecoleId: string;
}) => Promise<boolean>;

class NotificationsRuntimeFacade {
  private readonly registreNotificationsMemoire = new RegistreNotificationsMemoire();
  private readonly registreProvidersNotification = new RegistreProvidersNotification();
  private readonly collecteurMetriquesNotification = new CollecteurMetriquesNotification();
  private readonly surveillanceProvidersNotification = new SurveillanceProvidersNotification(
    this.registreProvidersNotification,
  );
  private readonly configurationNotificationRuntime = new ConfigurationNotificationRuntime();
  private readonly integrationConfigurationNotifications =
    new NotificationsConfigurationIntegrationOrchestrator({
      configurationNotificationRuntime: this.configurationNotificationRuntime,
    });
  private readonly depotNotificationsMemoire = new DepotNotificationsMemoire(this.registreNotificationsMemoire);
  private readonly depotNotifications = new DepotNotificationsComposite(
    new DepotNotificationsPostgres(obtenirPoolPostgresAuth()),
    this.depotNotificationsMemoire,
  );
  private readonly depotModelesNotifications = new DepotModelesNotificationsMemoire(
    this.registreNotificationsMemoire,
  );
  private readonly depotPreferencesNotifications = new DepotPreferencesNotificationsMemoire(
    this.registreNotificationsMemoire,
  );
  private readonly depotLectureNotifications = new DepotLectureNotificationsPostgres(
    obtenirPoolPostgresAuth(),
  );
  private readonly fileNotifications = new FileNotificationsBullMq();
  private readonly fileRetryNotifications = new FileRetryNotificationsBullMq();
  private readonly fileReplayNotifications = new FileReplayNotificationsBullMq();
  private readonly fileEscaladeNotifications = new FileEscaladeNotificationsBullMq();
  private readonly surveillanceQueuesNotification = new SurveillanceQueuesNotificationBullMq({
    dispatch: this.fileNotifications,
    retry: this.fileRetryNotifications,
    replay: this.fileReplayNotifications,
    escalade: this.fileEscaladeNotifications,
  });
  private readonly adaptateurMonitoringNotification = new AdaptateurMonitoringNotification(
    this.collecteurMetriquesNotification,
    this.surveillanceQueuesNotification,
    this.surveillanceProvidersNotification,
  );
  private readonly diffuseurTempsReelNotification = new DiffuseurTempsReelNotification([]);
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
  private verifierActivationNotifications: VerificateurActivationNotifications = async () => false;
  public readonly routesDependances: DependancesRoutesNotifications;

  public constructor() {
    this.registreProvidersNotification.enregistrer(new ProviderNotificationInApp());
    this.registreProvidersNotification.enregistrer(new ProviderNotificationEmail());
    this.registreProvidersNotification.enregistrer(new ProviderNotificationSms());
    this.registreProvidersNotification.enregistrer(new ProviderNotificationPush());
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

  /** Injecte la resolution officielle des modules sans coupler Notifications a Configuration. */
  public configurerVerificationActivation(
    verifierActivationNotifications: VerificateurActivationNotifications,
  ): void {
    this.verifierActivationNotifications = verifierActivationNotifications;
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
          return { statutHttp: 500, corps: { code: 'NOTIFICATIONS_INTERNAL_ERROR', message: 'Erreur interne Notifications.' } };
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
        const requete = this.construireRequetePaiements(envelope);
        if (!await this.notificationAutomatiqueAutorisee(requete)) return;
        const intention = await this.integrationPaiements.traiterEvenement(requete);
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
        const requete = this.construireRequeteBulletins(envelope);
        if (!await this.notificationAutomatiqueAutorisee(requete)) return;
        const intention = await this.integrationBulletins.traiterEvenement(requete);
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
        const requete = this.construireRequeteScolarite(envelope);
        if (!await this.notificationAutomatiqueAutorisee({
          organisationId: requete.evenement.idOrganisation,
          ecoleId: requete.evenement.idEcole,
        })) return;
        const intention = await this.integrationScolarite.traiterEvenement(requete);
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
      organisationId: envelope.metadata.organisationId ?? this.extraireChamp(envelope.payload, 'idOrganisation'),
      ecoleId: envelope.metadata.ecoleId ?? this.extraireChamp(envelope.payload, 'idEcole'),
      acteurId: envelope.metadata.utilisateurId ?? this.extraireChamp(envelope.payload, 'declenchePar'),
    };
  }

  private construireRequeteBulletins(
    envelope: SharedBusEventEnvelope,
  ): NotificationBulletinsIntegrationRequest {
    return {
      evenement: envelope.payload as unknown as NotificationBulletinsIntegrationRequest['evenement'],
      organisationId: envelope.metadata.organisationId ?? this.extraireChamp(envelope.payload, 'idOrganisation'),
      ecoleId: envelope.metadata.ecoleId ?? this.extraireChamp(envelope.payload, 'idEcole'),
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

  private async notificationAutomatiqueAutorisee(contexte: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
  }): Promise<boolean> {
    if (!contexte.ecoleId) return true;
    if (!contexte.organisationId) return false;
    return this.verifierActivationNotifications({
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
    });
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
