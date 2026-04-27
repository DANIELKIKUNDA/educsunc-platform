import { Eleve } from '../aggregates/Eleve';
import { ErreurAucuneAnneeActive } from '../exceptions/ErreurAucuneAnneeActive';
import { ErreurInscriptionDejaExistante } from '../exceptions/ErreurInscriptionDejaExistante';
import { ErreurInscriptionNonValide } from '../exceptions/ErreurInscriptionNonValide';

// Ce fichier contient le service de domaine qui valide les conditions d'inscription d'un eleve.
export interface ContexteVerificationInscriptionEleve {
  eleve: Eleve | null;
  anneeScolaireExiste: boolean;
  anneeScolaireActiveOuSelectionnee: boolean;
  inscriptionActiveExisteDeja: boolean;
}

/**
 * Ce moteur regroupe les regles metier d'inscription annuelle.
 */
export class MoteurInscriptionEleve {
  /** Verifie qu'une inscription peut etre creee pour un eleve et une annee scolaire. */
  public verifierCreationPossible(contexte: ContexteVerificationInscriptionEleve): void {
    if (contexte.eleve === null) {
      throw new ErreurInscriptionNonValide('Impossible d inscrire un eleve inexistant.');
    }

    if (!contexte.eleve.estActif()) {
      throw new ErreurInscriptionNonValide('Seul un eleve actif peut recevoir une nouvelle inscription courante.');
    }

    if (!contexte.anneeScolaireExiste) {
      throw new ErreurInscriptionNonValide('Impossible d inscrire dans une annee scolaire inexistante.');
    }

    if (!contexte.anneeScolaireActiveOuSelectionnee) {
      throw new ErreurAucuneAnneeActive('Aucune annee scolaire active ou explicitement selectionnee.');
    }

    if (contexte.inscriptionActiveExisteDeja) {
      throw new ErreurInscriptionDejaExistante('Une inscription active existe deja pour cet eleve et cette annee scolaire.');
    }
  }
}
