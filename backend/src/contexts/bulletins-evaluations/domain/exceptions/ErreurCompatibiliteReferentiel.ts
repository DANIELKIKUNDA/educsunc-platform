import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale une incompatibilite de version entre le referentiel et les donnees de bulletin.
export class ErreurCompatibiliteReferentiel extends ErreurMetier {
  constructor(message = 'La version du referentiel est incompatible avec les donnees academiques.') {
    super(message);
    this.name = 'ErreurCompatibiliteReferentiel';
  }
}
