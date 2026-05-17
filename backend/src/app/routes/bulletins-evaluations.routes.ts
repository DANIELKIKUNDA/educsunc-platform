import type { FastifyPluginAsync } from 'fastify';
import { JournaliseurPino } from 'shared/infrastructure/logger/PinoLogger';
import { ContexteTenant } from 'shared/tenancy/TenantContext';
import {
  AppliquerMigrationBulletinUseCase,
  ConsulterBulletinEleveUseCase,
  ConsulterClassementClasseUseCase,
  ConsulterFicheCotationUseCase,
  ConsulterHistoriqueBulletinUseCase,
  ConsulterProclamationClasseUseCase,
  ConsulterSyntheseResultatsUseCase,
  CorrigerCoteUseCase,
  DeclarerAbandonUseCase,
  DeclarerNonClasseUseCase,
  EncoderConduiteUseCase,
  EncoderCoteUseCase,
  GenererBulletinEleveUseCase,
  GenererMigrationBulletinUseCase,
  GenererProclamationClasseUseCase,
  GenererSyntheseResultatsEcoleUseCase,
  ModifierCoteUseCase,
  RecalculerClassementClasseUseCase,
  RecalculerResultatEleveUseCase,
  SynchroniserOperationsOfflineUseCase,
  ViderCoteUseCase,
} from '../../contexts/bulletins-evaluations/application/use-cases';
import { ServiceAuditBulletin } from '../../contexts/bulletins-evaluations/application/services/ServiceAuditBulletin';
import { ServiceSynchronisationOffline } from '../../contexts/bulletins-evaluations/application/services/ServiceSynchronisationOffline';
import {
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
} from '../../contexts/bulletins-evaluations/interfaces/http/controllers';
import {
  type DependancesRoutesBulletinsEvaluationsDocument,
  creerRoutesDocumentairesBulletinsEvaluations,
} from '../../contexts/bulletins-evaluations/interfaces/http/routes';
import {
  BulletinAuditAdapter,
  BulletinEventBusAdapter,
  BulletinPdfAdapter,
  BulletinSyncAdapter,
  ReferentielAcademiqueAdapter,
  ScolariteElevesAdapter,
} from '../../contexts/bulletins-evaluations/infrastructure/adapters';
import { creerInfrastructurePostgresBulletinsEvaluations } from '../../contexts/bulletins-evaluations/infrastructure/persistence/postgres';
import {
  PostgresAbandonsQuery,
  PostgresAuditEncodageQuery,
  PostgresBulletinEleveQuery,
  PostgresClassementClasseQuery,
  PostgresDepotBulletinEleve,
  PostgresDepotClassementColonneClasse,
  PostgresDepotFicheCotationEleveCours,
  PostgresDepotMigrationBulletin,
  PostgresDepotProclamationClasse,
  PostgresDepotResultatBulletinEleve,
  PostgresDepotSyntheseResultatsEcole,
  PostgresDiagnosticEchecQuery,
  PostgresFicheCotationQuery,
  PostgresHistoriqueBulletinQuery,
  PostgresHistoriqueMigrationQuery,
  PostgresNonClassesQuery,
  PostgresProclamationClasseQuery,
  PostgresStatistiquesClasseQuery,
  PostgresStatistiquesEcoleQuery,
  PostgresSyntheseResultatsQuery,
} from '../../contexts/bulletins-evaluations/infrastructure/persistence/postgres';
import { PdfBulletinService } from '../../contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService';
import { ServiceSynchronisationParDefaut } from '../../shared/infrastructure/sync/SyncService';
import type { DepotJournalSynchronisation } from '../../shared/infrastructure/sync/SyncLogRepository';
import { ResolveurConflit } from '../../shared/infrastructure/sync/ConflictResolver';

// Ce depot memoire suffit ici pour journaliser les synchronisations sans introduire de dependance externe.
class DepotJournalSynchronisationMemoire implements DepotJournalSynchronisation {
  private readonly journaux: Array<Record<string, unknown>> = [];

  // Cette methode ouvre un journal technique et retourne son identifiant.
  public async enregistrerDebut(operation: string, contexte?: Record<string, any>): Promise<string> {
    const idJournal = `${operation}-${Date.now()}-${this.journaux.length + 1}`;
    this.journaux.push({
      idJournal,
      operation,
      statut: 'DEBUT',
      contexte,
    });

    return idJournal;
  }

  // Cette methode marque un journal comme termine avec succes.
  public async enregistrerSucces(idJournal: string, resultat?: Record<string, any>): Promise<void> {
    this.journaux.push({
      idJournal,
      statut: 'SUCCES',
      resultat,
    });
  }

