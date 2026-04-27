import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { ReintegrerEleveEntreeDTO } from '../../dto/input/ReintegrerEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de reintegration d'un eleve.
/** Ce cas d'usage specialise le changement de statut vers ACTIF. */
export class ReintegrerEleve extends ChangerStatutEleve {
  /** Execute la reintegration de l'eleve. */
  public override executer(entree: ReintegrerEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.ACTIF });
  }
}
