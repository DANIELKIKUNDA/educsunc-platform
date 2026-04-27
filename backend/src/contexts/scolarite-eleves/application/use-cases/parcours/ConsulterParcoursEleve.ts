import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { ParcoursEleveSortieDTO } from '../../dto/output/ParcoursEleveSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { ParcoursEleveMapper } from '../../mappers/ParcoursEleveMapper';

// Ce fichier contient le cas d'usage de consultation du parcours d'un eleve.
export interface ConsulterParcoursEleveEntree { idEleve: string }
export interface SortieConsulterParcoursEleve { parcours: ParcoursEleveSortieDTO }

/** Ce cas d'usage retourne le parcours scolaire complet d'un eleve. */
export class ConsulterParcoursEleve implements UseCase<ConsulterParcoursEleveEntree, SortieConsulterParcoursEleve> {
  constructor(private readonly depotParcours: DepotParcoursScolaireEleve) {}
  /** Execute la consultation du parcours. */
  public async executer(entree: ConsulterParcoursEleveEntree): Promise<SortieConsulterParcoursEleve> {
    const parcours = await this.depotParcours.trouverParEleve(entree.idEleve);
    if (parcours === null) throw new ErreurRessourceIntrouvable('Parcours scolaire introuvable.');
    return { parcours: ParcoursEleveMapper.versSortie(parcours) };
  }
}
