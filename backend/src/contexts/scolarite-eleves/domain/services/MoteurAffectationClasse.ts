import { InscriptionScolaire } from '../aggregates/InscriptionScolaire';
import { ErreurAffectationDejaActive } from '../exceptions/ErreurAffectationDejaActive';
import { ErreurClasseArchivee } from '../exceptions/ErreurClasseArchivee';
import { ErreurClasseEtInscriptionIncoherentes } from '../exceptions/ErreurClasseEtInscriptionIncoherentes';

// Ce fichier contient le service de domaine qui controle l'affectation d'un eleve en classe.
export interface ContexteVerificationAffectationClasse {
  inscription: InscriptionScolaire | null;
  classePedagogiqueExiste: boolean;
  classePedagogiqueArchivee: boolean;
  memeEcole: boolean;
  memeAnneeScolaire: boolean;
  affectationActiveExisteDeja: boolean;
}

/**
 * Ce moteur regroupe les regles metier d'affectation en classe.
 */
export class MoteurAffectationClasse {
  /** Verifie qu'une affectation de classe peut etre creee. */
  public verifierAffectationPossible(contexte: ContexteVerificationAffectationClasse): void {
    if (contexte.inscription === null || !contexte.inscription.estActive()) {
      throw new ErreurClasseEtInscriptionIncoherentes('Une affectation requiert une inscription validee.');
    }

    if (!contexte.classePedagogiqueExiste) {
      throw new ErreurClasseEtInscriptionIncoherentes('La classe pedagogique doit exister.');
    }

    if (contexte.classePedagogiqueArchivee) {
      throw new ErreurClasseArchivee('Une classe archivee ne peut pas recevoir de nouvelle affectation.');
    }

    if (!contexte.memeEcole || !contexte.memeAnneeScolaire) {
      throw new ErreurClasseEtInscriptionIncoherentes('La classe doit appartenir a la meme ecole et a la meme annee scolaire que l inscription.');
    }

    if (contexte.affectationActiveExisteDeja) {
      throw new ErreurAffectationDejaActive('Une affectation active existe deja pour cette inscription.');
    }
  }
}
