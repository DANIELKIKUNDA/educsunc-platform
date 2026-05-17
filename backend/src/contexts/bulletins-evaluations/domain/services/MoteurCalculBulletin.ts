import { ResultatBulletinEleve } from '../aggregates/ResultatBulletinEleve';
import { FicheCotationEleveCours } from '../aggregates/FicheCotationEleveCours';

// Ce moteur orchestre le recalcul des resultats consolides a partir des fiches.
export class MoteurCalculBulletin {
  // Cette methode demande a l'agregat resultat de se recalculer a partir des fiches sources.
  public recalculer(resultat: ResultatBulletinEleve, fiches: FicheCotationEleveCours[]): void {
    resultat.recalculerDepuisFiches(fiches);
  }
}
