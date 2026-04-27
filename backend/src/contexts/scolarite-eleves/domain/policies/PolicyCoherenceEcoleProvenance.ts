import { ErreurEcoleProvenanceInvalide } from '../exceptions/ErreurEcoleProvenanceInvalide';
import { EcoleProvenance } from '../value-objects/EcoleProvenance';
import { TypeProvenanceEcole } from '../value-objects/TypeProvenanceEcole';

// Ce fichier contient la regle de coherence interne/externe de la provenance.
/**
 * Cette policy verifie les invariants propres a l'ecole de provenance.
 */
export class PolicyCoherenceEcoleProvenance {
  /** Verifie qu'une provenance interne a un identifiant et qu'une externe n'en a pas. */
  public verifierCoherenceProvenance(ecoleProvenance: EcoleProvenance): void {
    if (ecoleProvenance.obtenirTypeProvenance() === TypeProvenanceEcole.INTERNE && ecoleProvenance.obtenirIdEcoleProvenance() === undefined) {
      throw new ErreurEcoleProvenanceInvalide('Une provenance interne doit referencer une ecole connue.');
    }

    if (ecoleProvenance.obtenirTypeProvenance() === TypeProvenanceEcole.EXTERNE && ecoleProvenance.obtenirIdEcoleProvenance() !== undefined) {
      throw new ErreurEcoleProvenanceInvalide('Une provenance externe ne doit pas referencer une ecole interne.');
    }
  }
}
