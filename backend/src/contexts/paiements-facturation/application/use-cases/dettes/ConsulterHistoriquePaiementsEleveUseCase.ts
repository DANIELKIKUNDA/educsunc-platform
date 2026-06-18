import type { ConsulterHistoriquePaiementsEleveInput } from 'contexts/paiements-facturation/application/dto/input/DettesEntreeDTO';
import type { AutorisationHistoriquePaiementsPort } from 'contexts/paiements-facturation/application/ports/AutorisationHistoriquePaiementsPort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import type { HistoriquePaiementsEleveReadModel } from 'contexts/paiements-facturation/application/read-models/HistoriquePaiementsEleveReadModel';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';

export interface HistoriquePaiementsEleveRepository {
  consulterParEleve(idEcole: string, idEleve: string): Promise<HistoriquePaiementsEleveReadModel>;
}

export class ConsulterHistoriquePaiementsEleveUseCase {
  constructor(
    private readonly repository: HistoriquePaiementsEleveRepository,
    private readonly scolariteElevesPort: ScolariteElevesPort,
    private readonly autorisationHistoriquePaiementsPort?: AutorisationHistoriquePaiementsPort,
  ) {}

  public async executer(
    input: ConsulterHistoriquePaiementsEleveInput,
  ): Promise<HistoriquePaiementsEleveReadModel> {
    const eleve = await this.scolariteElevesPort.consulterEleve(input.idEleve);

    if (eleve.idOrganisation !== input.idOrganisation || eleve.idEcole !== input.idEcole) {
      throw new ErreurDroitsInsuffisants(
        "L'eleve cible n'appartient pas au perimetre organisation + ecole courant.",
      );
    }

    await this.autorisationHistoriquePaiementsPort?.verifierConsultationHistoriquePaiements({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
    });

    return this.repository.consulterParEleve(input.idEcole, input.idEleve);
  }
}
