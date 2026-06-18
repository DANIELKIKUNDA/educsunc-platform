import { EvenementDomaine } from '../../../domain/DomainEvent';
import {
  AdaptateurMonitoringNotification,
  CacheQuotasNotification,
  CollecteurMetriquesNotification,
  ConfigurationNotificationRuntime,
  ExecutantReplayNotification,
  ExecutantRetryNotification,
  FileDeadLetterNotifications,
  FileEscaladeNotifications,
  FileNotifications,
  FileReplayNotifications,
  FileRetryNotifications,
  GardeIsolationTenantNotification,
  GestionCycleVieStockageNotifications,
  PlanificateurArchivageNotifications,
  PlanificateurExpirationNotifications,
  PlanificateurNotifications,
  ProviderNotificationEmail,
  ProviderNotificationInApp,
  RecuperationDeadLetterNotifications,
  RecuperationProvidersNotifications,
  RecuperationQueuesNotifications,
  RecuperationStockageNotifications,
  RecuperationTenantNotifications,
  RegistreFilesNotifications,
  RegistreNotificationsMemoire,
  RegistreProvidersNotification,
  RegulateurRateLimitingNotification,
  RegulateurReplayNotification,
  RegulateurRetryNotification,
  RegulateurThrottlingNotification,
  StockageActifNotifications,
  StockageArchiveNotifications,
  StockageChronologieNotification,
  StockageForensicNotifications,
  StockageReplayNotification,
  StockageReplayNotifications,
  SurveillanceProvidersNotification,
  SurveillanceQueuesNotification,
  WorkerArchivageNotification,
  WorkerCleanupNotification,
  WorkerDiffusionNotification,
  WorkerEscaladeNotification,
  WorkerRecoveryNotification,
  WorkerReplayNotification,
  WorkerRetryNotification,
  InitialiseurRuntimeNotifications,
  type DependancesFabriqueRuntimeNotifications,
  type ComposantsRuntimeNotifications,
} from 'shared/notifications';

// Ce fichier centralise le cablage reutilisable des tests Notifications.

/** Cette classe de test permet de fabriquer rapidement de faux evenements integrables. */
export class EvenementNotificationsTest extends EvenementDomaine {
  /** Ce constructeur affecte librement des proprietes metier a un evenement de test. */
  constructor(typeEvenement: string, proprietes: Readonly<Record<string, unknown>> = {}) {
    super(typeEvenement);
    Object.assign(this, proprietes);
  }
}

/** Cette interface regroupe les composants utiles d'un environnement de test Notifications. */
export interface EnvironnementNotificationsTest {
  readonly registreNotificationsMemoire: RegistreNotificationsMemoire;
  readonly registreFilesNotifications: RegistreFilesNotifications;
  readonly registreProvidersNotification: RegistreProvidersNotification;
  readonly adaptateurMonitoringNotification: AdaptateurMonitoringNotification;
  readonly configurationNotificationRuntime: ConfigurationNotificationRuntime;
  readonly cacheQuotasNotification: CacheQuotasNotification;
  readonly planificateurNotifications: PlanificateurNotifications;
  readonly planificateurExpirationNotifications: PlanificateurExpirationNotifications;
  readonly planificateurArchivageNotifications: PlanificateurArchivageNotifications;
  readonly regulateurThrottlingNotification: RegulateurThrottlingNotification;
  readonly regulateurRateLimitingNotification: RegulateurRateLimitingNotification;
  readonly fileNotifications: FileNotifications;
  readonly fileRetryNotifications: FileRetryNotifications;
  readonly fileReplayNotifications: FileReplayNotifications;
  readonly fileEscaladeNotifications: FileEscaladeNotifications;
  readonly fileDeadLetterNotifications: FileDeadLetterNotifications;
  readonly stockageChronologieNotification: StockageChronologieNotification;
  readonly stockageReplayNotification: StockageReplayNotification;
  readonly stockageActifNotifications: StockageActifNotifications;
  readonly stockageArchiveNotifications: StockageArchiveNotifications;
  readonly stockageForensicNotifications: StockageForensicNotifications;
  readonly stockageReplayNotifications: StockageReplayNotifications;
  readonly gestionCycleVieStockageNotifications: GestionCycleVieStockageNotifications;
  readonly recuperationQueuesNotifications: RecuperationQueuesNotifications;
  readonly recuperationStockageNotifications: RecuperationStockageNotifications;
  readonly recuperationProvidersNotifications: RecuperationProvidersNotifications;
  readonly recuperationTenantNotifications: RecuperationTenantNotifications;
  readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications;
  readonly workerDiffusionNotification: WorkerDiffusionNotification;
  readonly workerRetryNotification: WorkerRetryNotification;
  readonly workerReplayNotification: WorkerReplayNotification;
  readonly workerEscaladeNotification: WorkerEscaladeNotification;
  readonly workerArchivageNotification: WorkerArchivageNotification;
  readonly workerCleanupNotification: WorkerCleanupNotification;
  readonly workerRecoveryNotification: WorkerRecoveryNotification;
}

