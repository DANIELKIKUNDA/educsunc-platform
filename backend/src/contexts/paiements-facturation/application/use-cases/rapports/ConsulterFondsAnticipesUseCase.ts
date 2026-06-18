import type { ConsulterFondsAnticipesInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type {
  AutorisationFondsAnticipesPort,
  ResultatAutorisationFondsAnticipes,
} from '../../ports/AutorisationFondsAnticipesPort';
import type { FondsAnticipesReadModel } from '../../read-models/FondsAnticipesReadModel';

export interface FondsAnticipesRepository {
  consulter(
    idEcole: string,
    dateDebut?: string,
    dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<FondsAnticipesReadModel>;
}

export class ConsulterFondsAnticipesUseCase {
  constructor(
    private readonly repository: FondsAnticipesRepository,
    private readonly autorisationFondsAnticipesPort?: AutorisationFondsAnticipesPort,
  ) {}

  public async executer(
    input: ConsulterFondsAnticipesInput,
  ): Promise<FondsAnticipesReadModel> {
    const autorisation: ResultatAutorisationFondsAnticipes =
      await this.autorisationFondsAnticipesPort?.resoudreConsultationFondsAnticipes({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
      }) ?? {};

    return this.repository.consulter(
      input.idEcole,
      input.dateDebut,
      input.dateFin,
      autorisation.idsElevesAutorises,
    );
  }
}
