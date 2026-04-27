import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';

// Ce fichier contient le cas d'usage de liste des inscriptions par annee.
export interface ListerInscriptionsParAnneeEntree { idAnneeScolaire: string }

/** Ce cas d'usage liste les inscriptions d'une annee scolaire. */
export class ListerInscriptionsParAnnee implements UseCase<ListerInscriptionsParAnneeEntree, InscriptionScolaireSortieDTO[]> {
  constructor(private readonly depotInscription: DepotInscriptionScolaire) {}
  /** Execute la liste par annee. */
  public async executer(entree: ListerInscriptionsParAnneeEntree): Promise<InscriptionScolaireSortieDTO[]> {
    return (await this.depotInscription.listerParAnnee(entree.idAnneeScolaire)).map(InscriptionScolaireMapper.versSortie);
  }
}
