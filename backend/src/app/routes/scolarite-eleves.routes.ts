import type { FastifyPluginAsync } from 'fastify';

import {
  AffecterEleveAClasse,
  AjouterResponsableFamille,
  AnnulerInscriptionScolaire,
  ChangerEleveDeClasse,
  ConsulterAffectationActive,
  ConsulterEleve,
  ConsulterFamille,
  ConsulterInscriptionScolaire,
  ConsulterParcoursEleve,
  ConsulterSyntheseScolariteOrganisation,
  CreerEleve,
  CreerFamille,
  CreerInscriptionComplete,
  CreerInscriptionScolaire,
  DeclarerAbandonEleve,
  DeclarerDecesEleve,
  DefinirResponsablePrincipal,
  DesactiverAffectationClasse,
  DetacherEleveDeFamille,
  EvaluerFamilleNombreuse,
  ListerAlertesScolariteOrganisation,
  ListerEleves,
  ListerElevesParClasse,
  ListerElevesParOrganisation,
  ListerEvenementsParAnnee,
  ListerEvenementsParEleve,
  ListerFamilles,
  ListerInscriptionsParAnnee,
  ListerInscriptionsParClasse,
  ListerInscriptionsParOrganisation,
  MarquerEleveDecede,
  ModifierEleve,
  ModifierFamille,
  ModifierResponsableFamille,
  RattacherEleveAFamille,
  ReactiverEleve,
  RechercherEleves,
  ReconstruireParcoursEleve,
  ReintegrerEleve,
  RetirerResponsableFamille,
  SuspendreEleve,
  TransfererEleve,
  ValiderInscriptionScolaire,
} from '../../contexts/scolarite-eleves/application/use-cases';
import { ServiceApplicationConcurrence, ServiceApplicationTenant } from '../../contexts/scolarite-eleves/application/services';
import {
  ControleurAffectationsClasses,
  ControleurCycleVieEleves,
  ControleurEleves,
  ControleurFamilles,
  ControleurInscriptionsScolaires,
  ControleurParcoursEleves,
  ControleurScolariteOrganisation,
} from '../../contexts/scolarite-eleves/interfaces/http/controllers';
import {
  type DependancesRoutesScolariteEleves,
  creerRoutesScolariteEleves,
} from '../../contexts/scolarite-eleves/interfaces/http/routes/scolarite-eleves.routes';
import {
  PostgresAffectationDepot,
  PostgresEleveDepot,
  PostgresFamilleDepot,
  PostgresInscriptionDepot,
  PostgresParcoursDepot,
  type InfrastructurePostgresScolariteEleves,
  creerInfrastructurePostgresScolariteEleves,
} from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import { ScolariteTenantContext } from '../../contexts/scolarite-eleves/infrastructure/tenancy/ScolariteTenantContext';

// Ce fichier compose le BC Scolarite des Eleves et l'enregistre dans Fastify.
interface DepotsScolariteEleves {
  depotEleve: PostgresEleveDepot;
  depotFamille: PostgresFamilleDepot;
  depotInscription: PostgresInscriptionDepot;
  depotAffectation: PostgresAffectationDepot;
  depotParcours: PostgresParcoursDepot;
}

interface CompositionRoutesScolariteEleves {
  infrastructure: InfrastructurePostgresScolariteEleves;
  dependancesRoutes: DependancesRoutesScolariteEleves;
}

// Cette fonction instancie les depots PostgreSQL du BC avec le meme contexte tenant.
function creerDepotsScolariteEleves(
  infrastructure: InfrastructurePostgresScolariteEleves,
  contexteTenant: ScolariteTenantContext,
): DepotsScolariteEleves {
  const { clientLecture, uniteDeTravail } = infrastructure;

  return {
    depotEleve: new PostgresEleveDepot(clientLecture, uniteDeTravail, contexteTenant),
    depotFamille: new PostgresFamilleDepot(clientLecture, uniteDeTravail, contexteTenant),
    depotInscription: new PostgresInscriptionDepot(clientLecture, uniteDeTravail, contexteTenant),
    depotAffectation: new PostgresAffectationDepot(clientLecture, uniteDeTravail, contexteTenant),
    depotParcours: new PostgresParcoursDepot(clientLecture, uniteDeTravail, contexteTenant),
  };
}

