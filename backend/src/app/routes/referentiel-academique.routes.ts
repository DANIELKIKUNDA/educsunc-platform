import type { FastifyPluginAsync } from 'fastify';

import {
  ActiverAnneeScolaire,
  ArchiverAnneeScolaire,
  BasculerAnneeScolaire,
  CloturerAnneeScolaire,
  ConsulterAnneeActiveParEcole,
  ConsulterAnneeScolaire,
  CreerAnneeScolaire,
  GarantirAnneeScolaireActiveParEcole,
  ListerAnneesScolairesParEcole,
  ModifierAnneeScolaire,
  PreparerAnneeScolaireSuivante,
} from '../../contexts/referentiel-academique/application/use-cases/annees';
import {
  ConsulterCalendrierAcademique,
  ConsulterCalendrierParEcoleEtAnnee,
  CreerCalendrierAcademique,
  ModifierPeriodeCalendrier,
  ValiderCalendrierAcademique,
  VerrouillerCalendrierAcademique,
} from '../../contexts/referentiel-academique/application/use-cases/calendriers';
import {
  ActiverEcole,
  ChangerModeExploitationEcole,
  ConsulterEcole,
  CreerEcole,
  DesactiverEcole,
  ListerEcoles,
  ListerEcolesParOrganisation,
  MettreAJourInformationsInstitutionnellesEcole,
  RenommerEcole,
} from '../../contexts/referentiel-academique/application/use-cases/ecoles';
import {
  AnalyserMigrationReferentiel,
  AnnulerMigrationReferentiel,
  AppliquerMigrationReferentiel,
  ConsulterRapportMigration,
  ListerMigrationsReferentielParProgrammeNiveau,
  RelancerRecalculApresMigration,
} from '../../contexts/referentiel-academique/application/use-cases/migrations';
import {
  ActiverOrganisation,
  ConsulterOrganisation,
  CreerOrganisation,
  DesactiverOrganisation,
  ListerOrganisations,
  MettreAJourOrganisation,
  RenommerOrganisation,
} from '../../contexts/referentiel-academique/application/use-cases/organisations';
import { PasswordHashAdapter } from '../../shared/auth/infrastructure';
import { PostgresUtilisateurAuthRepository } from '../../shared/auth/infrastructure/persistence/postgres/repositories/PostgresUtilisateurAuthRepository';
import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
} from '../../shared/security/infrastructure';
import {
  ArchiverProgrammeNiveau,
  ConsulterProgrammeNiveau,
  InitialiserProgrammeNiveau,
  ListerProgrammesNiveauParEcoleEtAnnee,
  ProduireEtatLocalProgramme,
  ValiderProgrammeNiveau,
} from '../../contexts/referentiel-academique/application/use-cases/programmes';
import {
  ActiverVersionReferentiel,
  AjouterLigneVersionReferentielProgramme,
  ComparerDeuxVersionsReferentiel,
  ConsulterReferentielProgramme,
  CreerVersionTravailReferentielDepuisVersion,
  ImporterClassesAcademiquesDepuisJson,
  ImporterCoursAcademiquesDepuisJson,
  ImporterLignesProgrammeDepuisJson,
  ImporterOptionsDepuisJson,
  ImporterProgrammesAcademiquesDepuisJson,
  ImporterSectionsDepuisJson,
  ListerReferentielsCours,
  ListerReferentielsParClasseAcademique,
  ModifierLigneVersionReferentielProgramme,
  ModifierPonderationLigneVersionReferentielProgramme,
  PublierVersionReferentiel,
  ReordonnerLignesVersionReferentielProgramme,
  RetirerLigneVersionReferentielProgramme,
  VerifierCoherenceVersionReferentielAvantPublication,
} from '../../contexts/referentiel-academique/application/use-cases/referentiels';
import {
  AttribuerResponsableClassePedagogique,
  ArchiverClassePedagogique,
  ConsulterResponsableClassePedagogique,
  CreerClasseAcademique,
  CreerClassePedagogique,
  CreerOptionEtude,
  CreerSectionScolaire,
  ConsulterReglesFraisClasse,
  DesactiverClassePedagogique,
  ListerClassesAcademiques,
  ListerClassesPedagogiquesParEcoleEtAnnee,
  ListerOptionsEtudes,
  ListerSectionsScolaires,
  RenommerClassePedagogique,
  RetirerResponsableClassePedagogique,
} from '../../contexts/referentiel-academique/application/use-cases/structure';
import {
  OrchestrateurImportReferentiel,
  ServiceCycleAnneeScolaireRdc,
} from '../../contexts/referentiel-academique/application/services';
import {
  ControleurAnneesScolaires,
  ControleurCalendriersAcademiques,
  ControleurEcoles,
  ControleurMigrationsReferentiel,
  ControleurOrganisations,
  ControleurProgrammesNiveau,
  ControleurReferentielsAcademiques,
  ControleurStructureScolaire,
} from '../../contexts/referentiel-academique/interfaces/http/controllers';
import {
  type DependancesRoutesReferentielAcademique,
  creerExecuteurRouteIdempotenteReferentielAcademique,
  creerExecuteurRouteTenantReferentielAcademique,
  creerRoutesReferentielAcademique,
} from '../../contexts/referentiel-academique/interfaces/http/routes';
import { PostgresIdempotencyStore } from 'shared/infrastructure/idempotency/PostgresIdempotencyStore';
import {
  DepotAnneeScolairePostgres,
  DepotCalendrierAcademiquePostgres,
  DepotClasseAcademiquePostgres,
  DepotClassePedagogiquePostgres,
  DepotEcolePostgres,
  DepotMigrationReferentielProgrammePostgres,
  DepotOptionEtudePostgres,
  DepotOrganisationPostgres,
  DepotProgrammeNiveauPostgres,
  DepotResponsabiliteClassePedagogiquePostgres,
  DepotReferentielCoursPostgres,
  DepotReferentielProgrammePostgres,
  ReglesFraisClasseQueryRepository,
  DepotSectionScolairePostgres,
  type InfrastructurePostgresReferentielAcademique,
  creerInfrastructurePostgresReferentielAcademique,
} from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { OrganisationId } from '../../contexts/referentiel-academique/domain/value-objects/OrganisationId';
import { ServiceJournalAuditReferentielAcademiquePostgres } from '../../contexts/referentiel-academique/infrastructure/services/ServiceJournalAuditReferentielAcademiquePostgres';
import { ContexteExecutionTenantReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { AutorisationSocleAcademiqueAdapter } from '../adapters/AutorisationSocleAcademiqueAdapter';
import { AutorisationMigrationReferentielAdapter } from '../adapters/AutorisationMigrationReferentielAdapter';
import { EligibiliteResponsableClassePedagogiqueAdapter } from '../adapters/EligibiliteResponsableClassePedagogiqueAdapter';
import { configurationInitialisationService } from './configuration.routes';

// Cette interface regroupe les depots PostgreSQL utiles au BC une fois compose.
interface DepotsReferentielAcademique {
  depotOrganisation: DepotOrganisationPostgres;
  depotEcole: DepotEcolePostgres;
  depotAnneeScolaire: DepotAnneeScolairePostgres;
  depotSectionScolaire: DepotSectionScolairePostgres;
  depotClasseAcademique: DepotClasseAcademiquePostgres;
  depotOptionEtude: DepotOptionEtudePostgres;
  depotClassePedagogique: DepotClassePedagogiquePostgres;
  depotResponsabiliteClassePedagogique: DepotResponsabiliteClassePedagogiquePostgres;
  depotReferentielCours: DepotReferentielCoursPostgres;
  depotReferentielProgramme: DepotReferentielProgrammePostgres;
  depotProgrammeNiveau: DepotProgrammeNiveauPostgres;
  depotCalendrierAcademique: DepotCalendrierAcademiquePostgres;
  depotMigrationReferentielProgramme: DepotMigrationReferentielProgrammePostgres;
  reglesFraisClasseQueryRepository: ReglesFraisClasseQueryRepository;
}

// Cette interface regroupe l'infrastructure et les controleurs a brancher dans Fastify.
interface CompositionRoutesReferentielAcademique {
  infrastructure: InfrastructurePostgresReferentielAcademique;
  dependancesRoutes: DependancesRoutesReferentielAcademique;
}

async function rattraperConfigurationsInitialesExistantes(
  depots: DepotsReferentielAcademique,
): Promise<{ organisations: number; ecoles: number }> {
  const taillePage = 500;
  let page = 1;
  let organisationsTraitees = 0;
  let ecolesTraitees = 0;

  while (true) {
    const resultat = await depots.depotOrganisation.lister({ page, taillePage });
    for (const organisation of resultat.donnees) {
      await configurationInitialisationService.amorcerOrganisation({
        organisationId: organisation.obtenirId().obtenirValeur(),
      });
      organisationsTraitees += 1;
    }

    if (resultat.donnees.length < taillePage) {
      break;
    }

    page += 1;
  }

  page = 1;
  while (true) {
    const resultat = await depots.depotEcole.lister({ page, taillePage });
    for (const ecole of resultat.donnees) {
      await configurationInitialisationService.amorcerEcole({
        organisationId: ecole.obtenirOrganisationId().obtenirValeur(),
        ecoleId: ecole.obtenirId().obtenirValeur(),
      });
      ecolesTraitees += 1;
    }

    if (resultat.donnees.length < taillePage) {
      break;
    }

    page += 1;
  }

  return {
    organisations: organisationsTraitees,
    ecoles: ecolesTraitees,
  };
}

// Cette fonction instancie les depots PostgreSQL du BC sur un meme pool et une meme unite de travail.
function creerDepotsReferentielAcademique(
  infrastructure: InfrastructurePostgresReferentielAcademique,
  contexteExecutionTenant: ContexteExecutionTenantReferentielAcademique,
): DepotsReferentielAcademique {
  const { clientLecture, uniteDeTravail } = infrastructure;

  return {
    depotOrganisation: new DepotOrganisationPostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotEcole: new DepotEcolePostgres(clientLecture, uniteDeTravail, contexteExecutionTenant),
    depotAnneeScolaire: new DepotAnneeScolairePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotSectionScolaire: new DepotSectionScolairePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotClasseAcademique: new DepotClasseAcademiquePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotOptionEtude: new DepotOptionEtudePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotClassePedagogique: new DepotClassePedagogiquePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotResponsabiliteClassePedagogique: new DepotResponsabiliteClassePedagogiquePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotReferentielCours: new DepotReferentielCoursPostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotReferentielProgramme: new DepotReferentielProgrammePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotProgrammeNiveau: new DepotProgrammeNiveauPostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotCalendrierAcademique: new DepotCalendrierAcademiquePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    depotMigrationReferentielProgramme: new DepotMigrationReferentielProgrammePostgres(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
    reglesFraisClasseQueryRepository: new ReglesFraisClasseQueryRepository(
      clientLecture,
      uniteDeTravail,
      contexteExecutionTenant,
    ),
  };
}

// Cette fonction compose explicitement les cas d'usage, services et controleurs HTTP du BC.
function composerRoutesReferentielAcademique(): CompositionRoutesReferentielAcademique {
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const infrastructure = creerInfrastructurePostgresReferentielAcademique(
    undefined,
    undefined,
    contexteExecutionTenant,
  );
  const depots = creerDepotsReferentielAcademique(infrastructure, contexteExecutionTenant);
  const serviceTransactionApplication = infrastructure.uniteDeTravail;
  const serviceCycleAnneeScolaire = new ServiceCycleAnneeScolaireRdc();
  const serviceJournalAudit = new ServiceJournalAuditReferentielAcademiquePostgres(
    infrastructure.clientLecture,
    infrastructure.uniteDeTravail,
    contexteExecutionTenant,
  );
  const storeIdempotence = new PostgresIdempotencyStore(infrastructure.clientLecture);
  const executerRouteTenant =
    creerExecuteurRouteTenantReferentielAcademique(contexteExecutionTenant);
  const executerRouteIdempotente =
    creerExecuteurRouteIdempotenteReferentielAcademique(storeIdempotence);
  const eligibiliteResponsableClassePedagogiqueAdapter =
    new EligibiliteResponsableClassePedagogiqueAdapter();
  const autorisationSocleAcademiqueAdapter = new AutorisationSocleAcademiqueAdapter();
  const autorisationMigrationReferentielAdapter = new AutorisationMigrationReferentielAdapter(
    autorisationSocleAcademiqueAdapter,
  );
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const roleRepositorySecurity = new PostgresRoleRepository();
  const affectationRepositorySecurity = new PostgresAffectationUtilisateurRepository();
  const passwordHashAdapter = new PasswordHashAdapter();

  const controleurOrganisations = new ControleurOrganisations(
    new CreerOrganisation(depots.depotOrganisation, undefined, {
      depotUtilisateurAuth,
      roleRepository: roleRepositorySecurity,
      affectationRepository: affectationRepositorySecurity,
      passwordHashPort: passwordHashAdapter,
      serviceJournalAudit,
      initialisationConfiguration: configurationInitialisationService,
    }),
    new ConsulterOrganisation(depots.depotOrganisation),
    new ListerOrganisations(depots.depotOrganisation),
    new MettreAJourOrganisation(
      depots.depotOrganisation,
      depotUtilisateurAuth,
      undefined,
      serviceJournalAudit,
    ),
    new RenommerOrganisation(depots.depotOrganisation, undefined, serviceJournalAudit),
    new ActiverOrganisation(depots.depotOrganisation, undefined, serviceJournalAudit),
    new DesactiverOrganisation(depots.depotOrganisation, undefined, serviceJournalAudit),
    undefined,
    {
      consulter: async (idOrganisation: string, idResponsablePrincipal?: string) => {
        const totalUtilisateursActifs = await affectationRepositorySecurity
          .compterUtilisateursActifsOrganisation(idOrganisation);

        if (!idResponsablePrincipal) {
          return {
            organisationId: idOrganisation,
            totalUtilisateursActifs,
          };
        }

        const utilisateurResponsable =
          await depotUtilisateurAuth.trouverParId(idResponsablePrincipal);

        return {
          organisationId: idOrganisation,
          totalUtilisateursActifs,
          responsablePrincipal: utilisateurResponsable
            ? {
              utilisateurId: idResponsablePrincipal,
              etatCompte: utilisateurResponsable.obtenirEtatCompte(),
              dernierAccesLe: utilisateurResponsable.obtenirDernierAccesLe()?.toISOString(),
              dernierLoginLe: utilisateurResponsable.obtenirDernierLoginLe()?.toISOString(),
            }
            : undefined,
          };
      },
    },
    {
      lister: async (idOrganisation: string) => {
        interface LigneHistoriqueOrganisation {
          id: string;
          action: string;
          acteur: string | null;
          description: string | null;
          cree_le: string | Date;
          details: Readonly<Record<string, unknown>> | null;
        }

        const organisation = await depots.depotOrganisation.trouverParId(
          new OrganisationId(idOrganisation),
        );

        const resultat = await infrastructure.clientLecture.executer<LigneHistoriqueOrganisation>(
          [
            'SELECT',
            '  "id",',
            '  "action",',
            '  "acteur",',
            '  "details",',
            '  "cree_le",',
            '  CASE',
            "    WHEN \"action\" = 'CREER_ORGANISATION' THEN 'Organisation creee'",
            "    WHEN \"action\" = 'RENOMMER_ORGANISATION' THEN 'Organisation renommee'",
            "    WHEN \"action\" = 'METTRE_A_JOUR_ORGANISATION' THEN 'Organisation mise a jour'",
            "    WHEN \"action\" = 'ACTIVER_ORGANISATION' THEN 'Organisation activee'",
            "    WHEN \"action\" = 'DESACTIVER_ORGANISATION' THEN 'Organisation desactivee'",
            "    ELSE 'Evenement organisation'",
            '  END AS "description"',
            'FROM "audit_logs"',
            'WHERE "id_organisation" = $1',
            '   OR ("type_ressource" = $2 AND "id_ressource" = $1::text)',
            'ORDER BY "cree_le" DESC',
          ].join(' '),
          [idOrganisation, 'ORGANISATION'],
        );

        const evenements = resultat.lignes.map((ligne) => ({
          id: ligne.id,
          action: ligne.action,
          acteur: ligne.acteur ?? undefined,
          description: ligne.description ?? 'Evenement organisation',
          creeLe:
            ligne.cree_le instanceof Date
              ? ligne.cree_le.toISOString()
              : String(ligne.cree_le),
          details: ligne.details ?? undefined,
        }));

        const aCreationNative = evenements.some((evenement) => evenement.action === 'CREER_ORGANISATION');

        if (organisation && !aCreationNative) {
          evenements.push({
            id: `${organisation.obtenirId().obtenirValeur()}-fallback-creation`,
            action: 'CREER_ORGANISATION',
            acteur: organisation.obtenirCreePar(),
            description: 'Organisation creee',
            creeLe: organisation.obtenirCreeLe().toISOString(),
            details: {
              code: organisation.obtenirCode(),
              nom: organisation.obtenirNom(),
              typeOrganisation: organisation.obtenirTypeOrganisation(),
              source: 'fallback-aggregate',
            },
          });
        }

        return evenements.sort((a, b) => Date.parse(b.creeLe) - Date.parse(a.creeLe));
      },
    },
  );

  const controleurEcoles = new ControleurEcoles(
    new CreerEcole(
      depots.depotEcole,
      depots.depotOrganisation,
      undefined,
      configurationInitialisationService,
    ),
    new ConsulterEcole(depots.depotEcole),
    new ListerEcoles(depots.depotEcole),
    new ListerEcolesParOrganisation(depots.depotEcole),
    new ChangerModeExploitationEcole(depots.depotEcole),
    new MettreAJourInformationsInstitutionnellesEcole(depots.depotEcole),
    new RenommerEcole(depots.depotEcole),
    new ActiverEcole(depots.depotEcole),
    new DesactiverEcole(depots.depotEcole),
    undefined,
    async (idUtilisateur) => {
      const utilisateur = await depotUtilisateurAuth.trouverParId(idUtilisateur);
      return utilisateur?.obtenirNomComplet();
    },
  );

  const controleurAnneesScolaires = new ControleurAnneesScolaires(
    new CreerAnneeScolaire(
      depots.depotAnneeScolaire,
      depots.depotEcole,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ModifierAnneeScolaire(
      depots.depotAnneeScolaire,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ConsulterAnneeScolaire(depots.depotAnneeScolaire),
    new ListerAnneesScolairesParEcole(depots.depotAnneeScolaire, depots.depotEcole),
    new ActiverAnneeScolaire(depots.depotAnneeScolaire, undefined, serviceJournalAudit),
    new CloturerAnneeScolaire(depots.depotAnneeScolaire, undefined, serviceJournalAudit),
    new ArchiverAnneeScolaire(depots.depotAnneeScolaire, undefined, serviceJournalAudit),
    new ConsulterAnneeActiveParEcole(depots.depotAnneeScolaire, depots.depotEcole),
    new PreparerAnneeScolaireSuivante(
      depots.depotAnneeScolaire,
      depots.depotEcole,
      serviceCycleAnneeScolaire,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new GarantirAnneeScolaireActiveParEcole(
      depots.depotAnneeScolaire,
      depots.depotEcole,
      serviceCycleAnneeScolaire,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new BasculerAnneeScolaire(
      depots.depotAnneeScolaire,
      depots.depotEcole,
      serviceCycleAnneeScolaire,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
  );

  const controleurStructureScolaire = new ControleurStructureScolaire(
    new CreerSectionScolaire(depots.depotSectionScolaire),
    new CreerClasseAcademique(
      depots.depotClasseAcademique,
      depots.depotSectionScolaire,
      depots.depotOptionEtude,
    ),
    new CreerOptionEtude(depots.depotOptionEtude),
    new CreerClassePedagogique(
      depots.depotClassePedagogique,
      depots.depotEcole,
      depots.depotAnneeScolaire,
      depots.depotClasseAcademique,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ListerSectionsScolaires(depots.depotSectionScolaire),
    new ListerClassesAcademiques(depots.depotClasseAcademique),
    new ListerClassesPedagogiquesParEcoleEtAnnee(
      depots.depotClassePedagogique,
      depots.depotEcole,
      depots.depotAnneeScolaire,
    ),
    new ListerOptionsEtudes(depots.depotOptionEtude),
    new AttribuerResponsableClassePedagogique(
      depots.depotResponsabiliteClassePedagogique,
      depots.depotClassePedagogique,
      depots.depotClasseAcademique,
      depots.depotSectionScolaire,
      depots.depotAnneeScolaire,
      depots.depotEcole,
      eligibiliteResponsableClassePedagogiqueAdapter,
    ),
    new RetirerResponsableClassePedagogique(
      depots.depotResponsabiliteClassePedagogique,
      depots.depotClasseAcademique,
      depots.depotSectionScolaire,
    ),
    new ConsulterResponsableClassePedagogique(
      depots.depotResponsabiliteClassePedagogique,
      depots.depotClasseAcademique,
      depots.depotSectionScolaire,
    ),
    new RenommerClassePedagogique(depots.depotClassePedagogique),
    new DesactiverClassePedagogique(depots.depotClassePedagogique),
    new ArchiverClassePedagogique(depots.depotClassePedagogique),
    new ConsulterReglesFraisClasse(depots.reglesFraisClasseQueryRepository),
    autorisationSocleAcademiqueAdapter,
  );

  const casUsageImporterSectionsDepuisJson = new ImporterSectionsDepuisJson(
    depots.depotSectionScolaire,
  );
  const casUsageImporterOptionsDepuisJson = new ImporterOptionsDepuisJson(
    depots.depotOptionEtude,
  );
  const casUsageImporterClassesAcademiquesDepuisJson =
    new ImporterClassesAcademiquesDepuisJson(
      depots.depotClasseAcademique,
      depots.depotSectionScolaire,
      depots.depotOptionEtude,
    );
  const casUsageImporterCoursAcademiquesDepuisJson =
    new ImporterCoursAcademiquesDepuisJson(depots.depotReferentielCours);
  const casUsageImporterProgrammesAcademiquesDepuisJson =
    new ImporterProgrammesAcademiquesDepuisJson(
      depots.depotReferentielProgramme,
      depots.depotClasseAcademique,
      depots.depotReferentielCours,
    );
  const casUsageImporterLignesProgrammeDepuisJson =
    new ImporterLignesProgrammeDepuisJson(depots.depotReferentielCours);
  const orchestrateurImportReferentiel = new OrchestrateurImportReferentiel(
    casUsageImporterSectionsDepuisJson,
    casUsageImporterOptionsDepuisJson,
    casUsageImporterClassesAcademiquesDepuisJson,
    casUsageImporterCoursAcademiquesDepuisJson,
    casUsageImporterProgrammesAcademiquesDepuisJson,
    casUsageImporterLignesProgrammeDepuisJson,
    serviceTransactionApplication,
  );

  const controleurReferentielsAcademiques = new ControleurReferentielsAcademiques(
    orchestrateurImportReferentiel,
    new PublierVersionReferentiel(depots.depotReferentielProgramme, undefined, serviceJournalAudit),
    new ActiverVersionReferentiel(depots.depotReferentielProgramme, undefined, serviceJournalAudit),
    new ComparerDeuxVersionsReferentiel(
      depots.depotReferentielProgramme,
      depots.depotClasseAcademique,
    ),
    new ConsulterReferentielProgramme(depots.depotReferentielProgramme),
    new ListerReferentielsParClasseAcademique(
      depots.depotReferentielProgramme,
      depots.depotClasseAcademique,
    ),
    new ListerReferentielsCours(depots.depotReferentielCours),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new CreerVersionTravailReferentielDepuisVersion(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new AjouterLigneVersionReferentielProgramme(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new ModifierLigneVersionReferentielProgramme(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new RetirerLigneVersionReferentielProgramme(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new ReordonnerLignesVersionReferentielProgramme(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new ModifierPonderationLigneVersionReferentielProgramme(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
    new VerifierCoherenceVersionReferentielAvantPublication(
      depots.depotReferentielProgramme,
      depots.depotMigrationReferentielProgramme,
      undefined,
      serviceJournalAudit,
    ),
  );

  const controleurProgrammesNiveau = new ControleurProgrammesNiveau(
    new InitialiserProgrammeNiveau(
      depots.depotProgrammeNiveau,
      depots.depotEcole,
      depots.depotAnneeScolaire,
      depots.depotClasseAcademique,
      depots.depotReferentielProgramme,
      undefined,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ConsulterProgrammeNiveau(depots.depotProgrammeNiveau),
    new ValiderProgrammeNiveau(
      depots.depotProgrammeNiveau,
      depots.depotReferentielProgramme,
      undefined,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ArchiverProgrammeNiveau(depots.depotProgrammeNiveau, undefined, serviceJournalAudit),
    new ListerProgrammesNiveauParEcoleEtAnnee(
      depots.depotProgrammeNiveau,
      depots.depotEcole,
      depots.depotAnneeScolaire,
    ),
    new ProduireEtatLocalProgramme(depots.depotProgrammeNiveau),
  );

  const controleurCalendriersAcademiques = new ControleurCalendriersAcademiques(
    new CreerCalendrierAcademique(
      depots.depotCalendrierAcademique,
      depots.depotEcole,
      depots.depotAnneeScolaire,
      undefined,
      undefined,
      undefined,
      serviceTransactionApplication,
      serviceJournalAudit,
    ),
    new ModifierPeriodeCalendrier(
      depots.depotCalendrierAcademique,
      undefined,
      undefined,
      serviceJournalAudit,
    ),
    new ValiderCalendrierAcademique(
      depots.depotCalendrierAcademique,
      undefined,
      undefined,
      undefined,
      serviceJournalAudit,
    ),
    new VerrouillerCalendrierAcademique(
      depots.depotCalendrierAcademique,
      undefined,
      undefined,
      undefined,
      serviceJournalAudit,
    ),
    new ConsulterCalendrierAcademique(depots.depotCalendrierAcademique),
    new ConsulterCalendrierParEcoleEtAnnee(depots.depotCalendrierAcademique),
  );

  const controleurMigrationsReferentiel = new ControleurMigrationsReferentiel(
    new AnalyserMigrationReferentiel(
      depots.depotMigrationReferentielProgramme,
      depots.depotProgrammeNiveau,
      depots.depotReferentielProgramme,
      undefined,
      undefined,
      undefined,
      serviceJournalAudit,
    ),
    new AppliquerMigrationReferentiel(
      depots.depotMigrationReferentielProgramme,
      depots.depotProgrammeNiveau,
      depots.depotReferentielProgramme,
      undefined,
      undefined,
      undefined,
      serviceJournalAudit,
      serviceTransactionApplication,
    ),
    new AnnulerMigrationReferentiel(
      depots.depotMigrationReferentielProgramme,
      undefined,
      undefined,
      undefined,
      serviceJournalAudit,
    ),
    new ConsulterRapportMigration(depots.depotMigrationReferentielProgramme),
    new ListerMigrationsReferentielParProgrammeNiveau(
      depots.depotMigrationReferentielProgramme,
    ),
    new RelancerRecalculApresMigration(depots.depotMigrationReferentielProgramme),
    autorisationMigrationReferentielAdapter,
  );

  return {
    infrastructure,
    dependancesRoutes: {
      controleurOrganisations,
      controleurEcoles,
      controleurAnneesScolaires,
      controleurStructureScolaire,
      controleurReferentielsAcademiques,
      controleurProgrammesNiveau,
      controleurCalendriersAcademiques,
      controleurMigrationsReferentiel,
      executerRouteTenant,
      executerRouteIdempotente,
    },
  };
}

type PluginRoutesReferentielAcademique = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

// Ce plugin branche le BC referentiel academique sur Fastify avec sa composition complete.
export const routeReferentielAcademique: PluginRoutesReferentielAcademique = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesReferentielAcademique();
    const bilanMigrations =
      await composition.infrastructure.migrateur.executerMigrationsEnAttente();
    const depotsRattrapage = creerDepotsReferentielAcademique(
      composition.infrastructure,
      new ContexteExecutionTenantReferentielAcademique(),
    );
    const rattrapageConfiguration = await rattraperConfigurationsInitialesExistantes(
      depotsRattrapage,
    );

    serveur.addHook('onClose', async () => {
      await composition.infrastructure.pool.end();
    });

    await serveur.register(
      creerRoutesReferentielAcademique(composition.dependancesRoutes),
    );

    serveur.log.info(
      {
        contexte: {
          bc: 'referentiel-academique',
          prefixe: routeReferentielAcademique.prefixe,
          migrationsExecutees: bilanMigrations.executees,
          migrationsSautees: bilanMigrations.sautees,
          configurationsRattrapeesOrganisations: rattrapageConfiguration.organisations,
          configurationsRattrapeesEcoles: rattrapageConfiguration.ecoles,
        },
      },
      'Routes du BC referentiel academique enregistrees.',
    );
  },
  {
    nom: 'referentiel-academique',
    prefixe: '/api',
  },
);
