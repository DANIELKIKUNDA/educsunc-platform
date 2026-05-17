import { ErreurConduiteInvalide } from './ErreurConduiteInvalide';

// Cette erreur signale une conduite hors bareme autorise.
export class ErreurConduiteHorsBareme extends ErreurConduiteInvalide {
  constructor(message = 'Les points de conduite doivent rester entre 0 et 100.') {
    super(message);
    this.name = 'ErreurConduiteHorsBareme';
  }
}
