import { StatutProclamationEleve } from '../value-objects/StatutProclamationEleve';

// Cette policy indique qu'un abandon reste visible mais exclu du classement.
export class PolicyAbandonProclamation {
  // Cette methode indique si un eleve doit etre exclu du classement.
  public exclureDuClassement(statut: StatutProclamationEleve): boolean {
    return statut === StatutProclamationEleve.ABANDON;
  }
}
