import type { AutorisationLectureBulletinPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationLectureBulletinPort';
import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
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
import { ScolariteElevesAdapter } from '../../contexts/paiements-facturation/infrastructure/adapters/ScolariteElevesAdapter';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';
import { SectionClassePedagogiqueAdapter } from './SectionClassePedagogiqueAdapter';

interface DependancesAutorisationLectureBulletinAdapter {
  consulterFamilleEleve?: (idEleve: string) => Promise<{
    idFamille: string;
    idEcole: string;
    responsables?: Array<{
      idResponsableFamille: string;
      idUtilisateurAuth?: string;
      estPrincipal: boolean;
    }>;
  } | null>;
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
  resoudreSectionClasse?: (params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }) => Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null>;
  verifierEleveAutoriseParent?: (params: {
    idUtilisateur: string;
    idEleve: string;
    idEcole: string;
  }) => Promise<boolean>;
}

// Cet adaptateur reapplique la doctrine permission + perimetre pour la lecture d'un bulletin.
export class AutorisationLectureBulletinAdapter implements AutorisationLectureBulletinPort {
  private readonly infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly scolariteElevesAdapter = new ScolariteElevesAdapter(
    this.infrastructureScolarite.clientLecture,
  );
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
  private readonly sectionClassePedagogiqueAdapter = new SectionClassePedagogiqueAdapter();
  private readonly securityCapacitesEffectivesService: SecurityCapacitesEffectivesService;
  private readonly securityFacade: SecurityFacade;

  constructor(
    private readonly dependances?: DependancesAutorisationLectureBulletinAdapter,
  ) {
    const responsabiliteClassePort = this.dependances?.consulterResponsabiliteClassePedagogique
      ? {
        consulterActiveParClasseEtAnnee:
          this.dependances.consulterResponsabiliteClassePedagogique,
      }
      : this.responsabiliteClassePedagogiqueAdapter;

    this.securityFacade = new SecurityFacade(
      this.roleRepository,
      this.affectationRepository,
      this.titulariatRepository,
      new PermissionCacheService(),
      new MoteurAutorisation(),
      new MoteurScope(),
      new MoteurRestrictionsMetier(),
      new MoteurCapacitesEffectives(),
      new SecurityAuditInfrastructureService(),
      responsabiliteClassePort,
    );

    this.securityCapacitesEffectivesService = new SecurityCapacitesEffectivesService(
      this.roleRepository,
      this.affectationRepository,
      this.titulariatRepository,
      new MoteurCapacitesEffectives(),
      responsabiliteClassePort,
    );
  }

  public async verifierLectureBulletin(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idEleve: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['PARENT'],
    )) {
      const estAutorise = await this.verifierEleveAutoriseParent(params);
      if (!estAutorise) {
        throw new ApplicationException(
          "Le parent courant n'est pas autorise a consulter le bulletin de cet eleve.",
          'BULLETIN_LECTURE_PARENT_ACCES_REFUSE',
        );
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['ADMINISTRATEUR_ECOLE'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    if (await this.estRoleActifDansOrganisation(
      params.idUtilisateur,
      params.idOrganisation,
      ['PROMOTEUR_ORGANISATION'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
      });
      return;
    }

    const section = await this.resoudreSectionClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: params.idClassePedagogique,
      idAnneeScolaire: params.idAnneeScolaire,
    });

    if (
      section !== null
      && await this.estRoleActifDansPerimetre(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        [
          'PREFET_ETUDES',
          'DIRECTEUR_ETUDES',
          'DIRECTEUR_DISCIPLINE',
          'DIRECTEUR_PRIMAIRE',
          'DIRECTEUR_MATERNELLE',
        ],
        section.idSectionScolaire,
      )
    ) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idSection: section.idSectionScolaire,
      });
      return;
    }

    if (await this.estTitulaireEffectifDeLaClasse(params)) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'bulletins.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        idClasse: params.idClassePedagogique,
        idAnneeScolaire: params.idAnneeScolaire,
      });
      return;
    }

    throw new ApplicationException(
      "L'utilisateur demandeur n'est pas autorise a consulter ce bulletin.",
      'BULLETIN_LECTURE_ACCES_REFUSE',
    );
  }

  public async fermer(): Promise<void> {
    await this.sectionClassePedagogiqueAdapter.fermer();
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
    await this.infrastructureScolarite.pool.end();
  }

  private async verifierEleveAutoriseParent(params: {
    idUtilisateur: string;
    idEleve: string;
    idEcole: string;
  }): Promise<boolean> {
    if (this.dependances?.verifierEleveAutoriseParent) {
      return this.dependances.verifierEleveAutoriseParent(params);
    }

    const famille = await this.consulterFamilleEleve(params.idEleve);
    if (famille === null || famille.idEcole !== params.idEcole) {
      return false;
    }

    return famille.responsables?.some(
      (responsable) => responsable.idUtilisateurAuth === params.idUtilisateur,
    ) === true;
  }

  private async consulterFamilleEleve(idEleve: string): Promise<{
    idFamille: string;
    idEcole: string;
    responsables?: Array<{
      idResponsableFamille: string;
      idUtilisateurAuth?: string;
      estPrincipal: boolean;
    }>;
  } | null> {
    if (this.dependances?.consulterFamilleEleve) {
      return this.dependances.consulterFamilleEleve(idEleve);
    }

    return this.scolariteElevesAdapter.consulterFamilleEleve(idEleve);
  }

  private async resoudreSectionClasse(params: {
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<{
    idSectionScolaire: string;
    sectionCode: string;
    sectionLibelle: string;
  } | null> {
    if (this.dependances?.resoudreSectionClasse) {
      return this.dependances.resoudreSectionClasse(params);
    }

    return this.sectionClassePedagogiqueAdapter.consulterSectionClasse(params);
  }

  private async estTitulaireEffectifDeLaClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
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

    return capacites.permissions.includes('bulletins.read') && capacites.estTitulaireEffectif;
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string | undefined,
    idEcole: string,
    codesRolesAutorises: readonly string[],
    idSectionAttendue?: string,
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdEcole() !== idEcole) {
        continue;
      }

      if (idOrganisation !== undefined && affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      if (idSectionAttendue !== undefined && affectation.obtenirIdSection() !== idSectionAttendue) {
        continue;
      }

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
    idOrganisation: string | undefined,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    if (idOrganisation === undefined) {
      return false;
    }

    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }

    return false;
  }
}
