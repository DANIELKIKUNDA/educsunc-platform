import type { ConsulterDetteEleveInput } from 'contexts/paiements-facturation/application/dto/input/DettesEntreeDTO';
import type { AutorisationSituationFinanciereElevePort } from 'contexts/paiements-facturation/application/ports/AutorisationSituationFinanciereElevePort';
import type { DetteEleveOutput } from 'contexts/paiements-facturation/application/dto/output/DettesSortieDTO';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import type { DepotDetteEleve } from 'contexts/paiements-facturation/domain/repositories/DepotDetteEleve';
import { versDetteEleveOutput } from 'contexts/paiements-facturation/application/mappers/DetteEleveApplicationMapper';
import { ErreurLectureDetteImpossible } from 'contexts/paiements-facturation/application/exceptions/ErreurLectureDetteImpossible';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';

export class ConsulterDetteEleveUseCase {
  constructor(
    private readonly depotDetteEleve: DepotDetteEleve,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly autorisationSituationFinanciereElevePort?: AutorisationSituationFinanciereElevePort,
  ) {}

  public async executer(input: ConsulterDetteEleveInput): Promise<DetteEleveOutput> {
    const eleve = this.scolariteElevesPort === undefined
      ? null
      : await this.scolariteElevesPort.consulterEleve(input.idEleve);

    if (
      eleve !== null
      && (eleve.idOrganisation !== input.idOrganisation || eleve.idEcole !== input.idEcole)
    ) {
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

    const dette = await this.depotDetteEleve.trouverParEleve(eleve?.idEcole ?? '', input.idEleve);
    if (dette === null) {
      throw new ErreurLectureDetteImpossible('Aucune dette n a ete trouvee pour cet eleve.');
    }
    return versDetteEleveOutput(dette);
  }
}
