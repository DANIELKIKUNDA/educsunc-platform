import type { UseCase } from 'shared/application/UseCase';
import type { ContexteActifOutput } from '../../dto/output';
import { SecurityContextService } from '../../services/SecurityContextService';

export class ObtenirContexteActifUseCase implements UseCase<{ idUtilisateur: string }, ContexteActifOutput> {
  constructor(private readonly securityContextService: SecurityContextService) {}
  public async executer(entree: { idUtilisateur: string }): Promise<ContexteActifOutput> {
    return this.securityContextService.obtenirContexteActif(entree.idUtilisateur);
  }
}
