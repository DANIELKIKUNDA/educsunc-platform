import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';

// Ce fichier contient le cas d'usage de consultation d'un eleve.
export interface ConsulterEleveEntree { idEleve: string }
export interface SortieConsulterEleve { eleve: EleveDetailSortieDTO }

/** Ce cas d'usage retourne le detail d'un eleve. */
export class ConsulterEleve implements UseCase<ConsulterEleveEntree, SortieConsulterEleve> {
  constructor(private readonly depotEleve: DepotEleve) {}

  /** Execute la consultation d'un eleve par identifiant. */
  public async executer(entree: ConsulterEleveEntree): Promise<SortieConsulterEleve> {
    const eleve = await this.depotEleve.trouverParId(entree.idEleve);

    if (eleve === null) {
      throw new ErreurRessourceIntrouvable('Eleve introuvable.');
    }

    return { eleve: EleveMapper.versDetail(eleve) };
  }
}