// Cette fonction assemble les cas d'usage et controleurs HTTP du BC.
function composerRoutesScolariteEleves(): CompositionRoutesScolariteEleves {
  const contexteTenant = new ScolariteTenantContext();
  const infrastructure = creerInfrastructurePostgresScolariteEleves(
    undefined,
    contexteTenant,
  );
  const depots = creerDepotsScolariteEleves(infrastructure, contexteTenant);
  const serviceTenant = new ServiceApplicationTenant();
  const serviceConcurrence = new ServiceApplicationConcurrence();
  const serviceTransaction = infrastructure.uniteDeTravail;

  const creerEleve = new CreerEleve(
    depots.depotEleve,
    serviceTenant,
    serviceTransaction,
  );
  const creerInscription = new CreerInscriptionScolaire(
    depots.depotInscription,
    depots.depotEleve,
  );
  const affecterEleveAClasse = new AffecterEleveAClasse(
    depots.depotAffectation,
    depots.depotInscription,
  );

  const controleurEleves = new ControleurEleves(
    creerEleve,
    new ModifierEleve(depots.depotEleve, serviceConcurrence, serviceTransaction),
    new ConsulterEleve(depots.depotEleve),
    new ListerEleves(depots.depotEleve),
    new RechercherEleves(depots.depotEleve),
    new RattacherEleveAFamille(depots.depotEleve, depots.depotFamille),
    new DetacherEleveDeFamille(depots.depotEleve),
    new MarquerEleveDecede(depots.depotEleve),
  );

  const controleurFamilles = new ControleurFamilles(
    new CreerFamille(depots.depotFamille),
    new ModifierFamille(depots.depotFamille, serviceConcurrence),
    new ConsulterFamille(depots.depotFamille),
    new ListerFamilles(depots.depotFamille),
    new AjouterResponsableFamille(depots.depotFamille, serviceConcurrence),
    new ModifierResponsableFamille(depots.depotFamille, serviceConcurrence),
    new RetirerResponsableFamille(depots.depotFamille, serviceConcurrence),
    new DefinirResponsablePrincipal(depots.depotFamille, serviceConcurrence),
    new EvaluerFamilleNombreuse(depots.depotFamille),
  );

  const controleurInscriptions = new ControleurInscriptionsScolaires(
    creerInscription,
    new CreerInscriptionComplete(creerEleve, creerInscription, affecterEleveAClasse),
    new ValiderInscriptionScolaire(depots.depotInscription, serviceConcurrence),
    new AnnulerInscriptionScolaire(depots.depotInscription, serviceConcurrence),
    new ConsulterInscriptionScolaire(depots.depotInscription),
    new ListerInscriptionsParAnnee(depots.depotInscription),
    new ListerInscriptionsParClasse(depots.depotInscription),
  );

  const controleurAffectations = new ControleurAffectationsClasses(
    affecterEleveAClasse,
    new ChangerEleveDeClasse(depots.depotAffectation, serviceConcurrence),
    new ConsulterAffectationActive(depots.depotAffectation),
    new ListerElevesParClasse(depots.depotAffectation),
    new DesactiverAffectationClasse(depots.depotAffectation),
  );

  const controleurCycleVie = new ControleurCycleVieEleves(
    new DeclarerAbandonEleve(depots.depotEleve),
    new TransfererEleve(depots.depotEleve),
    new ReintegrerEleve(depots.depotEleve),
    new SuspendreEleve(depots.depotEleve),
    new ReactiverEleve(depots.depotEleve),
    new DeclarerDecesEleve(depots.depotEleve),
  );

  const controleurParcours = new ControleurParcoursEleves(
    new ConsulterParcoursEleve(depots.depotParcours),
    new ListerEvenementsParEleve(depots.depotParcours),
    new ListerEvenementsParAnnee(depots.depotParcours),
    new ReconstruireParcoursEleve(depots.depotParcours),
  );

  const controleurOrganisation = new ControleurScolariteOrganisation(
    new ListerElevesParOrganisation(depots.depotEleve),
    new ListerInscriptionsParOrganisation(depots.depotInscription),
    new ConsulterSyntheseScolariteOrganisation(),
    new ListerAlertesScolariteOrganisation(),
  );

  return {
    infrastructure,
    dependancesRoutes: {
      controleurEleves,
      controleurFamilles,
      controleurInscriptions,
      controleurAffectations,
      controleurCycleVie,
      controleurParcours,
      controleurOrganisation,
      contexteTenant,
    },
  };
}

type PluginRoutesScolariteEleves = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

// Ce plugin branche le BC Scolarite des Eleves sur Fastify avec sa composition complete.
export const routeScolariteEleves: PluginRoutesScolariteEleves = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesScolariteEleves();

    serveur.addHook('onClose', async () => {
      await composition.infrastructure.pool.end();
    });

    await serveur.register(creerRoutesScolariteEleves(composition.dependancesRoutes));

    serveur.log.info(
      {
        contexte: {
          bc: 'scolarite-eleves',
          prefixe: routeScolariteEleves.prefixe,
        },
      },
      'Routes du BC scolarite des eleves enregistrees.',
    );
  },
  {
    nom: 'scolarite-eleves',
    prefixe: '/api',
  },
);
