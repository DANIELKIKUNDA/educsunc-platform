import { EtatCompteUtilisateur } from 'shared/auth/domain';
import { ErreurAutorisation } from '../exceptions/ErreurAutorisation';

// Cette policy bloque tout acces lorsque le compte utilisateur n'est plus actif.
export class PolicyUtilisateurActif {
  public static verifier(etatCompte: EtatCompteUtilisateur): void {
    if (etatCompte !== EtatCompteUtilisateur.ACTIVE) {
      throw new ErreurAutorisation("L'utilisateur n'est pas actif.");
    }
  }
}
