import { UseCase } from '../../../../../shared/application/UseCase';
import type { AutorisationParcoursElevePort } from '../../ports';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { ParcoursEleveSortieDTO } from '../../dto/output/ParcoursEleveSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { ParcoursEleveMapper } from '../../mappers/ParcoursEleveMapper';

// Ce fichier contient le cas d'usage de consultation du parcours d'un eleve.
export interface ConsulterParcoursEleveEntree {
  idEleve: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}
export interface SortieConsulterParcoursEleve { parcours: ParcoursEleveSortieDTO }

/** Ce cas d'usage retourne le parcours scolaire complet d'un eleve. */
export class ConsulterParcoursEleve implements UseCase<ConsulterParcoursEleveEntree, SortieConsulterParcoursEleve> {
  constructor(
    private readonly depotParcours: DepotParcoursScolaireEleve,
    private readonly autorisationParcours?: AutorisationParcoursElevePort,
  ) {}
  /** Execute la consultation du parcours. */
  public async executer(entree: ConsulterParcoursEleveEntree): Promise<SortieConsulterParcoursEleve> {
    await this.autorisationParcours?.verifierConsultationParcoursEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idEleve: entree.idEleve,
    });
    const parcours = await this.depotParcours.trouverParEleve(entree.idEleve);
    if (parcours === null) throw new ErreurRessourceIntrouvable('Parcours scolaire introuvable.');
    return { parcours: ParcoursEleveMapper.versSortie(parcours) };
  }
}
