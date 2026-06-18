import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
} from '../../shared/security/infrastructure';
import type {
  EligibiliteResponsableClassePedagogiqueReadModel,
  VerifierEligibiliteResponsableClassePedagogiquePort,
} from '../../contexts/referentiel-academique/application/ports/VerifierEligibiliteResponsableClassePedagogiquePort';

// Cet adaptateur de composition relit la securite pour valider qu'un responsable de classe est bien un enseignant actif du bon scope.
export class EligibiliteResponsableClassePedagogiqueAdapter
  implements VerifierEligibiliteResponsableClassePedagogiquePort
{
  constructor(
    private readonly affectationUtilisateurRepository = new PostgresAffectationUtilisateurRepository(),
    private readonly roleRepository = new PostgresRoleRepository(),
  ) {}

  public async verifier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<EligibiliteResponsableClassePedagogiqueReadModel> {
    const affectations = await this.affectationUtilisateurRepository.listerActivesParUtilisateur(
      params.idUtilisateur,
    );

    if (affectations.length === 0) {
      return {
        utilisateurExiste: false,
        utilisateurActif: false,
      };
    }

    const affectationsRoles = await Promise.all(
      affectations.map(async (affectation) => ({
        affectation,
        role: await this.roleRepository.trouverParId(affectation.obtenirIdRole()),
      })),
    );

    const affectationEnseignant = affectationsRoles.find(({ affectation, role }) =>
      affectation.estValide()
      && affectation.obtenirIdOrganisation() === params.idOrganisation
      && affectation.obtenirIdEcole() === params.idEcole
      && role?.obtenirCodeRole().obtenirValeur() === 'ENSEIGNANT',
    );

    if (affectationEnseignant) {
      return {
        utilisateurExiste: true,
        utilisateurActif: true,
        codeRoleActif: affectationEnseignant.role?.obtenirCodeRole().obtenirValeur(),
        idOrganisation: affectationEnseignant.affectation.obtenirIdOrganisation(),
        idEcole: affectationEnseignant.affectation.obtenirIdEcole(),
      };
    }

    const affectationActive = affectations.find((affectation) => affectation.estValide());
    const roleActif = affectationActive
      ? await this.roleRepository.trouverParId(affectationActive.obtenirIdRole())
      : null;

    return {
      utilisateurExiste: true,
      utilisateurActif: Boolean(affectationActive),
      codeRoleActif: roleActif?.obtenirCodeRole().obtenirValeur(),
      idOrganisation: affectationActive?.obtenirIdOrganisation(),
      idEcole: affectationActive?.obtenirIdEcole(),
    };
  }
}
