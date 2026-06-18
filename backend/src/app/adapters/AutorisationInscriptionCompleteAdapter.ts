import type { AutorisationInscriptionCompletePort } from '../../contexts/scolarite-eleves/application/ports';
import { ErreurAutorisation } from '../../contexts/scolarite-eleves/application/exceptions';
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

// Cet adaptateur reapplique shared/security pour l'inscription scolaire complete.
export class AutorisationInscriptionCompleteAdapter
  implements AutorisationInscriptionCompletePort
{
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
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

  public async verifierCreationInscriptionComplete(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    const estCaissierActif = await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER'],
    );

    if (!estCaissierActif) {
      throw new ErreurAutorisation(
        "Seul un caissier de l'ecole courante peut creer une inscription scolaire complete.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'caisse.write',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
    });
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (
        affectation.obtenirIdOrganisation() !== idOrganisation
        || affectation.obtenirIdEcole() !== idEcole
      ) {
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
