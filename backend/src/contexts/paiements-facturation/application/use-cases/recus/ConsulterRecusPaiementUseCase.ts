import type { ConsulterRecusPaiementInput } from '../../dto/input/RecusEntreeDTO';
import type { AutorisationConsultationRecusPort } from '../../ports/AutorisationConsultationRecusPort';
import type { RecusPaiementReadModel } from '../../read-models/RecusPaiementReadModel';

export interface RecusPaiementQueryRepository {
  listerRecus(params: {
    idEcole: string;
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<RecusPaiementReadModel>;
}

export class ConsulterRecusPaiementUseCase {
  constructor(
    private readonly repository: RecusPaiementQueryRepository,
    private readonly autorisationConsultationRecusPort?: AutorisationConsultationRecusPort,
  ) {}

  public async executer(input: ConsulterRecusPaiementInput): Promise<RecusPaiementReadModel> {
    await this.autorisationConsultationRecusPort?.verifierConsultationRecus({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    return this.repository.listerRecus({
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      numeroRecu: input.numeroRecu,
      dateDebut: input.dateDebut,
      dateFin: input.dateFin,
    });
  }
}
