import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurLectureDetteImpossible extends ErreurApplicationPaiements {
  constructor(message = 'La lecture de la dette eleve a echoue.') {
    super(message, 'ERREUR_LECTURE_DETTE_IMPOSSIBLE');
    this.name = 'ErreurLectureDetteImpossible';
  }
}
