import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';
import type { AutorisationOrganisationScolaritePort } from '../../ports';

// Ce fichier contient le cas d'usage de lecture des inscriptions d'une organisation.
export interface ListerInscriptionsParOrganisationEntree {
  idOrganisation: string;
  idAnneeScolaire: string;
  idUtilisateur: string;
}

/** Ce cas d'usage liste les inscriptions d'une organisation pour une annee. */
export class ListerInscriptionsParOrganisation implements UseCase<ListerInscriptionsParOrganisationEntree, InscriptionScolaireSortieDTO[]> {
  constructor(
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly autorisationOrganisation?: AutorisationOrganisationScolaritePort,
  ) {}
  /** Execute la liste organisationnelle des inscriptions. */
  public async executer(entree: ListerInscriptionsParOrganisationEntree): Promise<InscriptionScolaireSortieDTO[]> {
    await this.autorisationOrganisation?.verifierLectureOrganisationScolarite({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
    });

    return (await this.depotInscription.listerParOrganisationEtAnnee(entree.idOrganisation, entree.idAnneeScolaire)).map(InscriptionScolaireMapper.versSortie);
  }
}
