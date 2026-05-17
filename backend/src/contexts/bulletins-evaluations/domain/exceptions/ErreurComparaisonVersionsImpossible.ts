import { ErreurMigrationBulletinInvalide } from './ErreurMigrationBulletinInvalide';

// Cette erreur signale l'impossibilite de comparer deux versions de referentiel.
export class ErreurComparaisonVersionsImpossible extends ErreurMigrationBulletinInvalide {
  constructor(message = 'La comparaison entre versions du referentiel est impossible.') {
    super(message);
    this.name = 'ErreurComparaisonVersionsImpossible';
  }
}
