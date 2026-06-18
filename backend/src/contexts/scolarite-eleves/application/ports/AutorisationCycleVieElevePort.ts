import { StatutEleve } from '../../domain/value-objects/StatutEleve';

// Ce port reapplique la doctrine locale permission + perimetre pour les mutations de statut eleve.
export interface AutorisationCycleVieElevePort {
  verifierMutationStatutEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
    nouveauStatut: StatutEleve;
  }): Promise<void>;
}
