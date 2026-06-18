import type { ConsulterArrieresEleveInput } from '../../dto/input/DettesEntreeDTO';
import type { AutorisationSituationFinanciereElevePort } from '../../ports/AutorisationSituationFinanciereElevePort';
import type { ScolariteElevesPort } from '../../ports/ScolariteElevesPort';
import type { ArrieresEleveReadModel } from '../../read-models/ArrieresEleveReadModel';
import { ErreurDroitsInsuffisants } from '../../exceptions/ErreurDroitsInsuffisants';

export interface ArrieresEleveRepository {
  consulterParEleve(idEcole: string, idEleve: string): Promise<ArrieresEleveReadModel>;
}

export class ConsulterArrieresEleveUseCase {
  constructor(
    private readonly repository: ArrieresEleveRepository,
    private readonly scolariteElevesPort: ScolariteElevesPort,
    private readonly autorisationSituationFinanciereElevePort?: AutorisationSituationFinanciereElevePort,
  ) {}

  public async executer(
    input: ConsulterArrieresEleveInput,
  ): Promise<ArrieresEleveReadModel> {
    const eleve = await this.scolariteElevesPort.consulterEleve(input.idEleve);

    if (eleve.idOrganisation !== input.idOrganisation || eleve.idEcole !== input.idEcole) {
      throw new ErreurDroitsInsuffisants(
        "L'eleve cible n'appartient pas au perimetre organisation + ecole courant.",
      );
    }

    await this.autorisationSituationFinanciereElevePort?.verifierConsultationSituationFinanciereEleve({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
    });

    return this.repository.consulterParEleve(input.idEcole, input.idEleve);
  }
}
