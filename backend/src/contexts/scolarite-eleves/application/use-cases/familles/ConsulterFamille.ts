import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { FamilleMapper } from '../../mappers/FamilleMapper';

// Ce fichier contient le cas d'usage de consultation d'une famille.
export interface ConsulterFamilleEntree { idFamille: string }
export interface SortieConsulterFamille { famille: FamilleSortieDTO }

/** Ce cas d'usage retourne une famille par identifiant. */
export class ConsulterFamille implements UseCase<ConsulterFamilleEntree, SortieConsulterFamille> {
  constructor(private readonly depotFamille: DepotFamille) {}

  /** Execute la consultation d'une famille. */
  public async executer(entree: ConsulterFamilleEntree): Promise<SortieConsulterFamille> {
    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    return { famille: FamilleMapper.versSortie(famille) };
  }
}
