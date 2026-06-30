import type { ConsulterSyntheseFinanciereClasseInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationRegistreFinancierClassePort } from '../../ports/AutorisationRegistreFinancierClassePort';
import type { SyntheseFinanciereClasseReadModel } from '../../read-models/SyntheseFinanciereClasseReadModel';

export interface SyntheseFinanciereClasseRepository {
  consulterSyntheseClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereClasseReadModel>;
}

export class ConsulterSyntheseFinanciereClasseUseCase {
  constructor(
    private readonly repository: SyntheseFinanciereClasseRepository,
    private readonly autorisationPort?: AutorisationRegistreFinancierClassePort,
  ) {}

  public async executer(
    input: ConsulterSyntheseFinanciereClasseInput,
  ): Promise<SyntheseFinanciereClasseReadModel> {
    await this.autorisationPort?.verifierConsultationRegistreFinancierClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.repository.consulterSyntheseClasse({
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
      idClassePedagogique: input.idClassePedagogique,
      moisAnalyseJusqua: input.moisAnalyseJusqua,
      typeFrais: input.typeFrais,
    });
  }
}
