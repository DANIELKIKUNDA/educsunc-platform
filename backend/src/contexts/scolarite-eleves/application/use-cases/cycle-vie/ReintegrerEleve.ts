import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';
import { ReintegrerEleveEntreeDTO } from '../../dto/input/ReintegrerEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage de reintegration d'un eleve.
/** Ce cas d'usage specialise le changement de statut vers ACTIF. */
export class ReintegrerEleve extends ChangerStatutEleve {
  constructor(...args: ConstructorParameters<typeof ChangerStatutEleve>) {
    super(
      args[0],
      args[1],
      args[2],
      args[3],
      args[4],
      () => TypeEvenementParcours.REINTEGRATION,
    );
  }

  /** Execute la reintegration de l'eleve. */
  public override executer(entree: ReintegrerEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.ACTIF });
  }
}
