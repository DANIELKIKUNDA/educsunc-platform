import { ErreurCompteVerrouille } from '../exceptions/ErreurCompteVerrouille';
import { ErreurTentativesConnexionExcessives } from '../exceptions/ErreurTentativesConnexionExcessives';

// Cette policy porte les regles de verrouillage apres echecs de connexion.
export class PolicyVerrouillageConnexion {
  public static verifierCompteNonVerrouille(compteVerrouilleJusqua?: Date, maintenant = new Date()): void {
    if (compteVerrouilleJusqua && compteVerrouilleJusqua.getTime() > maintenant.getTime()) {
      throw new ErreurCompteVerrouille();
    }
  }

  public static doitVerrouiller(nombreTentativesConnexion: number, seuilMaximum = 5): boolean {
    return Number(nombreTentativesConnexion || 0) >= seuilMaximum;
  }

  public static verifierSeuil(nombreTentativesConnexion: number, seuilMaximum = 5): void {
    if (PolicyVerrouillageConnexion.doitVerrouiller(nombreTentativesConnexion, seuilMaximum)) {
      throw new ErreurTentativesConnexionExcessives();
    }
  }
}
