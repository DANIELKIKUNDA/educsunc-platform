import type { AutorisationCaissePort } from '../../contexts/paiements-facturation/application/ports/AutorisationCaissePort';
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

export class AutorisationOuvertureCaisseAdapter implements AutorisationCaissePort {
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

  public async verifierConsultationCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    const estLecteurEcole = await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER', 'ADMINISTRATEUR_ECOLE'],
    );

    if (estLecteurEcole) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'caisse.read',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
        codeRestriction: 'INTERDICTION_CAISSE',
      });
      return;
    }

    const estLecteurOrganisation = await this.estRoleActifDansOrganisation(
      params.idUtilisateur,
      params.idOrganisation,
      ['GESTIONNAIRE_ORGANISATION', 'PROMOTEUR_ORGANISATION'],
    );

    if (estLecteurOrganisation) {
      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'paiements.read',
        idOrganisation: params.idOrganisation,
      });
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "Seuls le caissier, l'administrateur d'ecole, le gestionnaire d'organisation ou le promoteur de l'organisation courante peuvent consulter la caisse du jour.",
    );
  }

  public async verifierOuvertureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierOperationCaisse(
      params,
      "Seul un caissier actif de l'ecole peut ouvrir la caisse du jour.",
      'caisse.write',
    );
  }

  public async verifierClotureCaisse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    await this.verifierOperationCaisse(
      params,
      "Seul un caissier actif de l'ecole peut cloturer la caisse du jour.",
      'caisse.write',
    );
  }

  private async verifierOperationCaisse(
    params: {
      idUtilisateur: string;
      idOrganisation: string;
      idEcole: string;
    },
    messageErreur: string,
    permissionDemandee: 'caisse.read' | 'caisse.write',
  ): Promise<void> {
    const estCaissier = await this.estRoleActifDansPerimetre(
      params.idUtilisateur,
      params.idOrganisation,
      params.idEcole,
      ['CAISSIER'],
    );

    if (!estCaissier) {
      throw new ErreurDroitsInsuffisants(messageErreur);
    }

    await this.securityFacade.verifierAcces({
      idUtilisateur: params.idUtilisateur,
      permissionDemandee,
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      codeRestriction: 'INTERDICTION_CAISSE',
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
}
