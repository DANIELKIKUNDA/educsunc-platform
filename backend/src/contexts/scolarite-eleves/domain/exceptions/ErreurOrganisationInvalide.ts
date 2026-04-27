import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurOrganisationInvalide.
 */
export class ErreurOrganisationInvalide extends ErreurMetier {
  constructor(message = 'ErreurOrganisationInvalide') {
    super(message, 'ERREURORGANISATIONINVALIDE');
    this.name = 'ErreurOrganisationInvalide';
  }
}
