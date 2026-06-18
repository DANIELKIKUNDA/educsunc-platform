import type { ConsulterPaiementsParTypeFraisInput } from '../../dto/input/AnalysesFinancieresEntreeDTO';
import type {
  AutorisationPaiementsParTypeFraisPort,
  ResultatAutorisationPaiementsParTypeFrais,
} from '../../ports/AutorisationPaiementsParTypeFraisPort';
import type { PaiementsParTypeFraisReadModel } from '../../read-models/PaiementsParTypeFraisReadModel';

export interface PaiementsParTypeFraisRepository {
  listerParType(
    idEcole: string,
    dateDebut?: string,
    dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<PaiementsParTypeFraisReadModel>;
}

export class ConsulterPaiementsParTypeFraisUseCase {
  constructor(
    private readonly repository: PaiementsParTypeFraisRepository,
    private readonly autorisationPaiementsParTypeFraisPort?: AutorisationPaiementsParTypeFraisPort,
  ) {}

  public async executer(
    input: ConsulterPaiementsParTypeFraisInput,
  ): Promise<PaiementsParTypeFraisReadModel> {
    const autorisation: ResultatAutorisationPaiementsParTypeFrais =
      await this.autorisationPaiementsParTypeFraisPort?.resoudreConsultationPaiementsParTypeFrais({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
      }) ?? {};

    return this.repository.listerParType(
      input.idEcole,
      input.dateDebut,
      input.dateFin,
      autorisation.idsElevesAutorises,
    );
  }
}
