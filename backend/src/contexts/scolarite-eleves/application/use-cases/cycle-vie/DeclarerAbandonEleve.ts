import { ChangerStatutEleve } from '../eleves/ChangerStatutEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { DeclarerAbandonEleveEntreeDTO } from '../../dto/input/DeclarerAbandonEleveEntreeDTO';
import { SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de declaration d'abandon.
/**
 * Ce cas d'usage specialise le changement de statut vers ABANDONNE.
 */
export class DeclarerAbandonEleve extends ChangerStatutEleve {
  /** Execute la declaration d'abandon. */
  public override executer(entree: DeclarerAbandonEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.ABANDONNE });
  }
}
