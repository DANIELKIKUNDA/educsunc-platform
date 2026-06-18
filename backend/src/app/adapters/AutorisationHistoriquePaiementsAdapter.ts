import type { AutorisationHistoriquePaiementsPort } from '../../contexts/paiements-facturation/application/ports/AutorisationHistoriquePaiementsPort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import {
  type RoleConsultationHistoriquePaiementsDeleguee,
} from '../../contexts/paiements-facturation/application/dto/input/ParametresPaiementEntreeDTO';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
import { creerInfrastructurePostgresScolariteEleves } from '../../contexts/scolarite-eleves/infrastructure/persistence/postgres';
import { ScolariteElevesAdapter } from '../../contexts/paiements-facturation/infrastructure/adapters/ScolariteElevesAdapter';
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
import { SectionClassePedagogiqueAdapter } from './SectionClassePedagogiqueAdapter';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

export interface DependancesAutorisationHistoriquePaiementsAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
  consulterClasseActiveEleve?: (idEleve: string) => Promise<{
    idClassePedagogique: string;
    idEcole: string;
    idAnneeScolaire: string;
  } | null>;
  consulterFamilleEleve?: (idEleve: string) => Promise<{
    idFamille: string;
    idEcole: string;
    nombreEnfants?: number;
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
    idOrganisation: string;
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
    idOrganisation: string;
    idEcole: string;
  }) => Promise<boolean>;
}

