import type { AnnulerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import { AnnulerPaiementUseCase } from 'contexts/paiements-facturation/application/use-cases/annulations/AnnulerPaiementUseCase';

export class SagaAnnulationPaiement {
  constructor(
    private readonly annulerPaiementUseCase: AnnulerPaiementUseCase,
  ) {}

  public async executer(input: AnnulerPaiementInput): Promise<string> {
    const idAnnulation = await this.annulerPaiementUseCase.executer(input);
    return idAnnulation;
  }
}
