import { ClassementColonneClasse } from '../aggregates/ClassementColonneClasse';
import { LigneClassementEleve } from '../entities/LigneClassementEleve';

// Ce moteur recalcule le classement officiel d'une classe sur une colonne.
export class MoteurClassementBulletin {
  // Cette methode transmet les lignes candidates au classement de colonne.
  public recalculerClassement(classement: ClassementColonneClasse, lignes: LigneClassementEleve[]): void {
    classement.recalculerClassement(lignes);
  }
}
