import { UseCase } from '../../../application/UseCase';
import { ChangerOrganisationActiveInput } from '../dto/input';
import { ContexteActifOutput } from '../dto/output';
import { ChangerContexteActifSaga } from '../sagas/ChangerContexteActifSaga';
import { SessionApplicationService } from '../services/SessionApplicationService';

// Ce cas d'usage change l'organisation active de la session courante.
export class ChangerOrganisationActiveUseCase implements UseCase<ChangerOrganisationActiveInput, ContexteActifOutput> {
  constructor(
    private readonly sessionApplicationService: SessionApplicationService,
    private readonly changerContexteActifSaga: ChangerContexteActifSaga,
  ) {}

  public async executer(entree: ChangerOrganisationActiveInput): Promise<ContexteActifOutput> {
    const session = await this.sessionApplicationService.obtenirSessionActive(entree.sessionId);
    return this.changerContexteActifSaga.changerOrganisationActive(
      session.sessionId,
      session.utilisateurId,
      entree.organisationActiveId,
    );
  }
}
