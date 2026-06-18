import type { AutorisationExonerationPort } from '../../contexts/paiements-facturation/application/ports/AutorisationExonerationPort';
import type { ParametresPaiementEcole } from '../../contexts/paiements-facturation/domain/aggregates/ParametresPaiementEcole';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import {
  PostgresDepotParametresPaiementEcole,
  creerInfrastructurePostgresPaiementsFacturation,
} from '../../contexts/paiements-facturation/infrastructure/persistence/postgres';
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

export interface DependancesAutorisationExonerationAdapter {
  chargerParametresActifsParEcole?: (idEcole: string) => Promise<ParametresPaiementEcole | null>;
}

export class AutorisationExonerationAdapter implements AutorisationExonerationPort {
  private readonly infrastructurePaiements = creerInfrastructurePostgresPaiementsFacturation();
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
    private readonly dependances?: DependancesAutorisationExonerationAdapter,
  ) {}

  public async verifierGestionExoneration(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    if (await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['ADMINISTRATEUR_ECOLE'],
    )) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.write',
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
    if (
      parametres?.autoriseExonerationPour('SECRETAIRE')
      && await this.estRoleActifDansPerimetre(
        params.idUtilisateur,
        params.idOrganisation,
        params.idEcole,
        ['SECRETAIRE'],
      )
    ) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "L'utilisateur demandeur n'est pas autorise a gerer les exonerations dans ce perimetre.",
    );
  }

  public async fermer(): Promise<void> {
    await this.infrastructurePaiements.pool.end();
  }

  private async chargerParametresActifsParEcole(
    idEcole: string,
  ): Promise<ParametresPaiementEcole | null> {
    if (this.dependances?.chargerParametresActifsParEcole) {
      return this.dependances.chargerParametresActifsParEcole(idEcole);
    }

    return this.depotParametresPaiementEcole.trouverActifParEcole(idEcole);
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

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined) {
        codesRoles.push(codeRole);
      }
    }

    return codesRoles;
  }
}
