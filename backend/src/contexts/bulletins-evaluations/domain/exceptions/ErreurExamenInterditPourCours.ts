import { ErreurMetier } from './ErreurMetier';

// Cette erreur interdit les colonnes examen pour un cours sans examen.
export class ErreurExamenInterditPourCours extends ErreurMetier {
  constructor(message = 'Le cours ne permet pas d examen pour cette colonne.') {
    super(message);
    this.name = 'ErreurExamenInterditPourCours';
  }
}
