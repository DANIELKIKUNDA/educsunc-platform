import type { AutorisationRegistreFinancierClassePort } from '../../contexts/paiements-facturation/application/ports/AutorisationRegistreFinancierClassePort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import type { RoleConsultationHistoriquePaiementsDeleguee } from '../../contexts/paiements-facturation/application/dto/input/ParametresPaiementEntreeDTO';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresReferentielAcademique } from '../../contexts/referentiel-academique/infrastructure/persistence/postgres';
import { SecurityCapacitesEffectivesService } from '../../shared/security/application/services/SecurityCapacitesEffectivesService';
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
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

export interface DependancesAutorisationRegistreFinancierClasseAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
  consulterResponsabiliteClassePedagogique?: (params: {
    idOrganisation?: string;
    idEcole?: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }) => Promise<{
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idClasseAcademique: string;
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
    idAnneeScolaire: string;
    idUtilisateurEnseignant: string;
    active: boolean;
  } | null>;
  listerClassesParSection?: (params: {
    idEcole: string;
    idSectionScolaire: string;
  }) => Promise<readonly string[]>;
}

export class AutorisationRegistreFinancierClasseAdapter
  implements AutorisationRegistreFinancierClassePort
{
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
  private readonly infrastructureReferentiel = creerInfrastructurePostgresReferentielAcademique();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotParametresPaiementEcole = new PostgresDepotParametresPaiementEcole(
    this.infrastructurePaiements.clientLecture,
    this.infrastructurePaiements.uniteDeTravail,
  );
  private readonly responsabiliteClassePedagogiqueAdapter =
    new ResponsabiliteClassePedagogiqueAdapter();
  private readonly securityCapacitesEffectivesService: SecurityCapacitesEffectivesService;
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
    private readonly dependances?: DependancesAutorisationRegistreFinancierClasseAdapter,
  ) {
    this.securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
      this.roleRepository,
      this.affectationRepository,
      this.titulariatRepository,
      new MoteurCapacitesEffectives(),
      this.dependances?.consulterResponsabiliteClassePedagogique
        ? {
          consulterActiveParClasseEtAnnee:
            this.dependances.consulterResponsabiliteClassePedagogique,
        }
        : this.responsabiliteClassePedagogiqueAdapter,
    );
  }

  public async verifierConsultationRegistreFinancierClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
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
      return;
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
      return;
    }

    const parametres = await this.chargerParametresActifsParEcole(params.idEcole);
    if (parametres === null) {
      throw new ErreurDroitsInsuffisants(
        "Aucun parametrage actif n'autorise une lecture pedagogique de ce registre financier pour cette ecole.",
      );
    }

    if (
      parametres.autoriseConsultationHistoriquePaiementsPour('TITULAIRE')
      && await this.estTitulaireEffectifDeLaClasse({
        idUtilisateur: params.idUtilisateur,
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClassePedagogique: params.idClassePedagogique,
        idAnneeScolaire: params.idAnneeScolaire,
      })
    ) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    const autoriseParSection = await this.verifierLecturePedagogiqueSectionnelle(params, parametres);
    if (autoriseParSection) {
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "L'utilisateur demandeur n'est pas autorise a consulter ce registre financier de classe dans ce perimetre.",
    );
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
    await this.infrastructurePaiements.pool.end();
    await this.infrastructureReferentiel.pool.end();
  }

  private async verifierLecturePedagogiqueSectionnelle(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
      idClassePedagogique: string;
    },
    parametres: ParametresPaiementEcole,
  ): Promise<boolean> {
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
        codeRole === undefined
        || idSection === undefined
        || !this.estRolePedagogiqueDelegue(codeRole)
        || !parametres.autoriseConsultationHistoriquePaiementsPour(
          codeRole as RoleConsultationHistoriquePaiementsDeleguee,
        )
      ) {
        continue;
      }

      const idsClasses = await this.listerClassesParSection({
        idEcole: params.idEcole,
        idSectionScolaire: idSection,
      });
      if (!idsClasses.includes(params.idClassePedagogique)) {
        continue;
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idSection,
      });
      return true;
    }

    return false;
  }

  private estRolePedagogiqueDelegue(codeRole: string): boolean {
    return [
      'PREFET_ETUDES',
      'DIRECTEUR_ETUDES',
      'DIRECTEUR_PRIMAIRE',
      'DIRECTEUR_MATERNELLE',
    ].includes(codeRole);
  }

  private async estTitulaireEffectifDeLaClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<boolean> {
    const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
      idUtilisateur: params.idUtilisateur,
      idOrganisationActive: params.idOrganisation,
      idEcoleActive: params.idEcole,
      idClasse: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    return capacites.permissions.includes('paiements.read') && capacites.estTitulaireEffectif;
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
