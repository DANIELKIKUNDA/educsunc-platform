import { ErreurStatutEleveInvalide } from '../exceptions/ErreurStatutEleveInvalide';

// Ce fichier contient la regle d'identite permanente de l'eleve.
/**
 * Cette policy rappelle qu'un eleve n'est pas une simple inscription annuelle.
 */
export class PolicyEleveIdentitePermanente {
  /** Verifie que les champs minimaux de l'identite permanente sont presents. */
  public verifierIdentitePermanente(nom: string, postNom: string, matricule: string): void {
    if (nom.trim().length === 0 || postNom.trim().length === 0 || matricule.trim().length === 0) {
      throw new ErreurStatutEleveInvalide('Le nom, le post-nom et le matricule sont obligatoires pour identifier un eleve.');
    }
  }
}
