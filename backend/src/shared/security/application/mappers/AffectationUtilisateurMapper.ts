import type { AffectationUtilisateur } from '../../../security/domain';
import type { AffectationUtilisateurOutput } from '../dto/output';
export class AffectationUtilisateurMapper {
  public static depuisDomaine(affectation: AffectationUtilisateur): AffectationUtilisateurOutput {
    return {
      idAffectationUtilisateur: affectation.obtenirId(),
      idUtilisateur: affectation.obtenirIdUtilisateur(),
      idRole: affectation.obtenirIdRole(),
      niveauAcces: affectation.obtenirNiveauAcces().obtenirValeur(),
      etatAffectation: affectation.obtenirEtatAffectation().obtenirValeur(),
      idOrganisation: affectation.obtenirIdOrganisation(),
      idEcole: affectation.obtenirIdEcole(),
    };
  }
}
