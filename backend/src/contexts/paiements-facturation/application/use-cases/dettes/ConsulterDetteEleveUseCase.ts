import type { ConsulterDetteEleveInput } from 'contexts/paiements-facturation/application/dto/input/DettesEntreeDTO';
import type { DetteEleveOutput } from 'contexts/paiements-facturation/application/dto/output/DettesSortieDTO';
import type { DepotDetteEleve } from 'contexts/paiements-facturation/domain/repositories/DepotDetteEleve';
import { versDetteEleveOutput } from 'contexts/paiements-facturation/application/mappers/DetteEleveApplicationMapper';
import { ErreurLectureDetteImpossible } from 'contexts/paiements-facturation/application/exceptions/ErreurLectureDetteImpossible';

export class ConsulterDetteEleveUseCase {
  constructor(private readonly depotDetteEleve: DepotDetteEleve) {}

  public async executer(input: ConsulterDetteEleveInput): Promise<DetteEleveOutput> {
    const dette = await this.depotDetteEleve.trouverParEleve('', input.idEleve);
    if (dette === null) {
      throw new ErreurLectureDetteImpossible('Aucune dette n a ete trouvee pour cet eleve.');
    }
    return versDetteEleveOutput(dette);
  }
}
