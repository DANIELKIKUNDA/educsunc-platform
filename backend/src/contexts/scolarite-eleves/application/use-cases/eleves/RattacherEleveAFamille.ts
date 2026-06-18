import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { RattacherEleveAFamilleEntreeDTO } from '../../dto/input/RattacherEleveAFamilleEntreeDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';
import type { AutorisationElevePort } from '../../ports';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de rattachement d'un eleve a une famille.
export interface SortieRattacherEleveAFamille { eleve: EleveDetailSortieDTO }

/** Ce cas d'usage rattache un eleve a une famille existante. */
export class RattacherEleveAFamille implements UseCase<RattacherEleveAFamilleEntreeDTO, SortieRattacherEleveAFamille> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly depotFamille: DepotFamille,
    private readonly autorisationEleve?: AutorisationElevePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute le rattachement familial. */
  public async executer(entree: RattacherEleveAFamilleEntreeDTO): Promise<SortieRattacherEleveAFamille> {
    await this.autorisationEleve?.verifierMutationEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const [eleve, famille] = await Promise.all([
      this.depotEleve.trouverParId(entree.idEleve),
      this.depotFamille.trouverParId(entree.idFamille),
    ]);

    if (eleve === null || famille === null) {
      throw new ErreurRessourceIntrouvable('Eleve ou famille introuvable.');
    }

    if (
      eleve.obtenirIdOrganisation() !== entree.idOrganisation
      || eleve.obtenirIdEcole() !== entree.idEcole
      || famille.obtenirIdOrganisation() !== entree.idOrganisation
      || famille.obtenirIdEcole() !== entree.idEcole
    ) {
      throw new ErreurRessourceIntrouvable('Eleve ou famille introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, eleve.obtenirVersion());
    eleve.rattacherFamille(famille.obtenirId(), entree.idUtilisateur);
    await this.depotEleve.sauvegarder(eleve);

    return { eleve: EleveMapper.versDetail(eleve) };
  }
}
