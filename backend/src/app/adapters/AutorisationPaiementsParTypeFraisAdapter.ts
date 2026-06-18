import type {
  AutorisationFondsAnticipesPort,
  ResultatAutorisationFondsAnticipes,
} from '../../contexts/paiements-facturation/application/ports/AutorisationFondsAnticipesPort';
import type {
  AutorisationPaiementsParTypeFraisPort,
  ResultatAutorisationPaiementsParTypeFrais,
} from '../../contexts/paiements-facturation/application/ports/AutorisationPaiementsParTypeFraisPort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import type { RoleConsultationHistoriquePaiementsDeleguee } from '../../contexts/paiements-facturation/application/dto/input/ParametresPaiementEntreeDTO';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { SecurityFacade } from '../../shared/security/application/services/SecurityFacade';
import {
  PermissionCacheService,
  PostgresAffectationTitulariatRepository,
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
  SecurityAuditInfrastructureService,
} from '../../shared/security/infrastructure';
import {
  MoteurAutorisation,
  MoteurCapacitesEffectives,
  MoteurRestrictionsMetier,
  MoteurScope,
} from '../../shared/security/domain';

export interface DependancesAutorisationPaiementsParTypeFraisAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
  listerElevesParClasses?: (params: {
    idEcole: string;
    idsClasses: readonly string[];
    idsAnneesScolaires?: readonly string[];
  }) => Promise<readonly string[]>;
  listerClassesParSection?: (params: {
    idEcole: string;
    idSectionScolaire: string;
  }) => Promise<readonly string[]>;
}

