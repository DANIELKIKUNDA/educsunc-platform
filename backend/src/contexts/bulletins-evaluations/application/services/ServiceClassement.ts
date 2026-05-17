import { MoteurClassementBulletin } from '../../domain/services/MoteurClassementBulletin';
import type { ClassementColonneClasse } from '../../domain/aggregates/ClassementColonneClasse';
import type { LigneClassementEleve } from '../../domain/entities/LigneClassementEleve';

// Ce service coordonne le recalcul applicatif du classement.
export class ServiceClassement {
  constructor(private readonly moteurClassement = new MoteurClassementBulletin()) {}

  // Cette methode demande au moteur de recalculer le classement complet.
  public recalculer(classement: ClassementColonneClasse, lignes: LigneClassementEleve[]): void {
    this.moteurClassement.recalculerClassement(classement, lignes);
  }
}
