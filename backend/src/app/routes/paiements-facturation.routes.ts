import type { FastifyPluginAsync } from 'fastify';
import type { PaiementEnregistreOutput } from '../../contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import { ServiceIdempotencePaiement } from '../../contexts/paiements-facturation/application/services/ServiceIdempotencePaiement';
import { ServiceTransactionPaiement } from '../../contexts/paiements-facturation/application/services/ServiceTransactionPaiement';
import { AnnulerPaiementUseCase, RestituerExcedentUseCase } from '../../contexts/paiements-facturation/application/use-cases/annulations';
import {
  CloturerCaisseJourUseCase,
  ConsulterCaisseJourUseCase,
  OuvrirCaisseJourUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/caisse';
import {
  ConsulterDetteEleveUseCase,
  ConsulterFraisExigiblesEleveUseCase,
} from '../../contexts/paiements-facturation/application/use-cases/dettes';
import { EnregistrerPaiementUseCase } from '../../contexts/paiements-facturation/application/use-cases/paiements';
import {
  AnnulerPaiementController,
  CloturerCaisseController,
  ConsulterCaisseJourController,
  ConsulterDetteEleveController,
  ConsulterFraisExigiblesController,
  ConsulterHistoriquePaiementsController,
  EnregistrerPaiementController,
  OuvrirCaisseController,
  RestituerExcedentController,
} from '../../contexts/paiements-facturation/interfaces/http/controllers';
import {
  type DependancesRoutesPaiementsFacturation,
  creerRoutesPaiementsFacturation,
} from '../../contexts/paiements-facturation/interfaces/http/routes';
import {
  AuditAdapter,
  ScolariteElevesAdapter,
  StoreIdempotencePaiementSharedAdapter,
} from '../../contexts/paiements-facturation/infrastructure/adapters';
import {
  type InfrastructurePostgresPaiementsFacturation,
  PostgresDepotAnnulationPaiement,
  PostgresDepotCaisseJour,
  PostgresDepotDetteEleve,
  PostgresDepotObligationFinanciere,
  PostgresDepotPaiement,
  PostgresDepotParametresPaiementEcole,
  PostgresDepotRecuPaiement,
  PostgresDepotRestitution,
  HistoriquePaiementsEleveQueryRepository,
  MigrateurPostgresPaiementsFacturation,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { PaiementTenantContext } from '../../contexts/paiements-facturation/infrastructure/tenancy/PaiementTenantContext';
import {
  type InfrastructurePostgresScolariteEleves,
  creerInfrastructurePostgresScolariteEleves,
} from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import { PostgresIdempotencyStore } from 'shared/infrastructure/idempotency/PostgresIdempotencyStore';

// Ce fichier compose le BC Paiements & Facturation sans encore le rendre actif globalement.
interface DepotsPaiementsFacturation {
  depotObligationFinanciere: PostgresDepotObligationFinanciere;
  depotPaiement: PostgresDepotPaiement;
  depotParametresPaiementEcole: PostgresDepotParametresPaiementEcole;
  depotRecuPaiement: PostgresDepotRecuPaiement;
  depotCaisseJour: PostgresDepotCaisseJour;
  depotRestitution: PostgresDepotRestitution;
  depotAnnulationPaiement: PostgresDepotAnnulationPaiement;
  depotDetteEleve: PostgresDepotDetteEleve;
  historiquePaiements: HistoriquePaiementsEleveQueryRepository;
}

interface CompositionRoutesPaiementsFacturation {
  infrastructurePaiements: InfrastructurePostgresPaiementsFacturation;
  infrastructureScolarite: InfrastructurePostgresScolariteEleves;
  migrateurPaiements: MigrateurPostgresPaiementsFacturation;
  dependancesRoutes: DependancesRoutesPaiementsFacturation;
}

// Cette fonction instancie les depots PostgreSQL du BC Paiements avec un tenant commun.
function creerDepotsPaiementsFacturation(
  infrastructure: InfrastructurePostgresPaiementsFacturation,
  contexteTenant: PaiementTenantContext,
): DepotsPaiementsFacturation {
  const { clientLecture, uniteDeTravail } = infrastructure;

  return {
    depotObligationFinanciere: new PostgresDepotObligationFinanciere(
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
    depotRecuPaiement: new PostgresDepotRecuPaiement(
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
    depotDetteEleve: new PostgresDepotDetteEleve(
      clientLecture,
      uniteDeTravail,
      contexteTenant,
    ),
    historiquePaiements: new HistoriquePaiementsEleveQueryRepository(clientLecture),
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
  const migrateurPaiements = new MigrateurPostgresPaiementsFacturation(
    infrastructurePaiements.pool,
  );
  const depots = creerDepotsPaiementsFacturation(infrastructurePaiements, contexteTenant);
  const auditAdapter = new AuditAdapter();
  const scolariteElevesAdapter = new ScolariteElevesAdapter(
    infrastructureScolarite.clientLecture,
  );
  const storeIdempotencePaiement =
    new StoreIdempotencePaiementSharedAdapter<PaiementEnregistreOutput>(
      new PostgresIdempotencyStore(infrastructurePaiements.clientLecture),
    );
  const serviceIdempotencePaiement = new ServiceIdempotencePaiement<PaiementEnregistreOutput>(
    storeIdempotencePaiement,
  );
  const serviceTransactionPaiement = new ServiceTransactionPaiement(
    infrastructurePaiements.uniteDeTravail,
  );

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
      undefined,
      undefined,
      undefined,
      auditAdapter,
    ),
  );

  const controleurConsulterDetteEleve = new ConsulterDetteEleveController(
    new ConsulterDetteEleveUseCase(depots.depotDetteEleve),
  );

  const controleurConsulterFraisExigibles = new ConsulterFraisExigiblesController(
    new ConsulterFraisExigiblesEleveUseCase(
      scolariteElevesAdapter,
      depots.depotObligationFinanciere,
      depots.depotParametresPaiementEcole,
    ),
  );

  const controleurAnnulerPaiement = new AnnulerPaiementController(
    new AnnulerPaiementUseCase(
      depots.depotPaiement,
      depots.depotRecuPaiement,
      depots.depotCaisseJour,
      depots.depotAnnulationPaiement,
    ),
  );

  const controleurOuvrirCaisse = new OuvrirCaisseController(
    new OuvrirCaisseJourUseCase(depots.depotCaisseJour, auditAdapter),
  );

  const controleurCloturerCaisse = new CloturerCaisseController(
    new CloturerCaisseJourUseCase(depots.depotCaisseJour, auditAdapter),
  );

  const controleurConsulterCaisseJour = new ConsulterCaisseJourController(
    new ConsulterCaisseJourUseCase(depots.depotCaisseJour),
  );

  const controleurConsulterHistoriquePaiements =
    new ConsulterHistoriquePaiementsController(depots.historiquePaiements);

  const controleurRestituerExcedent = new RestituerExcedentController(
    new RestituerExcedentUseCase(depots.depotPaiement, depots.depotRestitution),
  );

  return {
    infrastructurePaiements,
    infrastructureScolarite,
    migrateurPaiements,
    dependancesRoutes: {
      controleurEnregistrerPaiement,
      controleurConsulterDetteEleve,
      controleurConsulterFraisExigibles,
      controleurAnnulerPaiement,
      controleurOuvrirCaisse,
      controleurCloturerCaisse,
      controleurConsulterCaisseJour,
      controleurConsulterHistoriquePaiements,
      controleurRestituerExcedent,
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
      await composition.infrastructurePaiements.pool.end();
      await composition.infrastructureScolarite.pool.end();
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