export class AutorisationPaiementsParTypeFraisAdapter
  implements AutorisationPaiementsParTypeFraisPort, AutorisationFondsAnticipesPort
{
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
  private readonly infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  private readonly infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotParametresPaiementEcole = new PostgresDepotParametresPaiementEcole(
    this.infrastructurePaiements.clientLecture,
    this.infrastructurePaiements.uniteDeTravail,
  );
  private readonly securityFacade = new SecurityFacade(
    this.roleRepository,
    this.affectationRepository,
    this.titulariatRepository,
    new PermissionCacheService(),
    new MoteurAutorisation(),
    new MoteurScope(),
    new MoteurRestrictionsMetier(),
    new MoteurCapacitesEffectives(),
    new SecurityAuditInfrastructureService(),
  );

  constructor(
    private readonly dependances?: DependancesAutorisationPaiementsParTypeFraisAdapter,
  ) {}

  public async resoudreConsultationPaiementsParTypeFrais(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<ResultatAutorisationPaiementsParTypeFrais> {
    return this.resoudreLecturePedagogiquePaiements(params);
  }

  public async resoudreConsultationFondsAnticipes(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<ResultatAutorisationFondsAnticipes> {
    return this.resoudreLecturePedagogiquePaiements(params);
  }

  private async resoudreLecturePedagogiquePaiements(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<ResultatAutorisationPaiementsParTypeFrais> {
    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER', 'ADMINISTRATEUR_ECOLE'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return {};
    }

    if (await this.estRoleActifDansOrganisation(
      params.idUtilisateur,
      params.idOrganisation,
      ['GESTIONNAIRE_ORGANISATION', 'PROMOTEUR_ORGANISATION'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
      });
      return {};
    }

    const parametres = await this.chargerParametresActifsParEcole(params.idEcole);
    if (parametres === null) {
      throw new ErreurDroitsInsuffisants(
        "Aucun parametrage actif n'autorise une lecture pedagogique de cette analyse financiere pour cette ecole.",
      );
    }

    const titulariats = await this.titulariatRepository.listerActifsParUtilisateur(
      params.idUtilisateur,
    );
    if (
      parametres.autoriseConsultationHistoriquePaiementsPour('TITULAIRE')
      && titulariats.some((titulariat) =>
        titulariat.obtenirIdOrganisation() === params.idOrganisation
        && titulariat.obtenirIdEcole() === params.idEcole)
    ) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });

      const idsClasses = titulariats
        .filter((titulariat) =>
          titulariat.obtenirIdOrganisation() === params.idOrganisation
          && titulariat.obtenirIdEcole() === params.idEcole)
        .map((titulariat) => titulariat.obtenirIdClasse());
      const idsAnneesScolaires = titulariats
        .filter((titulariat) =>
          titulariat.obtenirIdOrganisation() === params.idOrganisation
          && titulariat.obtenirIdEcole() === params.idEcole)
        .map((titulariat) => titulariat.obtenirIdAnneeScolaire());

      return {
        idsElevesAutorises: await this.listerElevesParClasses({
          idEcole: params.idEcole,
          idsClasses,
          idsAnneesScolaires,
        }),
      };
    }

    const lecturePedagogique = await this.resoudreLecturePedagogiqueDeleguee(params, parametres);
    if (lecturePedagogique !== null) {
      return lecturePedagogique;
    }

    throw new ErreurDroitsInsuffisants(
      "L'utilisateur demandeur n'est pas autorise a consulter cette analyse financiere dans ce perimetre.",
    );
  }

  public async fermer(): Promise<void> {
    await this.infrastructurePaiements.pool.end();
    await this.infrastructureScolarite.pool.end();
    await this.infrastructureReferentiel.pool.end();
  }

  private async resoudreLecturePedagogiqueDeleguee(
    params: { idUtilisateur: string; idOrganisation: string; idEcole: string },
    parametres: ParametresPaiementEcole,
  ): Promise<ResultatAutorisationPaiementsParTypeFrais | null> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(params.idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== params.idOrganisation) {
        continue;
      }
      if (affectation.obtenirIdEcole() !== params.idEcole) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      const idSection = affectation.obtenirIdSection();

      if (
        codeRole !== undefined
        && idSection !== undefined
        && this.estRolePedagogiqueDelegue(codeRole)
        && parametres.autoriseConsultationHistoriquePaiementsPour(
          codeRole as RoleConsultationHistoriquePaiementsDeleguee,
        )
      ) {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'paiements.read',
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
          idSection,
        });

        const idsClasses = await this.listerClassesParSection({
          idEcole: params.idEcole,
          idSectionScolaire: idSection,
        });

        return {
          idsElevesAutorises: await this.listerElevesParClasses({
            idEcole: params.idEcole,
            idsClasses,
          }),
        };
      }
    }

    return null;
  }

  private estRolePedagogiqueDelegue(codeRole: string): boolean {
    return [
      'PREFET_ETUDES',
      'DIRECTEUR_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ].includes(codeRole);
  }

  private async chargerParametresActifsParEcole(idEcole: string): Promise<ParametresPaiementEcole | null> {
    if (this.dependances?.chargerParametresActifsParEcole) {
      return this.dependances.chargerParametresActifsParEcole(idEcole);
    }

    return this.depotParametresPaiementEcole.trouverActifParEcole(idEcole);
  }

  private async listerClassesParSection(params: {
    idEcole: string;
    idSectionScolaire: string;
  }): Promise<readonly string[]> {
    if (this.dependances?.listerClassesParSection) {
      return this.dependances.listerClassesParSection(params);
    }

    const resultat = await this.infrastructureReferentiel.clientLecture.executer<{ id: string }>(
      [
        'SELECT "cp"."id"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "classes_academiques" "ca" ON "ca"."id" = "cp"."id_classe_academique"',
        'WHERE "cp"."id_ecole" = $1',
        'AND "ca"."id_section_scolaire" = $2',
        'AND "cp"."archive_le" IS NULL',
      ].join(' '),
      [params.idEcole, params.idSectionScolaire],
    );

    return resultat.lignes.map((ligne) => ligne.id);
  }

  private async listerElevesParClasses(params: {
    idEcole: string;
    idsClasses: readonly string[];
    idsAnneesScolaires?: readonly string[];
  }): Promise<readonly string[]> {
    if (this.dependances?.listerElevesParClasses) {
      return this.dependances.listerElevesParClasses(params);
    }

    if (params.idsClasses.length === 0) {
      return [];
    }

    const clauses = [
      '"inscription"."id_ecole" = $1',
      `"affectation"."id_classe_pedagogique" = ANY($2)`,
      '"affectation"."active" = true',
    ];
    const sqlParams: unknown[] = [params.idEcole, params.idsClasses];

    if (params.idsAnneesScolaires && params.idsAnneesScolaires.length > 0) {
      clauses.push(`"inscription"."id_annee_scolaire" = ANY($${sqlParams.length + 1})`);
      sqlParams.push(params.idsAnneesScolaires);
    }

    const resultat = await this.infrastructureScolarite.clientLecture.executer<{ id_eleve: string }>(
      [
        'SELECT DISTINCT "inscription"."id_eleve"',
        'FROM "affectations_classe" "affectation"',
        'JOIN "inscriptions_scolaires" "inscription"',
        'ON "inscription"."id" = "affectation"."id_inscription_scolaire"',
        `WHERE ${clauses.join(' AND ')}`,
      ].join(' '),
      sqlParams,
    );

    return resultat.lignes.map((ligne) => ligne.id_eleve);
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) continue;
      if (affectation.obtenirIdEcole() !== idEcole) continue;
      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }
    return false;
  }

  private async estRoleActifDansOrganisation(
    idUtilisateur: string,
    idOrganisation: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) continue;
      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();
      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }
    return false;
  }
}
