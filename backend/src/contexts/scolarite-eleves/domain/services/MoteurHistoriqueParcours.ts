import { ParcoursScolaireEleve } from '../aggregates/ParcoursScolaireEleve';
import { EvenementParcours } from '../entities/EvenementParcours';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient le service de domaine qui manipule l'historique scolaire sans le perdre.
/**
 * Ce moteur delegue au parcours les operations d'ajout, reconstruction et consultation.
 */
export class MoteurHistoriqueParcours {
  /** Ajoute un evenement au parcours scolaire. */
  public ajouterEvenement(parcours: ParcoursScolaireEleve, evenement: EvenementParcours): void {
    parcours.enregistrerEvenement(evenement);
  }

  /** Reconstruit un parcours a partir d'un historique complet et fiable. */
  public reconstruire(parcours: ParcoursScolaireEleve, historiqueReconstruit: EvenementParcours[], declenchePar: UUID): void {
    parcours.reconstruireParcours(historiqueReconstruit, declenchePar);
  }

  /** Liste les evenements d'un parcours pour une annee scolaire. */
  public listerParAnnee(parcours: ParcoursScolaireEleve, idAnneeScolaire: UUID): EvenementParcours[] {
    return parcours.listerParAnnee(idAnneeScolaire);
  }
}
