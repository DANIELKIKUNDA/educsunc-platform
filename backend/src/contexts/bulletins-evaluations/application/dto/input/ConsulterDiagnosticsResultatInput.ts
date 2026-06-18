// Cet input represente une lecture securisee des diagnostics d'un resultat eleve.
export interface ConsulterDiagnosticsResultatInput {
  idEleve: string;
  idAnneeScolaire: string;
  idUtilisateur: string;
  idOrganisation?: string;
}
