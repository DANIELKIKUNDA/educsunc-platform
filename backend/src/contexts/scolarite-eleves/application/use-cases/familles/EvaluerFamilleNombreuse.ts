import { UseCase } from '../../../../../shared/application/UseCase';
import { ServiceEligibiliteFamilleNombreuse } from '../../../domain/services/ServiceEligibiliteFamilleNombreuse';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { FamilleNombreuseSortieDTO } from '../../dto/output/FamilleNombreuseSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import type { AutorisationFamillePort } from '../../ports';

// Ce fichier contient le cas d'usage d'evaluation famille nombreuse.
export interface EvaluerFamilleNombreuseEntree {
  idFamille: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  seuilFamilleNombreuse?: number;
}

/** Ce cas d'usage expose l'eligibilite famille nombreuse au reste de l'application. */
export class EvaluerFamilleNombreuse implements UseCase<EvaluerFamilleNombreuseEntree, FamilleNombreuseSortieDTO> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly autorisationFamille?: AutorisationFamillePort,
    private readonly serviceEligibilite: ServiceEligibiliteFamilleNombreuse = new ServiceEligibiliteFamilleNombreuse(),
  ) {}

  /** Execute l'evaluation de la famille nombreuse. */
  public async executer(entree: EvaluerFamilleNombreuseEntree): Promise<FamilleNombreuseSortieDTO> {
    await this.autorisationFamille?.verifierLectureFamille({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const famille = await this.depotFamille.trouverParId(entree.idFamille);

    if (famille === null) {
      throw new ErreurRessourceIntrouvable('Famille introuvable.');
    }

    const nombreElevesEligibles = await this.depotFamille.compterElevesActifsDeFamille(entree.idFamille);
    const resultat = this.serviceEligibilite.evaluer(nombreElevesEligibles, entree.seuilFamilleNombreuse);

    return {
      idFamille: entree.idFamille,
      ...resultat,
    };
  }
}
