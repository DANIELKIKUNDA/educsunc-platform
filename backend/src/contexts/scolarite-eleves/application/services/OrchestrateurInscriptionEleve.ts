import { CreerInscriptionComplete, SortieCreerInscriptionComplete } from '../use-cases/inscriptions/CreerInscriptionComplete';
import { CreerInscriptionCompleteEntreeDTO } from '../dto/input/CreerInscriptionCompleteEntreeDTO';

// Ce fichier contient l'orchestrateur applicatif de l'inscription complete.
/**
 * Cet orchestrateur coordonne eleve, inscription, affectation et parcours sans logique metier profonde.
 */
export class OrchestrateurInscriptionEleve {
  constructor(private readonly creerInscriptionComplete: CreerInscriptionComplete) {}

  /** Execute le parcours applicatif complet d'inscription. */
  public inscrireEleve(entree: CreerInscriptionCompleteEntreeDTO): Promise<SortieCreerInscriptionComplete> {
    return this.creerInscriptionComplete.executer(entree);
  }
}
