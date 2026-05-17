import { ClassementColonneClasse } from '../aggregates/ClassementColonneClasse';

// Ce contrat abstrait la persistence des classements de colonnes d'une classe.
export interface DepotClassementColonneClasse {
  sauvegarder(classementColonneClasse: ClassementColonneClasse): Promise<void>;
  trouverParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<ClassementColonneClasse | null>;
  listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ClassementColonneClasse[]>;
  supprimerLogiquementAncienClassement(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<void>;
}
