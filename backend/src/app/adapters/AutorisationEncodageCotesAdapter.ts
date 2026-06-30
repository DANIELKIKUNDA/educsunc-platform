import type { AutorisationEncodageCotesPort } from '../../contexts/bulletins-evaluations/application/ports/out/AutorisationEncodageCotesPort';
import { ApplicationException } from '../../contexts/bulletins-evaluations/application/exceptions/ApplicationException';
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
  PolicyEncodageCotes,
} from '../../shared/security/domain';
import { ResponsabiliteClassePedagogiqueAdapter } from './ResponsabiliteClassePedagogiqueAdapter';

// Cet adaptateur verrouille localement l'espace de travail des cotes sur l'enseignant reel concerne.
export class AutorisationEncodageCotesAdapter implements AutorisationEncodageCotesPort {
  private readonly roleRepository = new PostgresRoleRepository();
  private readonly affectationRepository = new PostgresAffectationUtilisateurRepository();
  private readonly titulariatRepository = new PostgresAffectationTitulariatRepository();
  private readonly responsabiliteClassePedagogiqueAdapter = new ResponsabiliteClassePedagogiqueAdapter();
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
    this.responsabiliteClassePedagogiqueAdapter,
  );

  public async verifierConsultationFichesClasseCours(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.verifierAffectationEnseignant(params, 'consulter les fiches de cotation');
  }

  public async verifierEncodageCotes(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    await this.verifierAffectationEnseignant(params, 'encoder des cotes');
  }

  public async fermer(): Promise<void> {
    await this.responsabiliteClassePedagogiqueAdapter.fermer();
  }

  private async verifierAffectationEnseignant(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idReferentielCours: string;
    idAnneeScolaire: string;
  }, action: string): Promise<void> {
    const affectations = await this.affectationRepository.listerActivesParUtilisateur(params.idUtilisateur);

    for (const affectation of affectations) {
      if (affectation.obtenirIdEcole() !== params.idEcole) {
        continue;
      }

      if (params.idOrganisation !== undefined && affectation.obtenirIdOrganisation() !== params.idOrganisation) {
        continue;
      }

      const role = await this.roleRepository.trouverParId(affectation.obtenirIdRole());
      if (role === null) {
        continue;
      }

      const enseigneCours =
        affectation.obtenirIdClasse() === params.idClassePedagogique
        && affectation.obtenirIdCours() === params.idReferentielCours;

      try {
        PolicyEncodageCotes.verifier(role.obtenirCodeRole(), enseigneCours);
      } catch {
        continue;
      }

      await this.securityFacade.verifierAcces({
        idUtilisateur: params.idUtilisateur,
        permissionDemandee: 'cotes.write',
        idOrganisation: params.idOrganisation,
        idEcole: params.idEcole,
      });
      return;
    }

    throw new ApplicationException(
      `L'utilisateur demandeur n'est pas autorise a ${action} pour cette classe et ce cours.`,
      'BULLETINS_COTES_ACCES_REFUSE',
    );
  }
}
