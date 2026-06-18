import { configurationApplication } from '../../config/app.config';
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

const ROLE_PRINCIPAL_IMPORT_REFERENTIEL = 'MANAGER_SYSTEME';
const ROLE_SECONDAIRE_IMPORT_REFERENTIEL = 'OPERATEUR_SYSTEME';

interface DependancesAutorisationImportReferentielAdapter {
  roleRepository?: Pick<PostgresRoleRepository, 'trouverParId'>;
  affectationRepository?: Pick<PostgresAffectationUtilisateurRepository, 'listerActivesParUtilisateur'>;
  securityFacade?: Pick<SecurityFacade, 'verifierAcces'>;
  autoriserOperateur?: boolean;
}

// Cet adaptateur verrouille PLT-03 sur les acteurs systeme reels et une delegation explicite d'OPERATEUR_SYSTEME.
export class AutorisationImportReferentielAdapter {
  private readonly roleRepository: Pick<PostgresRoleRepository, 'trouverParId'>;
  private readonly affectationRepository: Pick<
    PostgresAffectationUtilisateurRepository,
    'listerActivesParUtilisateur'
  >;
  private readonly securityFacade: Pick<SecurityFacade, 'verifierAcces'>;
  private readonly autoriserOperateur: boolean;

  constructor(dependances?: DependancesAutorisationImportReferentielAdapter) {
    this.roleRepository = dependances?.roleRepository ?? new PostgresRoleRepository();
    this.affectationRepository =
      dependances?.affectationRepository ?? new PostgresAffectationUtilisateurRepository();
    this.securityFacade =
      dependances?.securityFacade
      ?? new SecurityFacade(
        this.roleRepository as PostgresRoleRepository,
        this.affectationRepository as PostgresAffectationUtilisateurRepository,
        new PostgresAffectationTitulariatRepository(),
        new PermissionCacheService(),
        new MoteurAutorisation(),
        new MoteurScope(),
        new MoteurRestrictionsMetier(),
        new MoteurCapacitesEffectives(),
        new SecurityAuditInfrastructureService(),
      );
    this.autoriserOperateur =
      dependances?.autoriserOperateur
      ?? configurationApplication.autoriserOperateurWorkflowImportReferentiel;
  }

  public async verifierMutationImportReferentiel(params: {
    idUtilisateur: string;
    roleActif?: string;
  }): Promise<void> {
    await this.verifierRoleImportReferentielAutorise(params);
    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'referentiel.write',
    });
  }

  private async verifierRoleImportReferentielAutorise(params: {
    idUtilisateur: string;
    roleActif?: string;
  }): Promise<void> {
    if (params.roleActif !== undefined && this.roleAutorise(params.roleActif)) {
      return;
    }

    const affectations = await this.affectationRepository.listerActivesParUtilisateur(params.idUtilisateur);

    for (const affectation of affectations) {
      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole !== undefined && this.roleAutorise(codeRole)) {
        return;
      }
    }

    throw new Error("L'acteur courant n'est pas autorise a importer une version officielle du referentiel.");
  }

  private roleAutorise(roleActif: string): boolean {
    if (roleActif === ROLE_PRINCIPAL_IMPORT_REFERENTIEL) {
      return true;
    }

    return this.autoriserOperateur && roleActif === ROLE_SECONDAIRE_IMPORT_REFERENTIEL;
  }
}
