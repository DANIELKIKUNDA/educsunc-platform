import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TransfererEleveEntreeDTO } from '../../dto/input/TransfererEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de transfert sortant d'un eleve.
/**
 * Ce cas d'usage specialise le changement de statut vers TRANSFERE.
 */
export class TransfererEleve extends ChangerStatutEleve {
  /** Execute le transfert de l'eleve. */
  public override executer(entree: TransfererEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.TRANSFERE });
  }
}
