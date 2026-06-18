import type { FastifyPluginAsync } from 'fastify';
import { AutorisationAffectationClasseAdapter } from '../adapters/AutorisationAffectationClasseAdapter';
import { AutorisationEleveAdapter } from '../adapters/AutorisationEleveAdapter';
import { AutorisationFamilleAdapter } from '../adapters/AutorisationFamilleAdapter';
import { AutorisationOrganisationScolariteAdapter } from '../adapters/AutorisationOrganisationScolariteAdapter';
import { AutorisationParcoursEleveAdapter } from '../adapters/AutorisationParcoursEleveAdapter';
import { AutorisationCycleVieEleveAdapter } from '../adapters/AutorisationCycleVieEleveAdapter';
import { AutorisationInscriptionCompleteAdapter } from '../adapters/AutorisationInscriptionCompleteAdapter';
import { SectionClassePedagogiqueAdapter } from '../adapters/SectionClassePedagogiqueAdapter';
import { SharedDomainEventBusAdapter } from '../adapters/SharedDomainEventBusAdapter';

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
import {
  HistorisationParcoursScolaire,
  OrchestrateurInscriptionEleve,
  ServiceApplicationConcurrence,
  type StoreIdempotenceApplication,
  ServiceApplicationTenant,
} from '../../contexts/scolarite-eleves/application/services';
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
  PostgresIdempotencyStore,
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
  autorisationAffectationClasse: AutorisationAffectationClasseAdapter;
  autorisationEleve: AutorisationEleveAdapter;
  autorisationFamille: AutorisationFamilleAdapter;
  autorisationCycleVieEleve: AutorisationCycleVieEleveAdapter;
  autorisationParcoursEleve: AutorisationParcoursEleveAdapter;
  autorisationOrganisationScolarite: AutorisationOrganisationScolariteAdapter;
  sectionClassePedagogiqueAdapter: SectionClassePedagogiqueAdapter;
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
  const autorisationInscriptionComplete = new AutorisationInscriptionCompleteAdapter();
  const autorisationAffectationClasse = new AutorisationAffectationClasseAdapter();
  const autorisationEleve = new AutorisationEleveAdapter();
  const autorisationFamille = new AutorisationFamilleAdapter();
  const autorisationCycleVieEleve = new AutorisationCycleVieEleveAdapter();
  const autorisationParcoursEleve = new AutorisationParcoursEleveAdapter();
  const autorisationOrganisationScolarite = new AutorisationOrganisationScolariteAdapter();
  const sectionClassePedagogiqueAdapter = new SectionClassePedagogiqueAdapter();
  const eventBus = new SharedDomainEventBusAdapter();
  const historisationParcours = new HistorisationParcoursScolaire(
    depots.depotParcours,
    depots.depotInscription,
    depots.depotAffectation,
  );
  const storeIdempotenceTechnique = new PostgresIdempotencyStore(infrastructure.clientLecture);
  const storeIdempotence: StoreIdempotenceApplication<{
    donnee: Awaited<ReturnType<CreerInscriptionComplete['executer']>>;
  }> = {
    async trouver(cleIdempotence) {
      const enregistrement = await storeIdempotenceTechnique.obtenir(cleIdempotence);
      if (enregistrement === null) {
        return null;
      }

      return {
        cleIdempotence,
        empreintePayload: enregistrement.empreinteRequete ?? '',
        sortie: (enregistrement.resultat as {
          donnee: Awaited<ReturnType<CreerInscriptionComplete['executer']>>;
        } | null) ?? { donnee: undefined as never },
      };
    },
    async enregistrer(cleIdempotence, empreintePayload, sortie) {
      const existeDeja = await storeIdempotenceTechnique.existe(cleIdempotence);

      if (!existeDeja) {
        await storeIdempotenceTechnique.enregistrer({
          cle: cleIdempotence,
          statut: 'SUCCES',
          operation: 'SCOLARITE_INSCRIPTION_COMPLETE',
          empreinteRequete: empreintePayload,
          resultat: sortie as unknown as Record<string, unknown>,
        });
        return;
      }

      await storeIdempotenceTechnique.marquerResultat(
        cleIdempotence,
        'SUCCES',
        sortie as unknown as Record<string, unknown>,
      );
    },
  };

  const creerEleve = new CreerEleve(
    depots.depotEleve,
    autorisationEleve,
    serviceTenant,
    serviceTransaction,
  );
  const creerInscription = new CreerInscriptionScolaire(
    depots.depotInscription,
    depots.depotEleve,
    undefined,
    historisationParcours,
    eventBus,
  );
  const affecterEleveAClasse = new AffecterEleveAClasse(
    depots.depotAffectation,
    depots.depotInscription,
    autorisationAffectationClasse,
    undefined,
    historisationParcours,
    eventBus,
  );

  const controleurEleves = new ControleurEleves(
    creerEleve,
    new ModifierEleve(depots.depotEleve, autorisationEleve, serviceConcurrence, serviceTransaction),
    new ConsulterEleve(depots.depotEleve, autorisationEleve),
    new ListerEleves(depots.depotEleve, autorisationEleve),
    new RechercherEleves(depots.depotEleve, autorisationEleve),
    new RattacherEleveAFamille(depots.depotEleve, depots.depotFamille, autorisationEleve),
    new DetacherEleveDeFamille(depots.depotEleve, autorisationEleve),
    new MarquerEleveDecede(depots.depotEleve, serviceConcurrence, autorisationCycleVieEleve),
  );

  const controleurFamilles = new ControleurFamilles(
    new CreerFamille(depots.depotFamille, autorisationFamille),
    new ModifierFamille(depots.depotFamille, autorisationFamille, serviceConcurrence),
    new ConsulterFamille(depots.depotFamille, autorisationFamille),
    new ListerFamilles(depots.depotFamille, autorisationFamille),
    new AjouterResponsableFamille(depots.depotFamille, autorisationFamille, serviceConcurrence),
    new ModifierResponsableFamille(depots.depotFamille, autorisationFamille, serviceConcurrence),
    new RetirerResponsableFamille(depots.depotFamille, autorisationFamille, serviceConcurrence),
    new DefinirResponsablePrincipal(depots.depotFamille, autorisationFamille, serviceConcurrence),
    new EvaluerFamilleNombreuse(depots.depotFamille, autorisationFamille),
  );

  const controleurInscriptions = new ControleurInscriptionsScolaires(
    creerInscription,
    new OrchestrateurInscriptionEleve(
      new CreerInscriptionComplete(
        creerEleve,
        creerInscription,
        new ValiderInscriptionScolaire(
          depots.depotInscription,
          serviceConcurrence,
          historisationParcours,
          eventBus,
        ),
        affecterEleveAClasse,
        autorisationInscriptionComplete,
        serviceTransaction,
      ),
      storeIdempotence,
    ),
    new ValiderInscriptionScolaire(
      depots.depotInscription,
      serviceConcurrence,
      historisationParcours,
      eventBus,
    ),
    new AnnulerInscriptionScolaire(
      depots.depotInscription,
      serviceConcurrence,
      historisationParcours,
    ),
    new ConsulterInscriptionScolaire(depots.depotInscription),
    new ListerInscriptionsParAnnee(depots.depotInscription),
    new ListerInscriptionsParClasse(depots.depotInscription),
  );

  const controleurAffectations = new ControleurAffectationsClasses(
    affecterEleveAClasse,
    new ChangerEleveDeClasse(
      depots.depotAffectation,
      depots.depotInscription,
      autorisationAffectationClasse,
      serviceConcurrence,
      historisationParcours,
      eventBus,
    ),
    new ConsulterAffectationActive(depots.depotAffectation, autorisationAffectationClasse),
    new ListerElevesParClasse(depots.depotAffectation, autorisationAffectationClasse),
    new DesactiverAffectationClasse(depots.depotAffectation, autorisationAffectationClasse),
  );

  const controleurCycleVie = new ControleurCycleVieEleves(
    new DeclarerAbandonEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
    new TransfererEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
    new ReintegrerEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
    new SuspendreEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
    new ReactiverEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
    new DeclarerDecesEleve(
      depots.depotEleve,
      serviceConcurrence,
      autorisationCycleVieEleve,
      historisationParcours,
      eventBus,
    ),
  );

  const controleurParcours = new ControleurParcoursEleves(
    new ConsulterParcoursEleve(depots.depotParcours, autorisationParcoursEleve),
    new ListerEvenementsParEleve(depots.depotParcours, autorisationParcoursEleve),
    new ListerEvenementsParAnnee(
      depots.depotParcours,
      depots.depotInscription,
      depots.depotAffectation,
      sectionClassePedagogiqueAdapter,
      autorisationParcoursEleve,
    ),
    new ReconstruireParcoursEleve(depots.depotParcours, autorisationParcoursEleve),
  );

  const controleurOrganisation = new ControleurScolariteOrganisation(
    new ListerElevesParOrganisation(
      depots.depotEleve,
      autorisationOrganisationScolarite,
    ),
    new ListerInscriptionsParOrganisation(
      depots.depotInscription,
      autorisationOrganisationScolarite,
    ),
    new ConsulterSyntheseScolariteOrganisation(
      depots.depotEleve,
      depots.depotFamille,
      depots.depotInscription,
      autorisationOrganisationScolarite,
    ),
    new ListerAlertesScolariteOrganisation(
      depots.depotEleve,
      depots.depotFamille,
      depots.depotInscription,
      autorisationOrganisationScolarite,
    ),
  );

  return {
    infrastructure,
    autorisationAffectationClasse,
    autorisationEleve,
    autorisationFamille,
    autorisationCycleVieEleve,
    autorisationParcoursEleve,
    autorisationOrganisationScolarite,
    sectionClassePedagogiqueAdapter,
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
      await composition.autorisationAffectationClasse.fermer();
      await composition.autorisationEleve.fermer();
      await composition.autorisationFamille.fermer?.();
      await composition.autorisationCycleVieEleve.fermer();
      await composition.autorisationParcoursEleve.fermer();
      await composition.autorisationOrganisationScolarite.fermer();
      await composition.sectionClassePedagogiqueAdapter.fermer();
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
