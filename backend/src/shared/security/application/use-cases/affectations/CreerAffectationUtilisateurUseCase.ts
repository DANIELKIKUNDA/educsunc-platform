import type { UseCase } from 'shared/application/UseCase';
import type { CreerAffectationUtilisateurInput } from '../../dto/input';
import type { AffectationUtilisateurOutput } from '../../dto/output';
import { SagaAffectationUtilisateur } from '../../sagas';

export class CreerAffectationUtilisateurUseCase implements UseCase<CreerAffectationUtilisateurInput, AffectationUtilisateurOutput> {
  constructor(private readonly sagaAffectationUtilisateur: SagaAffectationUtilisateur) {}
  public async executer(entree: CreerAffectationUtilisateurInput): Promise<AffectationUtilisateurOutput> {
    return this.sagaAffectationUtilisateur.creerAffectation(entree);
  }
}
