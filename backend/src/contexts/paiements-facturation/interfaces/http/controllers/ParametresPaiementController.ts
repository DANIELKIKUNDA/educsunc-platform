import {
  ConfigurerParametresPaiementEcoleUseCase,
  ConsulterParametresPaiementEcoleUseCase,
} from '../../../application/use-cases/parametres';
import { ParametresPaiementValidator } from '../validators/ParametresPaiementValidator';

export class ParametresPaiementController {
  constructor(
    private readonly casUsageConfiguration: ConfigurerParametresPaiementEcoleUseCase,
    private readonly casUsageConsultation?: ConsulterParametresPaiementEcoleUseCase,
  ) {}

  public async configurer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ParametresPaiementValidator.validerConfiguration(corps, headers);
    const sortie = await this.casUsageConfiguration.executer(entree);

    return { donnee: sortie };
  }

  public async consulter(headers: unknown): Promise<{ donnee: unknown }> {
    if (this.casUsageConsultation === undefined) {
      throw new Error('La consultation des parametres de paiement nest pas configuree.');
    }

    const entree = ParametresPaiementValidator.validerConsultation(headers);
    const sortie = await this.casUsageConsultation.executer(entree);

    return { donnee: sortie };
  }
}
