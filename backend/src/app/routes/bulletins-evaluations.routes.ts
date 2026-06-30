import type { FastifyPluginAsync } from 'fastify';
import { JournaliseurPino } from 'shared/infrastructure/logger/PinoLogger';
import { ContexteTenant } from 'shared/tenancy/TenantContext';
import {
  AppliquerMigrationBulletinUseCase,
  ConsulterBulletinEleveUseCase,
  ConsulterAbandonsUseCase,
  ConsulterClassementClasseUseCase,
  ConsulterComparatifClassesUseCase,
  ConsulterConduiteClasseUseCase,
  ConsulterCoursProblematiqueUseCase,
  ConsulterDiagnosticsResultatUseCase,
  ConsulterEchecsClasseUseCase,
  ConsulterEchecsProfondsClasseUseCase,
  ConsulterEvolutionResultatUseCase,
  ConsulterPerequationClasseUseCase,
  ConsulterRepechageClasseUseCase,
  ConsulterDeliberationClasseUseCase,
  ConsulterSecondeSessionClasseUseCase,
  ConsulterFicheCotationUseCase,
  ConsulterFichesCotationClasseCoursUseCase,
  ConsulterHistoriqueBulletinUseCase,
  ConsulterNonClassesUseCase,
  ConsulterProclamationClasseUseCase,
  ConsulterResultatEleveUseCase,
  ConsulterStatistiquesClasseUseCase,
  ConsulterStatistiquesEcoleUseCase,
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
  InitialiserSyntheseResultatsEcoleUseCase,
  InitialiserProclamationClasseUseCase,
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
  DocumentAssetsEcoleAdapter,
  BulletinEventBusAdapter,
  BulletinPdfAdapter,
  ProclamationPdfAdapter,
  BulletinSyncAdapter,
  ReferentielAcademiqueAdapter,
  ScolariteElevesAdapter,
  SynthesePdfAdapter,
} from '../../contexts/bulletins-evaluations/infrastructure/adapters';
import { AutorisationGenerationBulletinAdapter } from '../adapters/AutorisationGenerationBulletinAdapter';
import { AutorisationAuditPedagogiqueAdapter } from '../adapters/AutorisationAuditPedagogiqueAdapter';
import { AutorisationClassementAdapter } from '../adapters/AutorisationClassementAdapter';
import { AutorisationConduiteAdapter } from '../adapters/AutorisationConduiteAdapter';
import { AutorisationConsultationStatistiquesAdapter } from '../adapters/AutorisationConsultationStatistiquesAdapter';
import { AutorisationEncodageCotesAdapter } from '../adapters/AutorisationEncodageCotesAdapter';
import { AutorisationGenerationProclamationAdapter } from '../adapters/AutorisationGenerationProclamationAdapter';
import { AutorisationGenerationSyntheseAdapter } from '../adapters/AutorisationGenerationSyntheseAdapter';
import { AutorisationLectureBulletinAdapter } from '../adapters/AutorisationLectureBulletinAdapter';
import { CriteresAnalysePedagogiqueAdapter } from '../adapters/CriteresAnalysePedagogiqueAdapter';
import { FenetreEncodageCalendrierAdapter } from '../adapters/FenetreEncodageCalendrierAdapter';
import { SectionClassePedagogiqueAdapter } from '../adapters/SectionClassePedagogiqueAdapter';
import { creerInfrastructurePostgresBulletinsEvaluations } from '../../contexts/bulletins-evaluations/infrastructure/persistence/postgres';
import {
  PostgresAbandonsQuery,
  PostgresAuditConduiteQuery,
  PostgresAuditEncodageQuery,
  PostgresBulletinEleveQuery,
  PostgresClassementClasseQuery,
  PostgresComparatifClassesQuery,
  PostgresConduiteClasseQuery,
  PostgresCoursProblematiqueQuery,
  PostgresDepotBulletinEleve,
  PostgresDepotClassementColonneClasse,
  PostgresDepotFicheCotationEleveCours,
  PostgresDepotMigrationBulletin,
  PostgresDepotProclamationClasse,
  PostgresDepotResultatBulletinEleve,
  PostgresDepotSyntheseResultatsEcole,
  PostgresDiagnosticEchecQuery,
  PostgresEchecsClasseQuery,
  PostgresEligibilitePerequationQuery,
  PostgresEligibiliteRepechageQuery,
  PostgresDossierDeliberationQuery,
  PostgresDossierSecondeSessionQuery,
  PostgresEvolutionResultatQuery,
  PostgresFicheCotationQuery,
  PostgresHistoriqueBulletinQuery,
  PostgresHistoriqueMigrationQuery,
  PostgresNonClassesQuery,
  PostgresProclamationClasseQuery,
  PostgresResultatsEleveQuery,
  PostgresStatistiquesClasseQuery,
  PostgresStatistiquesEcoleQuery,
  PostgresSyntheseResultatsQuery,
} from '../../contexts/bulletins-evaluations/infrastructure/persistence/postgres';
import { PostgresDepotAssetsRecus } from '../../contexts/paiements-facturation/infrastructure/persistence/postgres/depots/PostgresDepotAssetsRecus';
import { creerInfrastructurePostgresPaiementsFacturation } from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { PaiementTenantContext } from '../../contexts/paiements-facturation/infrastructure/tenancy/PaiementTenantContext';
import {
  BulletinAssetsResolverService,
  BulletinDocumentContextLoaderService,
  BulletinDocumentDataBuilderService,
  PdfBulletinService,
  ProclamationAssetsResolverService,
  ProclamationDocumentContextLoaderService,
  ProclamationDocumentDataBuilderService,
} from '../../contexts/bulletins-evaluations/infrastructure/services';
import { PdfProclamationService } from '../../contexts/bulletins-evaluations/infrastructure/services/PdfProclamationService';
import {
  PdfSyntheseService,
  SyntheseDocumentContextService,
} from '../../contexts/bulletins-evaluations/infrastructure/services/PdfSyntheseService';
import { creerInfrastructurePostgresReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import { ServiceSynchronisationParDefaut } from '../../shared/infrastructure/sync/SyncService';
import type { DepotJournalSynchronisation } from '../../shared/infrastructure/sync/SyncLogRepository';
import { ResolveurConflit } from '../../shared/infrastructure/sync/ConflictResolver';
import { LocalStorage } from '../../shared/infrastructure/storage/LocalStorage';

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
  infrastructureScolarite: ReturnType<typeof creerInfrastructurePostgresScolariteEleves>;
  infrastructureReferentiel: ReturnType<typeof creerInfrastructurePostgresReferentielAcademique>;
  dependancesRoutes: DependancesRoutesBulletinsEvaluationsDocument;
  referentielAdapter: ReferentielAcademiqueAdapter;
  autorisationGenerationBulletinAdapter: AutorisationGenerationBulletinAdapter;
  autorisationAuditPedagogiqueAdapter: AutorisationAuditPedagogiqueAdapter;
  autorisationClassementAdapter: AutorisationClassementAdapter;
  autorisationConduiteAdapter: AutorisationConduiteAdapter;
  autorisationGenerationProclamationAdapter: AutorisationGenerationProclamationAdapter;
  autorisationConsultationStatistiquesAdapter: AutorisationConsultationStatistiquesAdapter;
  autorisationEncodageCotesAdapter: AutorisationEncodageCotesAdapter;
  autorisationGenerationSyntheseAdapter: AutorisationGenerationSyntheseAdapter;
  autorisationLectureBulletinAdapter: AutorisationLectureBulletinAdapter;
  criteresAnalysePedagogiqueAdapter: CriteresAnalysePedagogiqueAdapter;
  fenetreEncodageCalendrierAdapter: FenetreEncodageCalendrierAdapter;
  sectionClassePedagogiqueAdapter: SectionClassePedagogiqueAdapter;
}

