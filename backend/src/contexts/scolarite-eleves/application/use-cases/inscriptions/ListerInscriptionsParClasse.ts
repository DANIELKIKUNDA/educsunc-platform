import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';

// Ce fichier contient le cas d'usage de liste des inscriptions par classe.
export interface ListerInscriptionsParClasseEntree { idClassePedagogique: string }

/** Ce cas d'usage liste les inscriptions associees a une classe pedagogique. */
export class ListerInscriptionsParClasse implements UseCase<ListerInscriptionsParClasseEntree, InscriptionScolaireSortieDTO[]> {
  constructor(private readonly depotInscription: DepotInscriptionScolaire) {}

  /** Execute la liste des inscriptions par classe. */
  public async executer(entree: ListerInscriptionsParClasseEntree): Promise<InscriptionScolaireSortieDTO[]> {
    return (await this.depotInscription.listerParClasse(entree.idClassePedagogique)).map(InscriptionScolaireMapper.versSortie);
  }
}