/** Cette classe centralise les helpers de creation d'environnements de test. */
export class NotificationsTestSupport {
  /** Cette methode cree un environnement complet et local pour les tests Notifications. */
  public static creerEnvironnement(): EnvironnementNotificationsTest {
    const registreNotificationsMemoire = new RegistreNotificationsMemoire();
    const registreFilesNotifications = new RegistreFilesNotifications();
    const registreProvidersNotification = new RegistreProvidersNotification();
    registreProvidersNotification.enregistrer(new ProviderNotificationInApp());
    registreProvidersNotification.enregistrer(new ProviderNotificationEmail());

    const collecteurMetriquesNotification = new CollecteurMetriquesNotification();
    const surveillanceQueuesNotification = new SurveillanceQueuesNotification(registreFilesNotifications);
    const surveillanceProvidersNotification = new SurveillanceProvidersNotification(
      registreProvidersNotification,
    );
    const adaptateurMonitoringNotification = new AdaptateurMonitoringNotification(
      collecteurMetriquesNotification,
      surveillanceQueuesNotification,
      surveillanceProvidersNotification,
    );

    const configurationNotificationRuntime = new ConfigurationNotificationRuntime();
    const cacheQuotasNotification = new CacheQuotasNotification();
    const planificateurNotifications = new PlanificateurNotifications(adaptateurMonitoringNotification);
    const planificateurExpirationNotifications = new PlanificateurExpirationNotifications(
      planificateurNotifications,
      configurationNotificationRuntime,
      adaptateurMonitoringNotification,
    );
    const planificateurArchivageNotifications = new PlanificateurArchivageNotifications(
      planificateurNotifications,
      configurationNotificationRuntime,
      adaptateurMonitoringNotification,
    );
    const regulateurThrottlingNotification = new RegulateurThrottlingNotification(
      cacheQuotasNotification,
      configurationNotificationRuntime,
    );
    const regulateurRateLimitingNotification = new RegulateurRateLimitingNotification();

    const fileNotifications = new FileNotifications(registreFilesNotifications);
    const fileRetryNotifications = new FileRetryNotifications(registreFilesNotifications);
    const fileReplayNotifications = new FileReplayNotifications(registreFilesNotifications);
    const fileEscaladeNotifications = new FileEscaladeNotifications(registreFilesNotifications);
    const fileDeadLetterNotifications = new FileDeadLetterNotifications(registreFilesNotifications);

    const stockageChronologieNotification = new StockageChronologieNotification(registreNotificationsMemoire);
    const stockageReplayNotification = new StockageReplayNotification();
    const stockageActifNotifications = new StockageActifNotifications();
    const stockageArchiveNotifications = new StockageArchiveNotifications();
    const stockageForensicNotifications = new StockageForensicNotifications();
    const stockageReplayNotifications = new StockageReplayNotifications();
    const gestionCycleVieStockageNotifications = new GestionCycleVieStockageNotifications(
      stockageActifNotifications,
      stockageArchiveNotifications,
      stockageForensicNotifications,
      stockageReplayNotifications,
    );

    const recuperationQueuesNotifications = new RecuperationQueuesNotifications(registreFilesNotifications);
    const recuperationStockageNotifications = new RecuperationStockageNotifications(
      gestionCycleVieStockageNotifications,
    );
    const recuperationProvidersNotifications = new RecuperationProvidersNotifications(
      registreProvidersNotification.listerTous(),
    );
    const recuperationTenantNotifications = new RecuperationTenantNotifications(
      new GardeIsolationTenantNotification(),
    );
    const recuperationDeadLetterNotifications = new RecuperationDeadLetterNotifications(
      fileDeadLetterNotifications,
      fileReplayNotifications,
    );

    const regulateurRetryNotification = new RegulateurRetryNotification(fileRetryNotifications);
    const regulateurReplayNotification = new RegulateurReplayNotification(fileReplayNotifications);
    const executantRetryNotification = new ExecutantRetryNotification(
      fileRetryNotifications,
      regulateurRetryNotification,
      adaptateurMonitoringNotification,
    );
    const executantReplayNotification = new ExecutantReplayNotification(
      fileReplayNotifications,
      regulateurReplayNotification,
      stockageReplayNotification,
      stockageChronologieNotification,
      adaptateurMonitoringNotification,
    );

    const workerDiffusionNotification = new WorkerDiffusionNotification(
      fileNotifications,
      registreNotificationsMemoire,
      registreProvidersNotification,
      fileDeadLetterNotifications,
      adaptateurMonitoringNotification,
    );
    const workerRetryNotification = new WorkerRetryNotification(executantRetryNotification);
    const workerReplayNotification = new WorkerReplayNotification(executantReplayNotification);
    const workerEscaladeNotification = new WorkerEscaladeNotification(
      fileEscaladeNotifications,
      fileNotifications,
      fileDeadLetterNotifications,
      adaptateurMonitoringNotification,
    );
    const workerArchivageNotification = new WorkerArchivageNotification(
      registreNotificationsMemoire,
      stockageReplayNotification,
      gestionCycleVieStockageNotifications,
      stockageArchiveNotifications,
      adaptateurMonitoringNotification,
    );
    const workerCleanupNotification = new WorkerCleanupNotification(
      recuperationQueuesNotifications,
      adaptateurMonitoringNotification,
    );
    const workerRecoveryNotification = new WorkerRecoveryNotification(
      recuperationQueuesNotifications,
      recuperationStockageNotifications,
      recuperationProvidersNotifications,
      recuperationDeadLetterNotifications,
      adaptateurMonitoringNotification,
    );

    return {
      registreNotificationsMemoire,
      registreFilesNotifications,
      registreProvidersNotification,
      adaptateurMonitoringNotification,
      configurationNotificationRuntime,
      cacheQuotasNotification,
      planificateurNotifications,
      planificateurExpirationNotifications,
      planificateurArchivageNotifications,
      regulateurThrottlingNotification,
      regulateurRateLimitingNotification,
      fileNotifications,
      fileRetryNotifications,
      fileReplayNotifications,
      fileEscaladeNotifications,
      fileDeadLetterNotifications,
      stockageChronologieNotification,
      stockageReplayNotification,
      stockageActifNotifications,
      stockageArchiveNotifications,
      stockageForensicNotifications,
      stockageReplayNotifications,
      gestionCycleVieStockageNotifications,
      recuperationQueuesNotifications,
      recuperationStockageNotifications,
      recuperationProvidersNotifications,
      recuperationTenantNotifications,
      recuperationDeadLetterNotifications,
      workerDiffusionNotification,
      workerRetryNotification,
      workerReplayNotification,
      workerEscaladeNotification,
      workerArchivageNotification,
      workerCleanupNotification,
      workerRecoveryNotification,
    };
  }

