import { UtilisateurAuth } from '../aggregates/UtilisateurAuth';
import { PolicyVerrouillageConnexion } from '../policies/PolicyVerrouillageConnexion';

// Ce moteur gere les tentatives de connexion et le verrouillage des comptes.
export class MoteurVerrouillageCompte {
  // Cette methode comptabilise un echec et verrouille si le seuil est atteint.
  public enregistrerEchec(
    utilisateur: UtilisateurAuth,
    params?: { seuilMaximum?: number; dureeVerrouillageMinutes?: number },
  ): void {
    const seuilMaximum = params?.seuilMaximum ?? 5;
    const dureeVerrouillageMinutes = params?.dureeVerrouillageMinutes ?? 15;
    utilisateur.incrementerTentativeConnexion();

    if (PolicyVerrouillageConnexion.doitVerrouiller(utilisateur.obtenirNombreTentativesConnexion(), seuilMaximum)) {
      utilisateur.verrouillerCompte(new Date(Date.now() + dureeVerrouillageMinutes * 60 * 1000));
    }
  }

  // Cette methode reinitialise les tentatives apres succes ou intervention admin.
  public reinitialiser(utilisateur: UtilisateurAuth): void {
    utilisateur.reinitialiserTentativesConnexion();
    utilisateur.deverrouillerCompte();
  }

  // Cette methode verifie si un compte reste actuellement connectable.
  public verifierAcces(utilisateur: UtilisateurAuth, maintenant = new Date()): void {
    utilisateur.verifierConnexionAutorisee(maintenant);
  }
}
