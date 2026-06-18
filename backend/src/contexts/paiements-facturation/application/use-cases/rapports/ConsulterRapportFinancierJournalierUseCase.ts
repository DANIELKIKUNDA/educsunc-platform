import type { ConsulterRapportFinancierJournalierInput } from '../../dto/input/RapportsEntreeDTO';
import type { AutorisationRapportFinancierPort } from '../../ports/AutorisationRapportFinancierPort';
import type { RapportFinancierReadModel } from '../../read-models/RapportFinancierReadModel';

export interface RapportFinancierJournalierRepository {
  consulterRapportJournalier(idEcole: string, date: string): Promise<RapportFinancierReadModel>;
}

export class ConsulterRapportFinancierJournalierUseCase {
  constructor(
    private readonly repository: RapportFinancierJournalierRepository,
    private readonly autorisationRapportFinancierPort?: AutorisationRapportFinancierPort,
  ) {}

  public async executer(
    input: ConsulterRapportFinancierJournalierInput,
  ): Promise<RapportFinancierReadModel> {
    await this.autorisationRapportFinancierPort?.verifierConsultationRapportJournalier({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    return this.repository.consulterRapportJournalier(input.idEcole, input.date);
  }
}
