import { ErreurEcoleProvenanceInvalide } from '../exceptions/ErreurEcoleProvenanceInvalide';
import { EcoleProvenance } from '../value-objects/EcoleProvenance';

// Ce fichier contient la regle qui impose une provenance scolaire.
/**
 * Cette policy garantit que l'origine administrative de l'eleve n'est jamais vide.
 */
export class PolicyEcoleProvenanceObligatoire {
  /** Refuse une identite d'eleve sans ecole de provenance. */
  public verifierProvenancePresente(ecoleProvenance?: EcoleProvenance): void {
    if (ecoleProvenance === undefined) {
      throw new ErreurEcoleProvenanceInvalide('L ecole de provenance est obligatoire.');
    }
  }
}
