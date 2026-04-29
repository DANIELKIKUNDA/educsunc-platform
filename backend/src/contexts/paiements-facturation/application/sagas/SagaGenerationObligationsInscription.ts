import type { GenererObligationsEleveInput } from 'contexts/paiements-facturation/application/dto/input/ObligationsEntreeDTO';
import type { ObligationFinanciereOutput } from 'contexts/paiements-facturation/application/dto/output/ObligationsSortieDTO';
import { GenererObligationsEleveUseCase } from 'contexts/paiements-facturation/application/use-cases/obligations/GenererObligationsEleveUseCase';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';

export class SagaGenerationObligationsInscription {
  constructor(
    private readonly genererObligationsEleveUseCase: GenererObligationsEleveUseCase,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: GenererObligationsEleveInput): Promise<ObligationFinanciereOutput[]> {
    const resultat = await this.genererObligationsEleveUseCase.executer(input);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'SAGA_GENERATION_OBLIGATIONS_INSCRIPTION',
      idEcole: input.idEcole,
      referenceMetier: input.idEleve,
    });
    return resultat;
  }
}
