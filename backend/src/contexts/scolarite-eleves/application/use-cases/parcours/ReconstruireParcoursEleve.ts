import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { ParcoursEleveSortieDTO } from '../../dto/output/ParcoursEleveSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { ParcoursEleveMapper } from '../../mappers/ParcoursEleveMapper';

// Ce fichier contient le cas d'usage de reconstruction du parcours scolaire.
export interface ReconstruireParcoursEleveEntree extends ContexteCommandeScolariteDTO {
  idEleve: string;
}
export interface SortieReconstruireParcoursEleve { parcours: ParcoursEleveSortieDTO }

/** Ce cas d'usage reconstruit le parcours sans perdre l'historique existant. */
export class ReconstruireParcoursEleve implements UseCase<ReconstruireParcoursEleveEntree, SortieReconstruireParcoursEleve> {
  constructor(private readonly depotParcours: DepotParcoursScolaireEleve) {}
  /** Execute la reconstruction a partir de l'historique deja connu. */
  public async executer(entree: ReconstruireParcoursEleveEntree): Promise<SortieReconstruireParcoursEleve> {
    const parcours = await this.depotParcours.trouverParEleve(entree.idEleve);
    if (parcours === null) throw new ErreurRessourceIntrouvable('Parcours scolaire introuvable.');
    parcours.reconstruireParcours(parcours.listerHistorique(), entree.idUtilisateur);
    await this.depotParcours.sauvegarder(parcours);
    return { parcours: ParcoursEleveMapper.versSortie(parcours) };
  }
}
