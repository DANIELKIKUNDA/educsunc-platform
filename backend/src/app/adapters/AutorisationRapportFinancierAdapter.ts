import type { AutorisationRapportFinancierPort } from '../../contexts/paiements-facturation/application/ports/AutorisationRapportFinancierPort';
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

export class AutorisationRapportFinancierAdapter
  implements AutorisationRapportFinancierPort
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

  public async verifierConsultationRapportJournalier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierLectureRapportFinancier(params);
  }

  public async verifierConsultationPaiementsParCaissier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierLectureRapportFinancier(params);
  }

  private async verifierLectureRapportFinancier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
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

    throw new ErreurDroitsInsuffisants(
      "L'utilisateur demandeur n'est pas autorise a consulter ce rapport financier.",
    );
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