  // Cette methode marque un journal comme termine en echec.
  public async enregistrerEchec(idJournal: string, erreur: string, details?: Record<string, any>): Promise<void> {
    this.journaux.push({
      idJournal,
      statut: 'ECHEC',
      erreur,
      details,
    });
  }

  // Cette methode relit les journaux associes a une operation.
  public async listerParOperation(operation: string): Promise<any[]> {
    return this.journaux.filter((journal) => journal.operation === operation);
  }
}

// Ce fichier compose le BC Bulletins & Evaluations sans encore l'activer globalement.
interface CompositionRoutesBulletinsEvaluations {
  infrastructureBulletins: ReturnType<typeof creerInfrastructurePostgresBulletinsEvaluations>;
  dependancesRoutes: DependancesRoutesBulletinsEvaluationsDocument;
}

// Cette fonction assemble les use cases et les controleurs HTTP du BC.
function composerRoutesBulletinsEvaluations(): CompositionRoutesBulletinsEvaluations {
  const contexteTenant = new ContexteTenant();
  const infrastructureBulletins = creerInfrastructurePostgresBulletinsEvaluations(undefined, contexteTenant);
  const journaliseur = new JournaliseurPino();
  const eventBus = new BulletinEventBusAdapter(journaliseur);
  const auditAdapter = new BulletinAuditAdapter(journaliseur);
  const referentielAdapter = new ReferentielAcademiqueAdapter();
  const scolariteAdapter = new ScolariteElevesAdapter();
  const serviceSynchronisation = new ServiceSynchronisationParDefaut(
    journaliseur,
    new DepotJournalSynchronisationMemoire(),
    new ResolveurConflit(),
  );
  const syncAdapter = new BulletinSyncAdapter(serviceSynchronisation);
  const serviceAudit = new ServiceAuditBulletin(auditAdapter);
  const pdfAdapter = new BulletinPdfAdapter(new PdfBulletinService());

  const depotFicheCotation = new PostgresDepotFicheCotationEleveCours();
  const depotResultat = new PostgresDepotResultatBulletinEleve();
  const depotClassement = new PostgresDepotClassementColonneClasse();
  const depotBulletin = new PostgresDepotBulletinEleve();
  const depotProclamation = new PostgresDepotProclamationClasse();
  const depotSynthese = new PostgresDepotSyntheseResultatsEcole();
  const depotMigration = new PostgresDepotMigrationBulletin();

  const encoderCoteUseCase = new EncoderCoteUseCase(
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    eventBus,
  );
  const modifierCoteUseCase = new ModifierCoteUseCase(
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    eventBus,
  );
  const viderCoteUseCase = new ViderCoteUseCase(
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    eventBus,
  );
  const corrigerCoteUseCase = new CorrigerCoteUseCase(modifierCoteUseCase, viderCoteUseCase);
  const consulterFicheCotationUseCase = new ConsulterFicheCotationUseCase(new PostgresFicheCotationQuery());
  void corrigerCoteUseCase;

  const recalculerResultatEleveUseCase = new RecalculerResultatEleveUseCase(
    depotResultat,
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    eventBus,
  );
  const recalculerClassementClasseUseCase = new RecalculerClassementClasseUseCase(
    depotClassement,
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    scolariteAdapter,
    eventBus,
  );
  void recalculerResultatEleveUseCase;
  const encoderConduiteUseCase = new EncoderConduiteUseCase(
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    eventBus,
  );
  const declarerNonClasseUseCase = new DeclarerNonClasseUseCase(
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    eventBus,
  );
  const declarerAbandonUseCase = new DeclarerAbandonUseCase(scolariteAdapter);

  const genererBulletinEleveUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    referentielAdapter,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    pdfAdapter,
    undefined,
    eventBus,
  );
  const genererProclamationClasseUseCase = new GenererProclamationClasseUseCase(
    depotProclamation,
    depotResultat,
    scolariteAdapter,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    eventBus,
  );
  const genererSyntheseResultatsEcoleUseCase = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    scolariteAdapter,
  );
  const genererMigrationBulletinUseCase = new GenererMigrationBulletinUseCase(
    depotMigration,
    infrastructureBulletins.uniteDeTravail,
  );
  const appliquerMigrationBulletinUseCase = new AppliquerMigrationBulletinUseCase(
    depotMigration,
    infrastructureBulletins.uniteDeTravail,
  );
  const synchroniserOperationsOfflineUseCase = new SynchroniserOperationsOfflineUseCase(
    new ServiceSynchronisationOffline(syncAdapter),
  );

  const consulterBulletinEleveUseCase = new ConsulterBulletinEleveUseCase(new PostgresBulletinEleveQuery());
  const consulterClassementClasseUseCase = new ConsulterClassementClasseUseCase(new PostgresClassementClasseQuery());
  const consulterProclamationClasseUseCase = new ConsulterProclamationClasseUseCase(new PostgresProclamationClasseQuery());
  const consulterSyntheseResultatsUseCase = new ConsulterSyntheseResultatsUseCase(new PostgresSyntheseResultatsQuery());
  const consulterHistoriqueBulletinUseCase = new ConsulterHistoriqueBulletinUseCase(new PostgresHistoriqueBulletinQuery());
  const historiqueMigrationQuery = new PostgresHistoriqueMigrationQuery();
  const nonClassesQuery = new PostgresNonClassesQuery();
  const diagnosticEchecQuery = new PostgresDiagnosticEchecQuery();
  const auditEncodageQuery = new PostgresAuditEncodageQuery();
  const statistiquesClasseQuery = new PostgresStatistiquesClasseQuery();
  const statistiquesEcoleQuery = new PostgresStatistiquesEcoleQuery();
  const abandonsQuery = new PostgresAbandonsQuery();

  const encodageCotesController = new EncodageCotesController(
    encoderCoteUseCase,
    modifierCoteUseCase,
    viderCoteUseCase,
  );
  const fichesCotationController = new FichesCotationController(consulterFicheCotationUseCase);
  const resultatsBulletinController = new ResultatsBulletinController(
    consulterBulletinEleveUseCase,
    diagnosticEchecQuery,
    nonClassesQuery,
  );
  const classementsController = new ClassementsController(
    consulterClassementClasseUseCase,
    recalculerClassementClasseUseCase,
  );
  const bulletinsController = new BulletinsController(
    genererBulletinEleveUseCase,
    consulterBulletinEleveUseCase,
    consulterHistoriqueBulletinUseCase,
    pdfAdapter,
  );
  const proclamationsController = new ProclamationsController(
    genererProclamationClasseUseCase,
    consulterProclamationClasseUseCase,
  );
  const syntheseResultatsController = new SyntheseResultatsController(
    genererSyntheseResultatsEcoleUseCase,
    consulterSyntheseResultatsUseCase,
  );
  const conduiteApplicationController = new ConduiteApplicationController(
    encoderConduiteUseCase,
    declarerNonClasseUseCase,
    declarerAbandonUseCase,
  );
  const migrationBulletinController = new MigrationBulletinController(
    genererMigrationBulletinUseCase,
    appliquerMigrationBulletinUseCase,
    historiqueMigrationQuery,
  );
  const synchronisationOfflineController = new SynchronisationOfflineController(
    synchroniserOperationsOfflineUseCase,
  );
  const auditBulletinController = new AuditBulletinController(auditEncodageQuery);
  const statistiquesBulletinController = new StatistiquesBulletinController(
    statistiquesClasseQuery,
    statistiquesEcoleQuery,
    nonClassesQuery,
    abandonsQuery,
  );
  const exportsBulletinController = new ExportsBulletinController(
    bulletinsController,
    proclamationsController,
    statistiquesBulletinController,
  );
  const historiqueBulletinController = new HistoriqueBulletinController(
    consulterHistoriqueBulletinUseCase,
  );
  const healthBulletinController = new HealthBulletinController();

  return {
    infrastructureBulletins,
    dependancesRoutes: {
      encodageCotesController,
      fichesCotationController,
      resultatsBulletinController,
      classementsController,
      bulletinsController,
      proclamationsController,
      syntheseResultatsController,
      conduiteApplicationController,
      migrationBulletinController,
      synchronisationOfflineController,
      auditBulletinController,
      statistiquesBulletinController,
      exportsBulletinController,
      historiqueBulletinController,
      healthBulletinController,
      contexteTenant,
    },
  };
}

type PluginRoutesBulletinsEvaluations = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

// Ce plugin compose completement le BC Bulletins tout en laissant son activation globale maitrisee ailleurs.
export const routeBulletinsEvaluations: PluginRoutesBulletinsEvaluations = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesBulletinsEvaluations();

    serveur.addHook('onClose', async () => {
      await composition.infrastructureBulletins.pool.end();
    });

    await serveur.register(creerRoutesDocumentairesBulletinsEvaluations(composition.dependancesRoutes));

    serveur.log.info(
      {
        contexte: {
          bc: 'bulletins-evaluations',
          prefixe: routeBulletinsEvaluations.prefixe,
        },
      },
      'Routes du BC bulletins evaluations composees.',
    );
  },
  {
    nom: 'bulletins-evaluations',
    prefixe: '/api',
  },
);
