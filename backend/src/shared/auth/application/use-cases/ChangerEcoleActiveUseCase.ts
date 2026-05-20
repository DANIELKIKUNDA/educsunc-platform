import { UseCase } from '../../../application/UseCase';
import { ChangerEcoleActiveInput } from '../dto/input';
import { ContexteActifOutput } from '../dto/output';
import { ChangerContexteActifSaga } from '../sagas/ChangerContexteActifSaga';
import { SessionApplicationService } from '../services/SessionApplicationService';

// Ce cas d'usage change l'ecole active de la session courante.
export class ChangerEcoleActiveUseCase implements UseCase<ChangerEcoleActiveInput, ContexteActifOutput> {
  constructor(
    private readonly sessionApplicationService: SessionApplicationService,
    private readonly changerContexteActifSaga: ChangerContexteActifSaga,
  ) {}

  public async executer(entree: ChangerEcoleActiveInput): Promise<ContexteActifOutput> {
    const session = await this.sessionApplicationService.obtenirSessionActive(entree.sessionId);
    return this.changerContexteActifSaga.changerEcoleActive(session.utilisateurId, entree.ecoleActiveId);
  }
}
