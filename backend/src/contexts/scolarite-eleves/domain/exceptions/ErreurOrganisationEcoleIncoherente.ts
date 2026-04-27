import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurOrganisationEcoleIncoherente.
 */
export class ErreurOrganisationEcoleIncoherente extends ErreurMetier {
  constructor(message = 'ErreurOrganisationEcoleIncoherente') {
    super(message, 'ERREURORGANISATIONECOLEINCOHERENTE');
    this.name = 'ErreurOrganisationEcoleIncoherente';
  }
}
