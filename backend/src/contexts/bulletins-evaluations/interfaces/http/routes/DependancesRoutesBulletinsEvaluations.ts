import type {
  AuditBulletinController,
  BulletinsController,
  ClassementsController,
  ConduiteApplicationController,
  EncodageCotesController,
  ExportsBulletinController,
  FichesCotationController,
  HealthBulletinController,
  HistoriqueBulletinController,
  MigrationBulletinController,
  ProclamationsController,
  ResultatsBulletinController,
  StatistiquesBulletinController,
  SynchronisationOfflineController,
  SyntheseResultatsController,
} from '../controllers';
import type { ContexteTenant } from 'shared/tenancy/TenantContext';

// Cette interface regroupe toutes les dependances necessaires aux routes HTTP du BC.
export interface DependancesRoutesBulletinsEvaluationsDocument {
  encodageCotesController: EncodageCotesController;
  fichesCotationController: FichesCotationController;
  resultatsBulletinController: ResultatsBulletinController;
  classementsController: ClassementsController;
  bulletinsController: BulletinsController;
  proclamationsController: ProclamationsController;
  syntheseResultatsController: SyntheseResultatsController;
  conduiteApplicationController: ConduiteApplicationController;
  migrationBulletinController: MigrationBulletinController;
  synchronisationOfflineController: SynchronisationOfflineController;
  auditBulletinController: AuditBulletinController;
  statistiquesBulletinController: StatistiquesBulletinController;
  exportsBulletinController: ExportsBulletinController;
  historiqueBulletinController: HistoriqueBulletinController;
  healthBulletinController: HealthBulletinController;
  contexteTenant?: ContexteTenant;
}
