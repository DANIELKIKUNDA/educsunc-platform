import type { AutorisationOrganisationScolaritePort } from '../../contexts/scolarite-eleves/application/ports';
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

// Cet adaptateur reapplique shared/security pour les lectures organisationnelles de scolarite.
export class AutorisationOrganisationScolariteAdapter
  implements AutorisationOrganisationScolaritePort
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

  public async verifierLectureOrganisationScolarite(params: {
    idUtilisateur: string;
    idOrganisation: string;
  }): Promise<void> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(
      params.idUtilisateur,
    );

    for (const affectation of affectations) {
      if (affectation.obtenirIdOrganisation() !== params.idOrganisation) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole === 'PROMOTEUR_ORGANISATION') {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee: 'eleves.read',
          idOrganisation: params.idOrganisation,
        });
        return;
      }
    }

    throw new ErreurAutorisation(
      "Seul un promoteur de l'organisation courante peut consulter cette vue organisationnelle de scolarite.",
    );
  }

  public async fermer(): Promise<void> {
    return Promise.resolve();
  }
}
