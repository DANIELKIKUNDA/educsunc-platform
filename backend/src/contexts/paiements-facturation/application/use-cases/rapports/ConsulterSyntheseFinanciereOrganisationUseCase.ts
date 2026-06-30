import type { ConsulterSyntheseFinanciereOrganisationInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationRapportFinancierPort } from '../../ports/AutorisationRapportFinancierPort';
import type { SyntheseFinanciereOrganisationReadModel } from '../../read-models/SyntheseFinanciereOrganisationReadModel';

export interface SyntheseFinanciereOrganisationRepository {
  consulterSyntheseOrganisation(params: {
    idOrganisation: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereOrganisationReadModel>;
}

export class ConsulterSyntheseFinanciereOrganisationUseCase {
  constructor(
    private readonly repository: SyntheseFinanciereOrganisationRepository,
    private readonly autorisationPort?: AutorisationRapportFinancierPort,
  ) {}

  public async executer(
    input: ConsulterSyntheseFinanciereOrganisationInput,
  ): Promise<SyntheseFinanciereOrganisationReadModel> {
    await this.autorisationPort?.verifierConsultationSyntheseFinanciereOrganisation({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
    });

    return this.repository.consulterSyntheseOrganisation({
      idOrganisation: input.idOrganisation,
      idAnneeScolaire: input.idAnneeScolaire,
      moisAnalyseJusqua: input.moisAnalyseJusqua,
      typeFrais: input.typeFrais,
    });
  }
}
