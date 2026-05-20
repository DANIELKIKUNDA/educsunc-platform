import type { AttribuerTitulariatInput, RetirerTitulariatInput } from '../dto/input';
import type { TitulariatOutput } from '../dto/output';
import type { SecurityTransactionPort } from '../ports';
import { SecurityAffectationService } from '../services/SecurityAffectationService';

// Cette saga encapsule les transactions critiques de titulariat.
export class SagaTitulariat {
  constructor(
    private readonly securityTransactionPort: SecurityTransactionPort,
    private readonly securityAffectationService: SecurityAffectationService,
  ) {}

  public async attribuer(input: AttribuerTitulariatInput): Promise<TitulariatOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityAffectationService.attribuerTitulariat(input));
  }

  public async retirer(input: RetirerTitulariatInput): Promise<TitulariatOutput> {
    return this.securityTransactionPort.executerDansTransaction(() => this.securityAffectationService.retirerTitulariat(input));
  }
}
