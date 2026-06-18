import type { AutorisationConsultationRecusPort } from '../../contexts/paiements-facturation/application/ports/AutorisationConsultationRecusPort';
import { ErreurDroitsInsuffisants } from '../../contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
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

export class AutorisationConsultationRecusAdapter
  implements AutorisationConsultationRecusPort
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

  public async verifierConsultationRecus(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    const estCaissier = await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER'],
    );

    if (!estCaissier) {
      throw new ErreurDroitsInsuffisants(
        "Seul un caissier actif de l'ecole peut consulter les recus.",
      );
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee: 'paiements.read',
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
    });
  }

  public async fermer(): Promise<void> {
    return Promise.resolve();
  }

  private async estRoleActifDansPerimetre(
    idUtilisateur: string,
    idOrganisation: string,
    idEcole: string,
    codesRolesAutorises: readonly string[],
  ): Promise<boolean> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== idOrganisation) {
        continue;
      }

      if (affectation.obtenirIdEcole() !== idEcole) {
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
}
