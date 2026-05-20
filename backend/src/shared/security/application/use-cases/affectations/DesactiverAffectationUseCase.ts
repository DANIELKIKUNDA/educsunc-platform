import type { UseCase } from 'shared/application/UseCase';
import type { DesactiverAffectationInput } from '../../dto/input';
import type { AffectationUtilisateurOutput } from '../../dto/output';
import { SagaAffectationUtilisateur } from '../../sagas';

export class DesactiverAffectationUseCase implements UseCase<DesactiverAffectationInput, AffectationUtilisateurOutput> {
  constructor(private readonly sagaAffectationUtilisateur: SagaAffectationUtilisateur) {}
  public async executer(entree: DesactiverAffectationInput): Promise<AffectationUtilisateurOutput> {
    return this.sagaAffectationUtilisateur.desactiverAffectation(entree);
  }
}
