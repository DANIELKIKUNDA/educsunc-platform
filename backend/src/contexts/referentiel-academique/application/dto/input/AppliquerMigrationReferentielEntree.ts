import { DemandeTransformationNoteEntree } from './DemandeTransformationNoteEntree';

// Ce DTO represente les donnees attendues pour appliquer une migration de referentiel.
export interface AppliquerMigrationReferentielEntree {
  idMigrationReferentielProgramme: string;
  demandesTransformationNotes?: DemandeTransformationNoteEntree[];
  appliquePar: string;
}
