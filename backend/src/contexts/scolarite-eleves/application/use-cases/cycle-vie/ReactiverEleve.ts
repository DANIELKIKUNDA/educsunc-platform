import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';
import { ReactiverEleveEntreeDTO } from '../../dto/input/ReactiverEleveEntreeDTO';
import { ChangerStatutEleve, SortieChangerStatutEleve } from '../eleves/ChangerStatutEleve';

// Ce fichier contient le cas d'usage explicite de reactivation d'un eleve.
export class ReactiverEleve extends ChangerStatutEleve {
  constructor(...args: ConstructorParameters<typeof ChangerStatutEleve>) {
    super(
      args[0],
      args[1],
      args[2],
      args[3],
      args[4],
      () => TypeEvenementParcours.REACTIVATION,
    );
  }

  /** Execute la reactivation de l'eleve. */
  public override executer(entree: ReactiverEleveEntreeDTO): Promise<SortieChangerStatutEleve> {
    return super.executer({ ...entree, nouveauStatut: StatutEleve.ACTIF });
  }
}
