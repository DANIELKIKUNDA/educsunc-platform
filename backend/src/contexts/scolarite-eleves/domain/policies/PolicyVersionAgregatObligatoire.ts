import { ErreurConcurrence } from '../exceptions/ErreurConcurrence';

// Ce fichier contient la regle qui impose une version sur les commandes critiques.
/**
 * Cette policy force les modifications a fournir une version d'agregat.
 */
export class PolicyVersionAgregatObligatoire {
  /** Verifie que la version fournie est exploitable. */
  public verifierVersionPresente(version: number | undefined): number {
    if (version === undefined || !Number.isInteger(version) || version <= 0) {
      throw new ErreurConcurrence('La version de l agregat est obligatoire.');
    }

    return version;
  }
}
