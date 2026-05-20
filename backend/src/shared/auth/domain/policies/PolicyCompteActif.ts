import { ErreurCompteDesactive } from '../exceptions/ErreurCompteDesactive';
import { ErreurCompteSuspendu } from '../exceptions/ErreurCompteSuspendu';
import { EtatCompteUtilisateur } from '../value-objects/EtatCompteUtilisateur';

// Cette policy verifie qu'un compte est dans un etat autorisant la connexion.
export class PolicyCompteActif {
  public static verifier(etatCompte: EtatCompteUtilisateur): void {
    if (etatCompte === EtatCompteUtilisateur.SUSPENDED) {
      throw new ErreurCompteSuspendu();
    }

    if (etatCompte === EtatCompteUtilisateur.DISABLED) {
      throw new ErreurCompteDesactive();
    }
  }
}
