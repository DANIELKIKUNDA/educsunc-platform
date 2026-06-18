import type { AutorisationElevePort } from '../../contexts/scolarite-eleves/application/ports';
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

// Cet adaptateur reapplique shared/security pour le workflow eleve porte par le caissier.
export class AutorisationEleveAdapter implements AutorisationElevePort {
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

  public async verifierLectureEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierAccesCaissier(params, 'caisse.read');
  }

  public async verifierMutationEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierAccesCaissier(params, 'caisse.write');
  }

  public async fermer(): Promise<void> {
    return Promise.resolve();
  }

  private async verifierAccesCaissier(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
    },
    permissionDemandee: 'caisse.read' | 'caisse.write',
  ): Promise<void> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(
      params.idUtilisateur,
    );

    for (const affectation of affectations) {
      if (
        affectation.obtenirIdOrganisation() !== params.idOrganisation
        || affectation.obtenirIdEcole() !== params.idEcole
      ) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      const codeRole = role?.obtenirCodeRole().obtenirValeur();

      if (codeRole === 'CAISSIER') {
        await this.securityFacade.verifierAcces({
          idUtilisateur: params.idUtilisateur,
          permissionDemandee,
          idOrganisation: params.idOrganisation,
          idEcole: params.idEcole,
        });
        return;
      }
    }

    throw new ErreurAutorisation(
      "Seul un caissier de l'ecole courante peut gerer ou consulter les eleves hors workflow d'inscription.",
    );
  }
}
