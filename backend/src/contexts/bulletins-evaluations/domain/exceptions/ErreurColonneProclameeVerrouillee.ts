import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'une colonne proclamee verrouillee ne peut plus etre modifiee normalement.
export class ErreurColonneProclameeVerrouillee extends ErreurMetier {
  constructor(message = 'La colonne proclamee est verrouillee et ne peut pas etre modifiee normalement.') {
    super(message);
    this.name = 'ErreurColonneProclameeVerrouillee';
  }
}
