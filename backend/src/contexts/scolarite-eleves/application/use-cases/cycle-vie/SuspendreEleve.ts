import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { SuspendreEleveEntreeDTO } from '../../dto/input/SuspendreEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de suspension d'un eleve.
/** Ce cas d'usage specialise le changement de statut vers SUSPENDU. */
export class SuspendreEleve extends ChangerStatutEleve {
  /** Execute la suspension de l'eleve. */
  public override executer(entree: SuspendreEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.SUSPENDU });
  }
}
