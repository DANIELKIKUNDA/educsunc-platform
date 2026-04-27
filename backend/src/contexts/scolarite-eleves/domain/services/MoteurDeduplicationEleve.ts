import { DoublonEleveDetecte } from '../events/DoublonEleveDetecte';
import { ErreurDoublonEleveDetecte } from '../exceptions/ErreurDoublonEleveDetecte';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient le service de domaine qui decide quoi faire face a un doublon probable.
export enum DecisionDeduplicationEleve {
  AUTORISER = 'AUTORISER',
  BLOQUER = 'BLOQUER',
  SIGNALER_VERIFICATION_MANUELLE = 'SIGNALER_VERIFICATION_MANUELLE',
}

export interface IndicesDoublonEleve {
  matriculeExiste: boolean;
  identiteIdentiqueExiste: boolean;
  dateNaissanceIdentiqueExiste: boolean;
  familleIdentiqueExiste: boolean;
  ancienneInscriptionExiste: boolean;
  similariteProbableExiste: boolean;
}

/**
 * Ce moteur applique la decision de deduplication definie dans le document de domaine.
 */
export class MoteurDeduplicationEleve {
  /** Retourne la decision metier a partir des indices de doublon connus. */
  public decider(indices: IndicesDoublonEleve): DecisionDeduplicationEleve {
    if (indices.matriculeExiste || indices.identiteIdentiqueExiste) {
      return DecisionDeduplicationEleve.BLOQUER;
    }

    if (indices.dateNaissanceIdentiqueExiste || indices.familleIdentiqueExiste || indices.ancienneInscriptionExiste || indices.similariteProbableExiste) {
      return DecisionDeduplicationEleve.SIGNALER_VERIFICATION_MANUELLE;
    }

    return DecisionDeduplicationEleve.AUTORISER;
  }

  /** Bloque explicitement l'operation quand la decision de deduplication l'exige. */
  public appliquerDecision(decision: DecisionDeduplicationEleve, idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, referenceMetier: UUID): void {
    if (decision === DecisionDeduplicationEleve.BLOQUER) {
      new DoublonEleveDetecte(idOrganisation, idEcole, declenchePar, referenceMetier);
      throw new ErreurDoublonEleveDetecte('Un doublon eleve bloque la creation ou la modification.');
    }
  }
}
