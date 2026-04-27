import { CreerEleveEntreeDTO } from '../../application/dto/input/CreerEleveEntreeDTO';

// Ce fichier contient le service infrastructure d'import specifique aux eleves.
/**
 * Ce service convertit des donnees JSON externes en entrees applicatives d'eleves.
 */
export class ImportEleveService {
  /** Transforme un flux JSON deja parse en commandes de creation d'eleves. */
  public importerDepuisJson(donnees: unknown): CreerEleveEntreeDTO[] {
    if (!Array.isArray(donnees)) {
      return [];
    }

    return donnees.filter((ligne): ligne is CreerEleveEntreeDTO => typeof ligne === 'object' && ligne !== null);
  }
}
