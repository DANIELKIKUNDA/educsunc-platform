import type { HistoriqueBulletinReadModel } from '../../read-models/HistoriqueBulletinReadModel';
import { QueryException } from '../../exceptions/QueryException';
import type { HistoriqueBulletinQuery } from '../../queries/HistoriqueBulletinQuery';
import type { BulletinEleveQuery } from '../../queries/BulletinEleveQuery';
import type { AutorisationLectureBulletinPort } from '../../ports/out/AutorisationLectureBulletinPort';
import type { ConsulterHistoriqueBulletinInput } from '../../dto/input/ConsulterHistoriqueBulletinInput';

// Ce use case expose la lecture de l'historique de generation d'un bulletin.
export class ConsulterHistoriqueBulletinUseCase {
  constructor(
    private readonly query: HistoriqueBulletinQuery,
    private readonly bulletinQuery: BulletinEleveQuery,
    private readonly autorisationLectureBulletin: AutorisationLectureBulletinPort,
  ) {}

  // Cette methode retourne l'historique demande ou echoue proprement.
  public async executer(input: ConsulterHistoriqueBulletinInput): Promise<HistoriqueBulletinReadModel[]> {
    const bulletin = await this.bulletinQuery.executerParId(input.idBulletinEleve);
    if (bulletin === null) {
      throw new QueryException('Le bulletin demande est introuvable.');
    }

    await this.autorisationLectureBulletin.verifierLectureBulletin({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: bulletin.idEleve,
      idClassePedagogique: bulletin.idClassePedagogique,
      idAnneeScolaire: bulletin.idAnneeScolaire,
    });

    const historique = await this.query.executer(input.idBulletinEleve);
    if (historique.length === 0) {
      throw new QueryException('Aucun historique de bulletin n a ete trouve pour cette ressource.');
    }

    return historique;
  }
}
