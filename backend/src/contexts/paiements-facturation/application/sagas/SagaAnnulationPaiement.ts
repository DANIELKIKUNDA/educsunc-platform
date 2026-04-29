import type { AnnulerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import { AnnulerPaiementUseCase } from 'contexts/paiements-facturation/application/use-cases/annulations/AnnulerPaiementUseCase';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';

export class SagaAnnulationPaiement {
  constructor(
    private readonly annulerPaiementUseCase: AnnulerPaiementUseCase,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: AnnulerPaiementInput): Promise<string> {
    const idAnnulation = await this.annulerPaiementUseCase.executer(input);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'SAGA_ANNULATION_PAIEMENT',
      idEcole: '',
      idUtilisateur: input.annulePar,
      referenceMetier: idAnnulation,
    });
    return idAnnulation;
  }
}
