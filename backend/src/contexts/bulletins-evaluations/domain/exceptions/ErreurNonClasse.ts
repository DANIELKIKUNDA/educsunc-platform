import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un traitement incompatible avec un eleve non classe.
export class ErreurNonClasse extends ErreurMetier {
  constructor(message = 'L eleve est non classe pour cette colonne.') {
    super(message);
    this.name = 'ErreurNonClasse';
  }
}
