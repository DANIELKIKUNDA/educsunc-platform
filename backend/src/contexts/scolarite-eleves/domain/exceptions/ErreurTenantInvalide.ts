import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurTenantInvalide.
 */
export class ErreurTenantInvalide extends ErreurMetier {
  constructor(message = 'ErreurTenantInvalide') {
    super(message, 'ERREURTENANTINVALIDE');
    this.name = 'ErreurTenantInvalide';
  }
}
