import { VersionReferentielProgrammeSortie } from './VersionReferentielProgrammeSortie';

// Ce DTO represente le resultat exploitable d'une verification explicite de coherence avant publication.
export interface VerificationCoherenceVersionReferentielSortie {
  estCoherente: boolean;
  erreurs: string[];
  avertissements: string[];
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}
