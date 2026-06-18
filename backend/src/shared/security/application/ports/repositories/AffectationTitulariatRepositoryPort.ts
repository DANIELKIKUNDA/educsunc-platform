import type { AffectationTitulariat } from '../../../domain';
export interface AffectationTitulariatRepositoryPort {
  sauvegarder(affectationTitulariat: AffectationTitulariat): Promise<void>;
  trouverActifParClasse(idClasse: string, idAnneeScolaire: string): Promise<AffectationTitulariat | null>;
  listerActifsParUtilisateur(idUtilisateur: string): Promise<readonly AffectationTitulariat[]>;
}
