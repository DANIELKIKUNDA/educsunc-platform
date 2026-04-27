import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { DeclarerDecesEleveEntreeDTO } from '../../dto/input/DeclarerDecesEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de declaration de deces.
/** Ce cas d'usage specialise le changement de statut vers DECEDE. */
export class DeclarerDecesEleve extends ChangerStatutEleve {
  /** Execute la declaration de deces. */
  public override executer(entree: DeclarerDecesEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.DECEDE });
  }
}
