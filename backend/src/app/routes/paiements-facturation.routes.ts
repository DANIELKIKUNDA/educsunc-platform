import type { FastifyPluginAsync } from 'fastify';
import type { PaiementEnregistreOutput } from '../../contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { ServiceIdempotencePaiement } from '../../contexts/paiements-facturation/application/services/ServiceIdempotencePaiement';
import { ServiceTransactionPaiement } from '../../contexts/paiements-facturation/application/services/ServiceTransactionPaiement';
import { AssemblageRecuPaiementOfficielService } from '../../contexts/paiements-facturation/application/services/AssemblageRecuPaiementOfficielService';
import { AnnulerPaiementUseCase, RestituerExcedentUseCase } from '../../contexts/paiements-facturation/application/use-cases/annulations';
import {
  AccorderExonerationUseCase,
  AnnulerExonerationUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/exonerations';
import {
  ActiverQualificationFinanciereEleveUseCase,
  DesactiverQualificationFinanciereEleveUseCase,
  ListerQualificationsFinancieresEleveUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/qualifications-financieres';
import {
  CloturerCaisseJourUseCase,
  ConsulterCaisseJourUseCase,
  OuvrirCaisseJourUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/caisse';
import {
  ConsulterArrieresEleveUseCase,
  ConsulterDetteEleveUseCase,
  ConsulterFraisExigiblesEleveUseCase,
  ConsulterHistoriquePaiementsEleveUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/dettes';
import {
  ConsulterFondsAnticipesUseCase,
  ConsulterPaiementsParCaissierUseCase,
  ConsulterPaiementsParTypeFraisUseCase,
  ConsulterRegistreFinancierClasseUseCase,
  ConsulterSyntheseFinanciereClasseUseCase,
  ConsulterSyntheseFinanciereEcoleUseCase,
  ConsulterSyntheseFinanciereOrganisationUseCase,
  ConsulterSyntheseFinanciereSectionUseCase,
  ConsulterRapportFinancierJournalierUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/rapports';
import {
  ConfigurerParametresPaiementEcoleUseCase,
  ConsulterParametresPaiementEcoleUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/parametres';
import {
  CreerGrilleTarificationUseCase,
  DesactiverGrilleTarificationUseCase,
  ListerGrillesTarificationUseCase,
  ModifierGrilleTarificationUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/tarification';
import { EnregistrerPaiementUseCase } from '../../contexts/paiements-facturation/application/use-cases/paiements';
import {
  AnnulerPaiementController,
  AssetsRecusController,
  CloturerCaisseController,
  ConsulterArrieresEleveController,
  ConsulterCaisseJourController,
  ConsulterDetteEleveController,
  ConsulterFraisExigiblesController,
  ConsulterHistoriquePaiementsController,
  ConsulterRecusPaiementController,
  ConsulterRapportFinancierController,
  EnregistrerPaiementController,
  ExonerationController,
  OuvrirCaisseController,
  ParametresPaiementController,
  QualificationFinanciereEleveController,
  ReimprimerRecuController,
  RestituerExcedentController,
  TarificationController,
} from '../../contexts/paiements-facturation/interfaces/http/controllers';
import {
  ConsulterRecusPaiementUseCase,
  GererAssetsRecusUseCase,
  ReimprimerRecuUseCase,
  TelechargerRecuPdfUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/recus';
import {
  type DependancesRoutesPaiementsFacturation,
  creerRoutesPaiementsFacturation,
} from '../../contexts/paiements-facturation/interfaces/http/routes';
import {
  AuditAdapter,
  ProjectionRecuPaiementAdapter,
  ScolariteElevesAdapter,
  StoreIdempotencePaiementSharedAdapter,
} from '../../contexts/paiements-facturation/infrastructure/adapters';
import {
  type InfrastructurePostgresPaiementsFacturation,
  PostgresDepotAnnulationPaiement,
  PostgresDepotAssetsRecus,
  ArrieresEleveQueryRepository,
  PostgresDepotCaisseJour,
  PostgresDepotDetteEleve,
  PostgresDepotExoneration,
  PostgresDepotGrilleTarification,
  PostgresDepotObligationFinanciere,
  PostgresDepotPaiement,
  PostgresDepotParametresPaiementEcole,
  PostgresDepotQualificationFinanciereEleve,
  PostgresDepotRecuPaiement,
  PostgresDepotRecuPaiementOfficiel,
  PostgresDepotRestitution,
  HistoriquePaiementsEleveQueryRepository,
  FondsAnticipesQueryRepository,
  PaiementsParCaissierQueryRepository,
  PaiementsParTypeFraisQueryRepository,
  RapportFinancierQueryRepository,
  RecusPaiementQueryRepository,
  RegistreFinancierClasseQueryRepository,
  SyntheseFinanciereClasseQueryRepository,
  SyntheseFinanciereEcoleQueryRepository,
  SyntheseFinanciereOrganisationQueryRepository,
  SyntheseFinanciereSectionQueryRepository,
  MigrateurPostgresPaiementsFacturation,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import {
  ServiceNumeroRecuPaiement,
  ServicePdfRecuPaiement,
} from '../../contexts/paiements-facturation/infrastructure/services';
import { PaiementTenantContext } from '../../contexts/paiements-facturation/infrastructure/tenancy/PaiementTenantContext';
import {
  type InfrastructurePostgresScolariteEleves,
  creerInfrastructurePostgresScolariteEleves,
} from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import {
  type InfrastructurePostgresReferentielAcademique,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { PostgresIdempotencyStore } from 'shared/infrastructure/idempotency/PostgresIdempotencyStore';
import { PostgresUtilisateurAuthRepository } from 'shared/auth/infrastructure';
import { LocalStorage } from 'shared/infrastructure/storage/LocalStorage';
import { AutorisationPerceptionPaiementAdapter } from '../adapters/AutorisationPerceptionPaiementAdapter';
import { AutorisationAnnulationPaiementAdapter } from '../adapters/AutorisationAnnulationPaiementAdapter';
import { AutorisationHistoriquePaiementsAdapter } from '../adapters/AutorisationHistoriquePaiementsAdapter';
import { AutorisationOuvertureCaisseAdapter } from '../adapters/AutorisationOuvertureCaisseAdapter';
import { AutorisationRestitutionPaiementAdapter } from '../adapters/AutorisationRestitutionPaiementAdapter';
import { AutorisationConsultationRecusAdapter } from '../adapters/AutorisationConsultationRecusAdapter';
import { AutorisationReimpressionRecuAdapter } from '../adapters/AutorisationReimpressionRecuAdapter';
import { AutorisationSituationFinanciereEleveAdapter } from '../adapters/AutorisationSituationFinanciereEleveAdapter';
import { AutorisationRapportFinancierAdapter } from '../adapters/AutorisationRapportFinancierAdapter';
import { AutorisationPaiementsParTypeFraisAdapter } from '../adapters/AutorisationPaiementsParTypeFraisAdapter';
import { AutorisationRegistreFinancierClasseAdapter } from '../adapters/AutorisationRegistreFinancierClasseAdapter';
import { AutorisationSyntheseFinanciereSectionAdapter } from '../adapters/AutorisationSyntheseFinanciereSectionAdapter';
import { AutorisationExonerationAdapter } from '../adapters/AutorisationExonerationAdapter';
import { AutorisationQualificationFinanciereEleveAdapter } from '../adapters/AutorisationQualificationFinanciereEleveAdapter';
import { SharedDomainEventBusAdapter } from '../adapters/SharedDomainEventBusAdapter';

// Ce fichier compose le BC Paiements & Facturation sans encore le rendre actif globalement.
interface DepotsPaiementsFacturation {
  depotObligationFinanciere: PostgresDepotObligationFinanciere;
  depotExoneration: PostgresDepotExoneration;
  depotQualificationFinanciereEleve: PostgresDepotQualificationFinanciereEleve;
  depotPaiement: PostgresDepotPaiement;
  depotParametresPaiementEcole: PostgresDepotParametresPaiementEcole;
  depotGrilleTarification: PostgresDepotGrilleTarification;
  depotRecuPaiement: PostgresDepotRecuPaiement;
  depotRecuPaiementOfficiel: PostgresDepotRecuPaiementOfficiel;
  depotCaisseJour: PostgresDepotCaisseJour;
  depotRestitution: PostgresDepotRestitution;
  depotAnnulationPaiement: PostgresDepotAnnulationPaiement;
  depotDetteEleve: PostgresDepotDetteEleve;
  depotAssetsRecus: PostgresDepotAssetsRecus;
  arrieresEleve: ArrieresEleveQueryRepository;
  historiquePaiements: HistoriquePaiementsEleveQueryRepository;
  rapportFinancier: RapportFinancierQueryRepository;
  paiementsParCaissier: PaiementsParCaissierQueryRepository;
  paiementsParTypeFrais: PaiementsParTypeFraisQueryRepository;
  fondsAnticipes: FondsAnticipesQueryRepository;
  recusPaiement: RecusPaiementQueryRepository;
  registreFinancierClasse: RegistreFinancierClasseQueryRepository;
  syntheseFinanciereClasse: SyntheseFinanciereClasseQueryRepository;
  syntheseFinanciereSection: SyntheseFinanciereSectionQueryRepository;
  syntheseFinanciereEcole: SyntheseFinanciereEcoleQueryRepository;
  syntheseFinanciereOrganisation: SyntheseFinanciereOrganisationQueryRepository;
}

interface CompositionRoutesPaiementsFacturation {
  infrastructurePaiements: InfrastructurePostgresPaiementsFacturation;
  infrastructureScolarite: InfrastructurePostgresScolariteEleves;
  infrastructureReferentiel: InfrastructurePostgresReferentielAcademique;
  migrateurPaiements: MigrateurPostgresPaiementsFacturation;
  dependancesRoutes: DependancesRoutesPaiementsFacturation;
  autorisationPerceptionPaiement: AutorisationPerceptionPaiementAdapter;
  autorisationExoneration: AutorisationExonerationAdapter;
  autorisationQualificationFinanciereEleve: AutorisationQualificationFinanciereEleveAdapter;
  autorisationAnnulationPaiement: AutorisationAnnulationPaiementAdapter;
  autorisationRestitutionPaiement: AutorisationRestitutionPaiementAdapter;
  autorisationConsultationRecus: AutorisationConsultationRecusAdapter;
  autorisationReimpressionRecu: AutorisationReimpressionRecuAdapter;
  autorisationHistoriquePaiements: AutorisationHistoriquePaiementsAdapter;
  autorisationSituationFinanciereEleve: AutorisationSituationFinanciereEleveAdapter;
  autorisationRapportFinancier: AutorisationRapportFinancierAdapter;
  autorisationPaiementsParTypeFrais: AutorisationPaiementsParTypeFraisAdapter;
  autorisationRegistreFinancierClasse: AutorisationRegistreFinancierClasseAdapter;
  autorisationSyntheseFinanciereSection: AutorisationSyntheseFinanciereSectionAdapter;
}

// Cette fonction instancie les depots PostgreSQL du BC Paiements avec un tenant commun.
function creerDepotsPaiementsFacturation(
  infrastructure: InfrastructurePostgresPaiementsFacturation,
  infrastructureScolarite: InfrastructurePostgresScolariteEleves,
  infrastructureReferentiel: InfrastructurePostgresReferentielAcademique,
  contexteTenant: PaiementTenantContext,
): DepotsPaiementsFacturation {
  const { clientLecture, uniteDeTravail } = infrastructure;
  const registreFinancierClasse = new RegistreFinancierClasseQueryRepository(
    clientLecture,
    infrastructureScolarite.clientLecture,
    infrastructureReferentiel.clientLecture,
  );
  const syntheseFinanciereClasse = new SyntheseFinanciereClasseQueryRepository(
    registreFinancierClasse,
  );
  const syntheseFinanciereSection = new SyntheseFinanciereSectionQueryRepository(
    infrastructureReferentiel.clientLecture,
    syntheseFinanciereClasse,
  );
  const syntheseFinanciereEcole = new SyntheseFinanciereEcoleQueryRepository(
    infrastructureReferentiel.clientLecture,
    syntheseFinanciereSection,
  );

  return {
    depotObligationFinanciere: new PostgresDepotObligationFinanciere(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotExoneration: new PostgresDepotExoneration(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotQualificationFinanciereEleve: new PostgresDepotQualificationFinanciereEleve(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotPaiement: new PostgresDepotPaiement(clientLecture, uniteDeTravail, contexteTenant),
    depotParametresPaiementEcole: new PostgresDepotParametresPaiementEcole(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotGrilleTarification: new PostgresDepotGrilleTarification(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotRecuPaiement: new PostgresDepotRecuPaiement(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotRecuPaiementOfficiel: new PostgresDepotRecuPaiementOfficiel(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotCaisseJour: new PostgresDepotCaisseJour(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotRestitution: new PostgresDepotRestitution(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotAnnulationPaiement: new PostgresDepotAnnulationPaiement(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    depotAssetsRecus: new PostgresDepotAssetsRecus(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    arrieresEleve: new ArrieresEleveQueryRepository(clientLecture),
    depotDetteEleve: new PostgresDepotDetteEleve(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    historiquePaiements: new HistoriquePaiementsEleveQueryRepository(clientLecture),
    rapportFinancier: new RapportFinancierQueryRepository(clientLecture),
    paiementsParCaissier: new PaiementsParCaissierQueryRepository(clientLecture),
    paiementsParTypeFrais: new PaiementsParTypeFraisQueryRepository(clientLecture),
    fondsAnticipes: new FondsAnticipesQueryRepository(clientLecture),
    recusPaiement: new RecusPaiementQueryRepository(clientLecture),
    registreFinancierClasse,
    syntheseFinanciereClasse,
    syntheseFinanciereSection,
    syntheseFinanciereEcole,
    syntheseFinanciereOrganisation: new SyntheseFinanciereOrganisationQueryRepository(
      infrastructureReferentiel.clientLecture,
      syntheseFinanciereEcole,
    ),
  };
}

// Cette fonction assemble les use cases et controleurs HTTP du BC Paiements.
function composerRoutesPaiementsFacturation(): CompositionRoutesPaiementsFacturation {
  const contexteTenant = new PaiementTenantContext();
  const infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation(
    undefined,
    contexteTenant,
  );
  const infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  const infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique();
  const migrateurPaiements = new MigrateurPostgresPaiementsFacturation(
    infrastructurePaiements.pool,
  );
  const depots = creerDepotsPaiementsFacturation(
    infrastructurePaiements,
    infrastructureScolarite,
    infrastructureReferentiel,
    contexteTenant,
  );
  const auditAdapter = new AuditAdapter();
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const scolariteElevesAdapter = new ScolariteElevesAdapter(
    infrastructureScolarite.clientLecture,
  );
  const projectionRecuPaiementAdapter = new ProjectionRecuPaiementAdapter(
    infrastructureScolarite.clientLecture,
    infrastructureReferentiel.clientLecture,
    depotUtilisateurAuth,
    infrastructurePaiements.clientLecture,
  );
  const storeIdempotencePaiement =
    new StoreIdempotencePaiementSharedAdapter<PaiementEnregistreOutput>(
      new PostgresIdempotencyStore(infrastructurePaiements.clientLecture),
    );
  const serviceIdempotencePaiement = new ServiceIdempotencePaiement<PaiementEnregistreOutput>(
    storeIdempotencePaiement,
  );
  const serviceNumeroRecuPaiement = new ServiceNumeroRecuPaiement(
    infrastructurePaiements.clientLecture,
  );
  const stockageAssetsRecus = new LocalStorage();
  const serviceTransactionPaiement = new ServiceTransactionPaiement(
    infrastructurePaiements.uniteDeTravail,
  );
  const autorisationPerceptionPaiement = new AutorisationPerceptionPaiementAdapter();
  const autorisationExoneration = new AutorisationExonerationAdapter();
  const autorisationQualificationFinanciereEleve = new AutorisationQualificationFinanciereEleveAdapter();
  const autorisationAnnulationPaiement = new AutorisationAnnulationPaiementAdapter();
  const autorisationRestitutionPaiement = new AutorisationRestitutionPaiementAdapter();
  const autorisationConsultationRecus = new AutorisationConsultationRecusAdapter();
  const autorisationReimpressionRecu = new AutorisationReimpressionRecuAdapter();
  const autorisationHistoriquePaiements = new AutorisationHistoriquePaiementsAdapter();
  const autorisationOuvertureCaisse = new AutorisationOuvertureCaisseAdapter();
  const autorisationSituationFinanciereEleve = new AutorisationSituationFinanciereEleveAdapter();
  const autorisationRapportFinancier = new AutorisationRapportFinancierAdapter();
  const autorisationPaiementsParTypeFrais = new AutorisationPaiementsParTypeFraisAdapter();
  const autorisationRegistreFinancierClasse = new AutorisationRegistreFinancierClasseAdapter();
  const autorisationSyntheseFinanciereSection = new AutorisationSyntheseFinanciereSectionAdapter();
  const eventBus = new SharedDomainEventBusAdapter();

  const controleurEnregistrerPaiement = new EnregistrerPaiementController(
    new EnregistrerPaiementUseCase(
      depots.depotObligationFinanciere,
      depots.depotPaiement,
      depots.depotParametresPaiementEcole,
      depots.depotRecuPaiement,
      depots.depotCaisseJour,
      depots.depotRestitution,
      serviceIdempotencePaiement,
      serviceTransactionPaiement,
      autorisationPerceptionPaiement,
      scolariteElevesAdapter,
      depots.depotRecuPaiementOfficiel,
      serviceNumeroRecuPaiement,
      undefined,
      undefined,
      undefined,
      auditAdapter,
      eventBus,
    ),
  );

  const controleurConsulterDetteEleve = new ConsulterDetteEleveController(
    new ConsulterDetteEleveUseCase(
      depots.depotDetteEleve,
      scolariteElevesAdapter,
      autorisationSituationFinanciereEleve,
    ),
  );

  const controleurConsulterArrieresEleve = new ConsulterArrieresEleveController(
    new ConsulterArrieresEleveUseCase(
      depots.arrieresEleve,
      scolariteElevesAdapter,
      autorisationSituationFinanciereEleve,
    ),
  );

  const controleurConsulterFraisExigibles = new ConsulterFraisExigiblesController(
    new ConsulterFraisExigiblesEleveUseCase(
      scolariteElevesAdapter,
      depots.depotObligationFinanciere,
      depots.depotParametresPaiementEcole,
      autorisationSituationFinanciereEleve,
    ),
  );

  const controleurAnnulerPaiement = new AnnulerPaiementController(
    new AnnulerPaiementUseCase(
      depots.depotPaiement,
      depots.depotRecuPaiement,
      depots.depotCaisseJour,
      depots.depotAnnulationPaiement,
      scolariteElevesAdapter,
      autorisationAnnulationPaiement,
      undefined,
      eventBus,
    ),
  );

  const controleurExoneration = new ExonerationController(
    new AccorderExonerationUseCase(
      depots.depotExoneration,
      depots.depotObligationFinanciere,
      autorisationExoneration,
    ),
    new AnnulerExonerationUseCase(
      depots.depotExoneration,
      depots.depotObligationFinanciere,
      autorisationExoneration,
    ),
  );

  const controleurQualificationFinanciereEleve = new QualificationFinanciereEleveController(
    new ActiverQualificationFinanciereEleveUseCase(
      depots.depotQualificationFinanciereEleve,
      autorisationQualificationFinanciereEleve,
    ),
    new DesactiverQualificationFinanciereEleveUseCase(
      depots.depotQualificationFinanciereEleve,
      autorisationQualificationFinanciereEleve,
    ),
    new ListerQualificationsFinancieresEleveUseCase(
      depots.depotQualificationFinanciereEleve,
      autorisationQualificationFinanciereEleve,
    ),
  );

  const controleurOuvrirCaisse = new OuvrirCaisseController(
    new OuvrirCaisseJourUseCase(
      depots.depotCaisseJour,
      autorisationOuvertureCaisse,
      auditAdapter,
    ),
  );

  const controleurCloturerCaisse = new CloturerCaisseController(
    new CloturerCaisseJourUseCase(
      depots.depotCaisseJour,
      autorisationOuvertureCaisse,
      auditAdapter,
    ),
  );

  const controleurConsulterCaisseJour = new ConsulterCaisseJourController(
    new ConsulterCaisseJourUseCase(
      depots.depotCaisseJour,
      autorisationOuvertureCaisse,
    ),
  );

  const controleurConsulterHistoriquePaiements =
    new ConsulterHistoriquePaiementsController(
      new ConsulterHistoriquePaiementsEleveUseCase(
        depots.historiquePaiements,
        scolariteElevesAdapter,
        autorisationHistoriquePaiements,
      ),
    );

  const controleurRestituerExcedent = new RestituerExcedentController(
    new RestituerExcedentUseCase(
      depots.depotPaiement,
      depots.depotRestitution,
      depots.depotCaisseJour,
      scolariteElevesAdapter,
      autorisationRestitutionPaiement,
      eventBus,
    ),
  );

  const controleurConsulterRapportFinancier = new ConsulterRapportFinancierController(
    new ConsulterRapportFinancierJournalierUseCase(
      depots.rapportFinancier,
      autorisationRapportFinancier,
    ),
    new ConsulterPaiementsParCaissierUseCase(
      depots.paiementsParCaissier,
      autorisationRapportFinancier,
    ),
    new ConsulterPaiementsParTypeFraisUseCase(
      depots.paiementsParTypeFrais,
      autorisationPaiementsParTypeFrais,
    ),
    new ConsulterFondsAnticipesUseCase(
      depots.fondsAnticipes,
      autorisationPaiementsParTypeFrais,
    ),
    new ConsulterRegistreFinancierClasseUseCase(
      depots.registreFinancierClasse,
      autorisationRegistreFinancierClasse,
    ),
    new ConsulterSyntheseFinanciereClasseUseCase(
      depots.syntheseFinanciereClasse,
      autorisationRegistreFinancierClasse,
    ),
    new ConsulterSyntheseFinanciereSectionUseCase(
      depots.syntheseFinanciereSection,
      autorisationSyntheseFinanciereSection,
    ),
    new ConsulterSyntheseFinanciereEcoleUseCase(
      depots.syntheseFinanciereEcole,
      autorisationRapportFinancier,
    ),
    new ConsulterSyntheseFinanciereOrganisationUseCase(
      depots.syntheseFinanciereOrganisation,
      autorisationRapportFinancier,
    ),
  );

  const assemblageRecuPaiementOfficielService =
    new AssemblageRecuPaiementOfficielService(
      depots.depotRecuPaiement,
      projectionRecuPaiementAdapter,
      depots.depotRecuPaiementOfficiel,
    );

  const controleurReimprimerRecu = new ReimprimerRecuController(
    new ReimprimerRecuUseCase(
      assemblageRecuPaiementOfficielService,
      autorisationReimpressionRecu,
    ),
    new TelechargerRecuPdfUseCase(
      assemblageRecuPaiementOfficielService,
      new ServicePdfRecuPaiement(),
      autorisationReimpressionRecu,
    ),
  );

  const controleurConsulterRecusPaiement = new ConsulterRecusPaiementController(
    new ConsulterRecusPaiementUseCase(
      depots.recusPaiement,
      autorisationConsultationRecus,
    ),
  );

  const controleurAssetsRecus = new AssetsRecusController(
    new GererAssetsRecusUseCase(
      depots.depotAssetsRecus,
      stockageAssetsRecus,
    ),
  );

  const controleurParametresPaiement = new ParametresPaiementController(
    new ConfigurerParametresPaiementEcoleUseCase(
      depots.depotParametresPaiementEcole,
      auditAdapter,
    ),
    new ConsulterParametresPaiementEcoleUseCase(
      depots.depotParametresPaiementEcole,
    ),
  );

  const controleurTarification = new TarificationController(
    new CreerGrilleTarificationUseCase(
      depots.depotGrilleTarification,
      auditAdapter,
    ),
    new ListerGrillesTarificationUseCase(
      depots.depotGrilleTarification,
    ),
    new ModifierGrilleTarificationUseCase(
      depots.depotGrilleTarification,
      auditAdapter,
    ),
    new DesactiverGrilleTarificationUseCase(
      depots.depotGrilleTarification,
      auditAdapter,
    ),
  );

  return {
    infrastructurePaiements,
    infrastructureScolarite,
    infrastructureReferentiel,
    migrateurPaiements,
    autorisationPerceptionPaiement,
    autorisationExoneration,
    autorisationQualificationFinanciereEleve,
    autorisationAnnulationPaiement,
    autorisationRestitutionPaiement,
    autorisationConsultationRecus,
    autorisationReimpressionRecu,
    autorisationHistoriquePaiements,
    autorisationSituationFinanciereEleve,
    autorisationRapportFinancier,
    autorisationPaiementsParTypeFrais,
    autorisationRegistreFinancierClasse,
    autorisationSyntheseFinanciereSection,
    dependancesRoutes: {
      controleurEnregistrerPaiement,
      controleurConsulterArrieresEleve,
      controleurConsulterDetteEleve,
      controleurConsulterFraisExigibles,
      controleurAnnulerPaiement,
      controleurExoneration,
      controleurQualificationFinanciereEleve,
      controleurAssetsRecus,
      controleurParametresPaiement,
      controleurTarification,
      controleurOuvrirCaisse,
      controleurCloturerCaisse,
      controleurConsulterCaisseJour,
      controleurConsulterHistoriquePaiements,
      controleurConsulterRecusPaiement,
      controleurConsulterRapportFinancier,
      controleurRestituerExcedent,
      controleurReimprimerRecu,
      contexteTenant,
    },
  };
}

type PluginRoutesPaiementsFacturation = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

// Ce plugin compose completement le BC Paiements tout en laissant son activation globale maitrisee ailleurs.
export const routePaiementsFacturation: PluginRoutesPaiementsFacturation = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesPaiementsFacturation();
    await composition.migrateurPaiements.executerToutes();

    serveur.addHook('onClose', async () => {
      await composition.autorisationPerceptionPaiement.fermer();
      await composition.autorisationExoneration.fermer();
      await composition.autorisationQualificationFinanciereEleve.fermer();
      await composition.autorisationAnnulationPaiement.fermer();
      await composition.autorisationRestitutionPaiement.fermer();
      await composition.autorisationConsultationRecus.fermer();
      await composition.autorisationReimpressionRecu.fermer();
      await composition.autorisationHistoriquePaiements.fermer();
      await composition.autorisationSituationFinanciereEleve.fermer();
      await composition.autorisationPaiementsParTypeFrais.fermer();
      await composition.infrastructurePaiements.pool.end();
      await composition.infrastructureScolarite.pool.end();
      await composition.infrastructureReferentiel.pool.end();
    });

    await serveur.register(creerRoutesPaiementsFacturation(composition.dependancesRoutes));

    serveur.log.info(
      {
        contexte: {
          bc: 'paiements-facturation',
          prefixe: routePaiementsFacturation.prefixe,
        },
      },
      'Routes du BC paiements facturation composees.',
    );
  },
  {
    nom: 'paiements-facturation',
    prefixe: '/api',
  },
);
