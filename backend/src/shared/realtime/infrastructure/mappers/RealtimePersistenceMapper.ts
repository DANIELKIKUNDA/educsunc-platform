import type { AbonnementTempsReel, ConnexionTempsReel, EvenementTempsReel } from '../../domain';

export class RealtimePersistenceMapper {
  public versProjectionConnexion(connexion: ConnexionTempsReel) {
    return {
      id: connexion.id.value,
      utilisateurId: connexion.utilisateurId,
      statut: connexion.obtenirStatut(),
    };
  }

  public versProjectionAbonnement(abonnement: AbonnementTempsReel) {
    return {
      id: abonnement.id.value,
      connexionId: abonnement.connexionId.value,
      canal: abonnement.canal.nom,
      statut: abonnement.obtenirStatut(),
    };
  }

  public versProjectionEvenement(evenement: EvenementTempsReel) {
    return {
      id: evenement.id.value,
      type: evenement.type,
      canal: evenement.canal.nom,
      diffusable: evenement.peutEtreDiffuse(),
    };
  }
}
