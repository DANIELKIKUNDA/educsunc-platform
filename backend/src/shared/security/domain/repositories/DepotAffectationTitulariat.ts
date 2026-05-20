import { AffectationTitulariat } from '../aggregates/AffectationTitulariat';

export interface DepotAffectationTitulariat {
  sauvegarder(affectationTitulariat: AffectationTitulariat): Promise<void>;
  trouverActifParClasse(idClasse: string, idAnneeScolaire: string): Promise<AffectationTitulariat | null>;
}
