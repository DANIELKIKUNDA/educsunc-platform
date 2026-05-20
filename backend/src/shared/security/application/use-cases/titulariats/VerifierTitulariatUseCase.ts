import type { UseCase } from 'shared/application/UseCase';
import { SecurityAffectationService } from '../../services/SecurityAffectationService';

export class VerifierTitulariatUseCase implements UseCase<{ idClasse: string; idAnneeScolaire: string }, boolean> {
  constructor(private readonly securityAffectationService: SecurityAffectationService) {}
  public async executer(entree: { idClasse: string; idAnneeScolaire: string }): Promise<boolean> {
    return this.securityAffectationService.verifierTitulariat(entree.idClasse, entree.idAnneeScolaire);
  }
}
