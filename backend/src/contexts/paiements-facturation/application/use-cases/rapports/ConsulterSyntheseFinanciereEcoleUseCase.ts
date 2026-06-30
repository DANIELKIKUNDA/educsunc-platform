import type { ConsulterSyntheseFinanciereEcoleInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationRapportFinancierPort } from '../../ports/AutorisationRapportFinancierPort';
import type { SyntheseFinanciereEcoleReadModel } from '../../read-models/SyntheseFinanciereEcoleReadModel';

export interface SyntheseFinanciereEcoleRepository {
  consulterSyntheseEcole(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereEcoleReadModel>;
}

export class ConsulterSyntheseFinanciereEcoleUseCase {
  constructor(
    private readonly repository: SyntheseFinanciereEcoleRepository,
    private readonly autorisationPort?: AutorisationRapportFinancierPort,
  ) {}

  public async executer(
    input: ConsulterSyntheseFinanciereEcoleInput,
  ): Promise<SyntheseFinanciereEcoleReadModel> {
    await this.autorisationPort?.verifierConsultationPaiementsParCaissier({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    return this.repository.consulterSyntheseEcole({
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
      moisAnalyseJusqua: input.moisAnalyseJusqua,
      typeFrais: input.typeFrais,
    });
  }
}