  /** Cette methode construit les dependances necessaires a l'initialiseur runtime officiel. */
  public static creerDependancesRuntime(
    environnement: EnvironnementNotificationsTest,
  ): DependancesFabriqueRuntimeNotifications {
    return {
      adaptateurMonitoringNotification: environnement.adaptateurMonitoringNotification,
      planificateurNotifications: environnement.planificateurNotifications,
      planificateurExpirationNotifications: environnement.planificateurExpirationNotifications,
      planificateurArchivageNotifications: environnement.planificateurArchivageNotifications,
      regulateurThrottlingNotification: environnement.regulateurThrottlingNotification,
      regulateurRateLimitingNotification: environnement.regulateurRateLimitingNotification,
      recuperationQueuesNotifications: environnement.recuperationQueuesNotifications,
      recuperationStockageNotifications: environnement.recuperationStockageNotifications,
      recuperationProvidersNotifications: environnement.recuperationProvidersNotifications,
      recuperationTenantNotifications: environnement.recuperationTenantNotifications,
      recuperationDeadLetterNotifications: environnement.recuperationDeadLetterNotifications,
      workerDiffusionNotification: environnement.workerDiffusionNotification,
      workerRetryNotification: environnement.workerRetryNotification,
      workerReplayNotification: environnement.workerReplayNotification,
      workerEscaladeNotification: environnement.workerEscaladeNotification,
      workerArchivageNotification: environnement.workerArchivageNotification,
      workerCleanupNotification: environnement.workerCleanupNotification,
      workerRecoveryNotification: environnement.workerRecoveryNotification,
    };
  }

  /** Cette methode initialise directement le runtime complet a partir d'un environnement de test. */
  public static initialiserRuntime(
    environnement: EnvironnementNotificationsTest,
  ): ComposantsRuntimeNotifications {
    return new InitialiseurRuntimeNotifications().initialiser(
      this.creerDependancesRuntime(environnement),
    );
  }
}
