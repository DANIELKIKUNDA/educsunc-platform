import { ErreurMetier } from '../exceptions/ErreurMetier';

// Ce fichier contient le service de domaine qui expose l'eligibilite famille nombreuse au BC Paiements.
export interface ResultatEligibiliteFamilleNombreuse {
  nombreElevesEligibles: number;
  seuilFamilleNombreuse: number;
  eligible: boolean;
}

/**
 * Ce service determine uniquement l'eligibilite, sans calculer de reduction financiere.
 */
export class ServiceEligibiliteFamilleNombreuse {
  /** Calcule l'eligibilite a partir du nombre d'eleves actifs rattaches a la famille. */
  public evaluer(nombreElevesEligibles: number, seuilFamilleNombreuse = 3): ResultatEligibiliteFamilleNombreuse {
    if (!Number.isInteger(nombreElevesEligibles) || nombreElevesEligibles < 0) {
      throw new ErreurMetier('Le nombre d eleves eligibles doit etre un entier positif ou nul.', 'FAMILLE_NOMBREUSE_NOMBRE_INVALIDE');
    }

    if (!Number.isInteger(seuilFamilleNombreuse) || seuilFamilleNombreuse <= 0) {
      throw new ErreurMetier('Le seuil famille nombreuse doit etre un entier positif.', 'FAMILLE_NOMBREUSE_SEUIL_INVALIDE');
    }

    return {
      nombreElevesEligibles,
      seuilFamilleNombreuse,
      eligible: nombreElevesEligibles >= seuilFamilleNombreuse,
    };
  }
}
