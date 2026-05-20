import { UseCase } from '../../../application/UseCase';
import { ContexteActifOutput } from '../dto/output';
import { ContexteActifApplicationService } from '../services/ContexteActifApplicationService';

// Ce cas d'usage retourne le contexte actif courant d'un utilisateur.
export class ObtenirContexteActifUseCase implements UseCase<{ utilisateurId: string }, ContexteActifOutput> {
  constructor(private readonly contexteActifApplicationService: ContexteActifApplicationService) {}

  public async executer(entree: { utilisateurId: string }): Promise<ContexteActifOutput> {
    return this.contexteActifApplicationService.obtenirContexteActif(entree.utilisateurId);
  }
}
