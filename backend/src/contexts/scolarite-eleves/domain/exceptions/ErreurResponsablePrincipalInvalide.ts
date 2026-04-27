import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurResponsablePrincipalInvalide.
 */
export class ErreurResponsablePrincipalInvalide extends ErreurMetier {
  constructor(message = 'ErreurResponsablePrincipalInvalide') {
    super(message, 'ERREURRESPONSABLEPRINCIPALINVALIDE');
    this.name = 'ErreurResponsablePrincipalInvalide';
  }
}
