import type { UseCase } from 'shared/application/UseCase';
import type { AffectationUtilisateurReadModel } from '../../read-models';
import type { ListerAffectationsUtilisateurQuery } from '../../queries';

export class ListerAffectationsUtilisateurUseCase implements UseCase<{ idUtilisateur: string }, readonly AffectationUtilisateurReadModel[]> {
  constructor(private readonly listerAffectationsUtilisateurQuery: ListerAffectationsUtilisateurQuery) {}
  public async executer(entree: { idUtilisateur: string }): Promise<readonly AffectationUtilisateurReadModel[]> {
    return this.listerAffectationsUtilisateurQuery.executer(entree.idUtilisateur);
  }
}
