import type { ConsulterRegistreFinancierClasseInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type { AutorisationRegistreFinancierClassePort } from '../../ports/AutorisationRegistreFinancierClassePort';
import type { RegistreFinancierClasseReadModel } from '../../read-models/RegistreFinancierClasseReadModel';

export interface RegistreFinancierClasseRepository {
  consulterRegistreClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
  }): Promise<RegistreFinancierClasseReadModel>;
}

export class ConsulterRegistreFinancierClasseUseCase {
  constructor(
    private readonly repository: RegistreFinancierClasseRepository,
    private readonly autorisationPort?: AutorisationRegistreFinancierClassePort,
  ) {}

  public async executer(
    input: ConsulterRegistreFinancierClasseInput,
  ): Promise<RegistreFinancierClasseReadModel> {
    await this.autorisationPort?.verifierConsultationRegistreFinancierClasse({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idClassePedagogique: input.idClassePedagogique,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    return this.repository.consulterRegistreClasse({
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idAnneeScolaire: input.idAnneeScolaire,
      idClassePedagogique: input.idClassePedagogique,
      moisAnalyseJusqua: input.moisAnalyseJusqua,
    });
  }
}
