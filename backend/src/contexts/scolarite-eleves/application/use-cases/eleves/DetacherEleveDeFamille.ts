import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { RattacherEleveAFamilleEntreeDTO } from '../../dto/input/RattacherEleveAFamilleEntreeDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';
import type { AutorisationElevePort } from '../../ports';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage qui detache un eleve de sa famille.
export interface SortieDetacherEleveDeFamille { eleve: EleveDetailSortieDTO }

/** Ce cas d'usage supprime le lien eleve-famille sans supprimer l'eleve ni la famille. */
export class DetacherEleveDeFamille implements UseCase<Omit<RattacherEleveAFamilleEntreeDTO, 'idFamille'>, SortieDetacherEleveDeFamille> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly autorisationEleve?: AutorisationElevePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute le detachement familial. */
  public async executer(entree: Omit<RattacherEleveAFamilleEntreeDTO, 'idFamille'>): Promise<SortieDetacherEleveDeFamille> {
    await this.autorisationEleve?.verifierMutationEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const eleve = await this.depotEleve.trouverParId(entree.idEleve);

    if (eleve === null) {
      throw new ErreurRessourceIntrouvable('Eleve introuvable.');
    }

    if (
      eleve.obtenirIdOrganisation() !== entree.idOrganisation
      || eleve.obtenirIdEcole() !== entree.idEcole
    ) {
      throw new ErreurRessourceIntrouvable('Eleve introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, eleve.obtenirVersion());
    eleve.detacherFamille(entree.idUtilisateur);
    await this.depotEleve.sauvegarder(eleve);

    return { eleve: EleveMapper.versDetail(eleve) };
  }
}
