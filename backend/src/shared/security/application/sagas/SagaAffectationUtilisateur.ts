import type { AjouterScopeAffectationInput, CreerAffectationUtilisateurInput, DesactiverAffectationInput } from '../dto/input';
import type { AffectationUtilisateurOutput, ScopeUtilisateurOutput } from '../dto/output';
import type { SecurityTransactionPort } from '../ports';
import { SecurityAffectationService } from '../services/SecurityAffectationService';

// Cette saga orchestre les changements critiques sur les affectations utilisateur.
export class SagaAffectationUtilisateur {
  constructor(
    private readonly securityTransactionPort: SecurityTransactionPort,
    private readonly securityAffectationService: SecurityAffectationService,
  ) {}

  public async creerAffectation(input: CreerAffectationUtilisateurInput): Promise<AffectationUtilisateurOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityAffectationService.creerAffectation(input));
  }

  public async desactiverAffectation(input: DesactiverAffectationInput): Promise<AffectationUtilisateurOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityAffectationService.desactiverAffectation(input));
  }

  public async ajouterScope(input: AjouterScopeAffectationInput): Promise<readonly ScopeUtilisateurOutput[]> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityAffectationService.ajouterScope(input));
  }
}
