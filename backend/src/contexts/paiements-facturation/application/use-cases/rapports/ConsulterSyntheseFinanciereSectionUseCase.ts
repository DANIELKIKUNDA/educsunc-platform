import type { ConsulterSyntheseFinanciereSectionInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationSyntheseFinanciereSectionPort } from '../../ports/AutorisationSyntheseFinanciereSectionPort';
import type { SyntheseFinanciereSectionReadModel } from '../../read-models/SyntheseFinanciereSectionReadModel';

export interface SyntheseFinanciereSectionRepository {
  consulterSyntheseSection(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idSectionScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereSectionReadModel>;
}

export class ConsulterSyntheseFinanciereSectionUseCase {
  constructor(
    private readonly repository: SyntheseFinanciereSectionRepository,
    private readonly autorisationPort?: AutorisationSyntheseFinanciereSectionPort,
  ) {}

  public async executer(
    input: ConsulterSyntheseFinanciereSectionInput,
  ): Promise<SyntheseFinanciereSectionReadModel> {
    await this.autorisationPort?.verifierConsultationSyntheseFinanciereSection({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idSectionScolaire: input.idSectionScolaire,
    });

    return this.repository.consulterSyntheseSection({
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
      idSectionScolaire: input.idSectionScolaire,
      moisAnalyseJusqua: input.moisAnalyseJusqua,
      typeFrais: input.typeFrais,
    });
  }
}