export class AutorisationHistoriquePaiementsAdapter
  implements AutorisationHistoriquePaiementsPort
{
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
  private readonly infrastructureScolarite = creerInfrastructurePostgresScolariteEleves();
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly depotParametresPaiementEcole = new PostgresDepotParametresPaiementEcole(
    this.infrastructurePaiements.clientLecture,
    this.infrastructurePaiements.uniteDeTravail,
  );
  private readonly scolariteElevesAdapter = new ScolariteElevesAdapter(
    this.infrastructureScolarite.clientLecture,
  );
  private readonly sectionClassePedagogiqueAdapter = new SectionClassePedagogiqueAdapter();
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
    private readonly dependances?: DependancesAutorisationHistoriquePaiementsAdapter,
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

  public async verifierConsultationHistoriquePaiements(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
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

    if (
      await this.estRoleActifDansPerimetre(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        ['PARENT'],
      )
    ) {
      const estAutorise = await this.verifierEleveAutoriseParent(params);
      if (!estAutorise) {
        throw new ErreurDroitsInsuffisants(
          "Le parent courant n'est pas autorise a consulter l'historique de cet eleve.",
        );
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    const parametres = await this.chargerParametresActifsParEcole(params.idEcole);
    if (parametres === null) {
      throw new ErreurDroitsInsuffisants(
        "Aucun parametrage actif n'autorise une consultation pedagogique de l'historique des paiements pour cette ecole.",
      );
    }

    const classeActive = await this.consulterClasseActiveEleve(params.idEleve);
    if (classeActive === null || classeActive.idEcole !== params.idEcole) {
      throw new ErreurDroitsInsuffisants(
        "Le perimetre pedagogique de l'eleve est introuvable pour cette consultation.",
      );
    }

    const section = await this.resoudreSectionClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idClassePedagogique: classeActive.idClassePedagogique,
      idAnneeScolaire: classeActive.idAnneeScolaire,
    });

    if (section === null) {
      throw new ErreurDroitsInsuffisants(
        "La section scolaire de l'eleve est introuvable pour cette consultation.",
      );
    }

    if (
      parametres.autoriseConsultationHistoriquePaiementsPour('TITULAIRE')
      && await this.estTitulaireEffectifDeLaClasse(params, classeActive)
    ) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    const roleDelegue = await this.determinerRoleDelegueAutorise({
      idUtilisateur: params.idUtilisateur,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSectionScolaire: section.idSectionScolaire,
      sectionCode: section.sectionCode,
    });

    if (roleDelegue === null) {
      throw new ErreurDroitsInsuffisants(
        "L'utilisateur demandeur n'est pas autorise a consulter cet historique dans ce perimetre.",
      );
    }

    if (!parametres.autoriseConsultationHistoriquePaiementsPour(roleDelegue)) {
      throw new ErreurDroitsInsuffisants(
        "Le parametrage de l'ecole n'autorise pas ce role a consulter l'historique des paiements.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'paiements.read',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSection: section.idSectionScolaire,
    });
  }

  public async fermer(): Promise<void> {
    await this.sectionClassePedagogiqueAdapter.fermer();
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
    await this.infrastructurePaiements.pool.end();
    await this.infrastructureScolarite.pool.end();
  }

  private async chargerParametresActifsParEcole(
    idEcole: string,
  ): Promise<ParametresPaiementEcole | null> {
    if (this.dependances?.chargerParametresActifsParEcole) {
      return this.dependances.chargerParametresActifsParEcole(idEcole);
    }

    return this.depotParametresPaiementEcole.trouverActifParEcole(idEcole);
  }

  private async consulterClasseActiveEleve(idEleve: string): Promise<{
    idClassePedagogique: string;
    idEcole: string;
    idAnneeScolaire: string;
  } | null> {
    if (this.dependances?.consulterClasseActiveEleve) {
      return this.dependances.consulterClasseActiveEleve(idEleve);
    }

    return this.scolariteElevesAdapter.consulterClasseActiveEleve(idEleve);
  }

  private async resoudreSectionClasse(params: {
    idOrganisation: string;
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

  private async verifierEleveAutoriseParent(params: {
    idUtilisateur: string;
    idEleve: string;
    idOrganisation: string;
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
    nombreEnfants?: number;
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

  private async determinerRoleDelegueAutorise(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
    sectionCode: string;
  }): Promise<RoleConsultationHistoriquePaiementsDeleguee | null> {
    const codesRoles = await this.listerCodesRolesActifsDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      params.idSectionScolaire,
    );

    if (params.sectionCode === 'SECONDAIRE') {
      if (codesRoles.includes('PREFET_ETUDES')) {
        return 'PREFET_ETUDES';
      }

      if (codesRoles.includes('DIRECTEUR_ETUDES')) {
        return 'DIRECTEUR_ETUDES';
      }
    }

    if (params.sectionCode === 'PRIMAIRE' && codesRoles.includes('DIRECTEUR_PRIMAIRE')) {
      return 'DIRECTEUR_PRIMAIRE';
    }

    if (params.sectionCode === 'MATERNELLE' && codesRoles.includes('DIRECTEUR_MATERNELLE')) {
      return 'DIRECTEUR_MATERNELLE';
    }

    return null;
  }

  private async estTitulaireEffectifDeLaClasse(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
    },
    classeActive: {
      idClassePedagogique: string;
      idEcole: string;
      idAnneeScolaire: string;
    },
  ): Promise<boolean> {
    const capacites = await this.securityCapacitesEffectivesService.calculerPourUtilisateur({
      idUtilisateur: params.idUtilisateur,
      idOrganisationActive: params.idOrganisation,
      idEcoleActive: params.idEcole,
      idClasse: classeActive.idClassePedagogique,
      idAnneeScolaire: classeActive.idAnneeScolaire,
    });

    return capacites.permissions.includes('paiements.read') && capacites.estTitulaireEffectif;
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const codesRoles = await this.listerCodesRolesActifsDansPerimetre(
      idUtilisateur,
      idOrganisation,
      idEcole,
    );

    return codesRoles.some((codeRole) => codesRolesAutorises.includes(codeRole));
  }

  private async estRoleActifDansOrganisation(
    idUtilisateur: string,
    idOrganisation: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole && codesRolesAutorises.includes(codeRole)) {
        return true;
      }
    }

    return false;
  }

  private async listerCodesRolesActifsDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    idSectionAttendue?: string,
  ): Promise<string[]> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);
    const codesRoles: string[] = [];

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      if (affectation.obtenirIdEcole() !== idEcole) {
        continue;
      }

      if (idSectionAttendue !== undefined && affectation.obtenirIdSection() !== idSectionAttendue) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined) {
        codesRoles.push(codeRole);
      }
    }

    return codesRoles;
  }
}
