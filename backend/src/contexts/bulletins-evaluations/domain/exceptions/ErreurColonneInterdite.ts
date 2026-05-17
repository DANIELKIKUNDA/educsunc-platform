import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'une colonne interdite a ete utilisee.
export class ErreurColonneInterdite extends ErreurMetier {
  constructor(message = 'La colonne est interdite pour cette structure de bulletin.') {
    super(message);
    this.name = 'ErreurColonneInterdite';
  }
}
