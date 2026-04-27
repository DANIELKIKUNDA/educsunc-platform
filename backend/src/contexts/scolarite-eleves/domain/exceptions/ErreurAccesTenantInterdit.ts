import { ErreurMetier } from './ErreurMetier';

/**
 * Cette exception metier represente le cas ErreurAccesTenantInterdit.
 */
export class ErreurAccesTenantInterdit extends ErreurMetier {
  constructor(message = 'ErreurAccesTenantInterdit') {
    super(message, 'ERREURACCESTENANTINTERDIT');
    this.name = 'ErreurAccesTenantInterdit';
  }
}