// Cette fonction assemble les use cases et les controleurs HTTP du BC.
function composerRoutesBulletinsEvaluations(): CompositionRoutesBulletinsEvaluations {
  const contexteTenant = new ContexteTenant();
  const infrastructureBulletins = creerInfrastructurePostgresBulletinsEvaluations(undefined, contexteTenant);
  const infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  const infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique();
  const infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation(
    undefined,
    new PaiementTenantContext(),
  );
  const journaliseur = new JournaliseurPino();
  const eventBus = new BulletinEventBusAdapter(journaliseur);
  const auditAdapter = new BulletinAuditAdapter(journaliseur);
  const referentielAdapter = new ReferentielAcademiqueAdapter();
  const autorisationGenerationBulletinAdapter = new AutorisationGenerationBulletinAdapter();
  const autorisationAuditPedagogiqueAdapter = new AutorisationAuditPedagogiqueAdapter();
  const autorisationClassementAdapter = new AutorisationClassementAdapter();
  const autorisationConduiteAdapter = new AutorisationConduiteAdapter();
  const autorisationGenerationProclamationAdapter = new AutorisationGenerationProclamationAdapter();
  const autorisationConsultationStatistiquesAdapter = new AutorisationConsultationStatistiquesAdapter();
  const autorisationEncodageCotesAdapter = new AutorisationEncodageCotesAdapter();
  const autorisationGenerationSyntheseAdapter = new AutorisationGenerationSyntheseAdapter();
  const autorisationLectureBulletinAdapter = new AutorisationLectureBulletinAdapter();
  const criteresAnalysePedagogiqueAdapter = new CriteresAnalysePedagogiqueAdapter();
  const fenetreEncodageCalendrierAdapter = new FenetreEncodageCalendrierAdapter();
  const sectionClassePedagogiqueAdapter = new SectionClassePedagogiqueAdapter();
  const scolariteAdapter = new ScolariteElevesAdapter(
    infrastructureScolarite.clientLecture,
    infrastructureReferentiel.clientLecture,
  );
  const stockageAssetsDocumentaires = new LocalStorage();
  const assetsDocumentairesEcole = new DocumentAssetsEcoleAdapter(
    new PostgresDepotAssetsRecus(infrastructurePaiements.clientLecture),
    stockageAssetsDocumentaires,
  );
  const documentContextLoader = new BulletinDocumentContextLoaderService(
    scolariteAdapter,
    referentielAdapter,
  );
  const serviceSynchronisation = new ServiceSynchronisationParDefaut(
    journaliseur,
    new DepotJournalSynchronisationMemoire(),
    new ResolveurConflit(),
  );
  const syncAdapter = new BulletinSyncAdapter(serviceSynchronisation);
  const serviceAudit = new ServiceAuditBulletin(auditAdapter);
  const pdfAdapter = new BulletinPdfAdapter(
    new PdfBulletinService(
      undefined,
      new BulletinDocumentDataBuilderService(
        undefined,
        new BulletinAssetsResolverService(assetsDocumentairesEcole),
        documentContextLoader,
      ),
    ),
  );
  const proclamationDocumentContextLoader = new ProclamationDocumentContextLoaderService(
    scolariteAdapter,
    referentielAdapter,
    sectionClassePedagogiqueAdapter,
  );
  const proclamationPdfAdapter = new ProclamationPdfAdapter(
    new PdfProclamationService(
      undefined,
      new ProclamationDocumentDataBuilderService(
        undefined,
        new ProclamationAssetsResolverService(assetsDocumentairesEcole),
        proclamationDocumentContextLoader,
      ),
    ),
  );
  const synthesePdfAdapter = new SynthesePdfAdapter(
    new PdfSyntheseService(
      undefined,
      new SyntheseDocumentContextService(referentielAdapter),
    ),
  );

  const depotFicheCotation = new PostgresDepotFicheCotationEleveCours();
  const depotResultat = new PostgresDepotResultatBulletinEleve();
  const depotClassement = new PostgresDepotClassementColonneClasse(infrastructureBulletins.clientLecture);
  const depotBulletin = new PostgresDepotBulletinEleve();
  const depotProclamation = new PostgresDepotProclamationClasse();
  const depotSynthese = new PostgresDepotSyntheseResultatsEcole(infrastructureBulletins.clientLecture);
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
    fenetreEncodageCalendrierAdapter,
    undefined,
    undefined,
    autorisationEncodageCotesAdapter,
  );
  const modifierCoteUseCase = new ModifierCoteUseCase(
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    eventBus,
    fenetreEncodageCalendrierAdapter,
    undefined,
    undefined,
    autorisationEncodageCotesAdapter,
  );
  const viderCoteUseCase = new ViderCoteUseCase(
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    eventBus,
    fenetreEncodageCalendrierAdapter,
    undefined,
    undefined,
    autorisationEncodageCotesAdapter,
  );
  const corrigerCoteUseCase = new CorrigerCoteUseCase(modifierCoteUseCase, viderCoteUseCase);
  const consulterFicheCotationUseCase = new ConsulterFicheCotationUseCase(new PostgresFicheCotationQuery());
  const consulterFichesCotationClasseCoursUseCase = new ConsulterFichesCotationClasseCoursUseCase(
    depotFicheCotation,
    autorisationEncodageCotesAdapter,
    scolariteAdapter,
  );
  void corrigerCoteUseCase;

  const recalculerResultatEleveUseCase = new RecalculerResultatEleveUseCase(
    depotResultat,
    depotFicheCotation,
    infrastructureBulletins.uniteDeTravail,
    undefined,
    undefined,
    undefined,
    eventBus,
    criteresAnalysePedagogiqueAdapter,
  );
  const recalculerClassementClasseUseCase = new RecalculerClassementClasseUseCase(
    depotClassement,
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    autorisationClassementAdapter,
    undefined,
    undefined,
    scolariteAdapter,
    eventBus,
  );
  void recalculerResultatEleveUseCase;
  const encoderConduiteUseCase = new EncoderConduiteUseCase(
    depotResultat,
    infrastructureBulletins.uniteDeTravail,
    autorisationConduiteAdapter,
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
    autorisationGenerationBulletinAdapter,
    undefined,
    undefined,
    serviceAudit,
    undefined,
    pdfAdapter,
    undefined,
    eventBus,
  );
  const initialiserProclamationClasseUseCase = new InitialiserProclamationClasseUseCase(
    depotProclamation,
    infrastructureBulletins.uniteDeTravail,
    autorisationGenerationProclamationAdapter,
    undefined,
    eventBus,
  );
  const genererProclamationClasseUseCase = new GenererProclamationClasseUseCase(
    depotProclamation,
    depotResultat,
    scolariteAdapter,
    infrastructureBulletins.uniteDeTravail,
    autorisationGenerationProclamationAdapter,
    undefined,
    undefined,
    eventBus,
  );
  const genererSyntheseResultatsEcoleUseCase = new GenererSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    infrastructureBulletins.uniteDeTravail,
    autorisationGenerationSyntheseAdapter,
    undefined,
    undefined,
    scolariteAdapter,
  );
  const initialiserSyntheseResultatsEcoleUseCase = new InitialiserSyntheseResultatsEcoleUseCase(
    depotSynthese,
    depotProclamation,
    infrastructureBulletins.uniteDeTravail,
    autorisationGenerationSyntheseAdapter,
    undefined,
    eventBus,
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

  const bulletinEleveQuery = new PostgresBulletinEleveQuery();
  const consulterBulletinEleveUseCase = new ConsulterBulletinEleveUseCase(
    bulletinEleveQuery,
    autorisationLectureBulletinAdapter,
  );
  const resultatsEleveQuery = new PostgresResultatsEleveQuery();
  const consulterResultatEleveUseCase = new ConsulterResultatEleveUseCase(
    resultatsEleveQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const statistiquesClasseQuery = new PostgresStatistiquesClasseQuery();
  const statistiquesEcoleQuery = new PostgresStatistiquesEcoleQuery(depotSynthese);
  const abandonsQuery = new PostgresAbandonsQuery();
  const echecsClasseQuery = new PostgresEchecsClasseQuery(depotResultat, scolariteAdapter);
  const coursProblematiqueQuery = new PostgresCoursProblematiqueQuery(depotFicheCotation);
  const evolutionResultatQuery = new PostgresEvolutionResultatQuery(depotResultat);
  const eligibilitePerequationQuery = new PostgresEligibilitePerequationQuery(depotResultat, scolariteAdapter);
  const eligibiliteRepechageQuery = new PostgresEligibiliteRepechageQuery(depotResultat, scolariteAdapter);
  const dossierDeliberationQuery = new PostgresDossierDeliberationQuery(depotResultat, scolariteAdapter);
  const dossierSecondeSessionQuery = new PostgresDossierSecondeSessionQuery(depotResultat, scolariteAdapter);
  const comparatifClassesQuery = new PostgresComparatifClassesQuery(
    statistiquesClasseQuery,
    scolariteAdapter,
  );
  const consulterEchecsClasseUseCase = new ConsulterEchecsClasseUseCase(
    echecsClasseQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterEchecsProfondsClasseUseCase = new ConsulterEchecsProfondsClasseUseCase(
    echecsClasseQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterCoursProblematiqueUseCase = new ConsulterCoursProblematiqueUseCase(
    coursProblematiqueQuery,
    criteresAnalysePedagogiqueAdapter,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterEvolutionResultatUseCase = new ConsulterEvolutionResultatUseCase(
    evolutionResultatQuery,
    resultatsEleveQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterPerequationClasseUseCase = new ConsulterPerequationClasseUseCase(
    eligibilitePerequationQuery,
    sectionClassePedagogiqueAdapter,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterRepechageClasseUseCase = new ConsulterRepechageClasseUseCase(
    eligibiliteRepechageQuery,
    sectionClassePedagogiqueAdapter,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterDeliberationClasseUseCase = new ConsulterDeliberationClasseUseCase(
    dossierDeliberationQuery,
    sectionClassePedagogiqueAdapter,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterSecondeSessionClasseUseCase = new ConsulterSecondeSessionClasseUseCase(
    dossierSecondeSessionQuery,
    sectionClassePedagogiqueAdapter,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterComparatifClassesUseCase = new ConsulterComparatifClassesUseCase(
    comparatifClassesQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterConduiteClasseUseCase = new ConsulterConduiteClasseUseCase(
    new PostgresConduiteClasseQuery(depotResultat, scolariteAdapter),
    autorisationConduiteAdapter,
  );
  const consulterClassementClasseUseCase = new ConsulterClassementClasseUseCase(
    new PostgresClassementClasseQuery(depotClassement),
    autorisationClassementAdapter,
  );
  const consulterProclamationClasseUseCase = new ConsulterProclamationClasseUseCase(new PostgresProclamationClasseQuery());
  const consulterSyntheseResultatsUseCase = new ConsulterSyntheseResultatsUseCase(
    new PostgresSyntheseResultatsQuery(depotSynthese),
  );
  const consulterHistoriqueBulletinUseCase = new ConsulterHistoriqueBulletinUseCase(
    new PostgresHistoriqueBulletinQuery(),
    bulletinEleveQuery,
    autorisationLectureBulletinAdapter,
  );
  const historiqueMigrationQuery = new PostgresHistoriqueMigrationQuery();
  const nonClassesQuery = new PostgresNonClassesQuery();
  const diagnosticEchecQuery = new PostgresDiagnosticEchecQuery();
  const consulterDiagnosticsResultatUseCase = new ConsulterDiagnosticsResultatUseCase(
    diagnosticEchecQuery,
    resultatsEleveQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const auditEncodageQuery = new PostgresAuditEncodageQuery();
  const auditConduiteQuery = new PostgresAuditConduiteQuery();
  const consulterStatistiquesClasseUseCase = new ConsulterStatistiquesClasseUseCase(
    statistiquesClasseQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterStatistiquesEcoleUseCase = new ConsulterStatistiquesEcoleUseCase(
    statistiquesEcoleQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterNonClassesUseCase = new ConsulterNonClassesUseCase(
    nonClassesQuery,
    autorisationConsultationStatistiquesAdapter,
  );
  const consulterAbandonsUseCase = new ConsulterAbandonsUseCase(
    abandonsQuery,
    autorisationConsultationStatistiquesAdapter,
  );

  const encodageCotesController = new EncodageCotesController(
    encoderCoteUseCase,
    modifierCoteUseCase,
    viderCoteUseCase,
  );
  const fichesCotationController = new FichesCotationController(
    consulterFicheCotationUseCase,
    consulterFichesCotationClasseCoursUseCase,
  );
  const resultatsBulletinController = new ResultatsBulletinController(
    consulterResultatEleveUseCase,
    consulterDiagnosticsResultatUseCase,
    consulterNonClassesUseCase,
    consulterEchecsClasseUseCase,
    consulterEchecsProfondsClasseUseCase,
    consulterCoursProblematiqueUseCase,
    consulterEvolutionResultatUseCase,
    consulterComparatifClassesUseCase,
    consulterPerequationClasseUseCase,
    consulterRepechageClasseUseCase,
    consulterDeliberationClasseUseCase,
    consulterSecondeSessionClasseUseCase,
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
    initialiserProclamationClasseUseCase,
    genererProclamationClasseUseCase,
    consulterProclamationClasseUseCase,
    proclamationPdfAdapter,
  );
  const syntheseResultatsController = new SyntheseResultatsController(
    initialiserSyntheseResultatsEcoleUseCase,
    genererSyntheseResultatsEcoleUseCase,
    consulterSyntheseResultatsUseCase,
    synthesePdfAdapter,
  );
  const conduiteApplicationController = new ConduiteApplicationController(
    encoderConduiteUseCase,
    consulterConduiteClasseUseCase,
    consulterResultatEleveUseCase,
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
  const auditBulletinController = new AuditBulletinController(
    auditEncodageQuery,
    auditConduiteQuery,
    new PostgresHistoriqueBulletinQuery(),
    depotClassement,
    depotFicheCotation,
    depotResultat,
    depotBulletin,
    autorisationAuditPedagogiqueAdapter,
  );
  const statistiquesBulletinController = new StatistiquesBulletinController(
    consulterStatistiquesClasseUseCase,
    consulterStatistiquesEcoleUseCase,
    consulterNonClassesUseCase,
    consulterAbandonsUseCase,
  );
  const exportsBulletinController = new ExportsBulletinController(
    bulletinsController,
    proclamationsController,
    syntheseResultatsController,
  );
  const historiqueBulletinController = new HistoriqueBulletinController(
    consulterHistoriqueBulletinUseCase,
    depotProclamation,
    depotResultat,
  );
  const healthBulletinController = new HealthBulletinController();

  return {
    infrastructureBulletins,
    infrastructureScolarite,
    infrastructureReferentiel,
    referentielAdapter,
    autorisationGenerationBulletinAdapter,
    autorisationAuditPedagogiqueAdapter,
    autorisationClassementAdapter,
    autorisationConduiteAdapter,
    autorisationGenerationProclamationAdapter,
    autorisationConsultationStatistiquesAdapter,
    autorisationEncodageCotesAdapter,
    autorisationGenerationSyntheseAdapter,
    autorisationLectureBulletinAdapter,
    criteresAnalysePedagogiqueAdapter,
    fenetreEncodageCalendrierAdapter,
    sectionClassePedagogiqueAdapter,
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
      await composition.autorisationGenerationBulletinAdapter.fermer();
      await composition.autorisationAuditPedagogiqueAdapter.fermer();
      await composition.autorisationClassementAdapter.fermer();
      await composition.autorisationConduiteAdapter.fermer();
      await composition.autorisationGenerationProclamationAdapter.fermer();
      await composition.autorisationConsultationStatistiquesAdapter.fermer();
      await composition.autorisationEncodageCotesAdapter.fermer();
      await composition.autorisationGenerationSyntheseAdapter.fermer();
      await composition.autorisationLectureBulletinAdapter.fermer();
      await composition.criteresAnalysePedagogiqueAdapter.fermer();
      await composition.fenetreEncodageCalendrierAdapter.fermer();
      await composition.sectionClassePedagogiqueAdapter.fermer();
      await composition.referentielAdapter.fermer();
      await composition.infrastructureReferentiel.pool.end();
      await composition.infrastructureScolarite.pool.end();
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
