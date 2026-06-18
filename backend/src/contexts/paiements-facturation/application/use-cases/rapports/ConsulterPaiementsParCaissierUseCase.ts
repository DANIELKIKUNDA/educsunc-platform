import type { ConsulterPaiementsParCaissierInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationRapportFinancierPort } from '../../ports/AutorisationRapportFinancierPort';
import type { PaiementsParCaissierReadModel } from '../../read-models/PaiementsParCaissierReadModel';

export interface PaiementsParCaissierRepository {
  listerParCaissier(
    idEcole: string,
    dateDebut?: string,
    dateFin?: string,
  ): Promise<PaiementsParCaissierReadModel>;
}

export class ConsulterPaiementsParCaissierUseCase {
  constructor(
    private readonly repository: PaiementsParCaissierRepository,
    private readonly autorisationRapportFinancierPort?: AutorisationRapportFinancierPort,
  ) {}

  public async executer(
    input: ConsulterPaiementsParCaissierInput,
  ): Promise<PaiementsParCaissierReadModel> {
    await this.autorisationRapportFinancierPort?.verifierConsultationPaiementsParCaissier({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    return this.repository.listerParCaissier(
      input.idEcole,
      input.dateDebut,
      input.dateFin,
    );
  }
}
