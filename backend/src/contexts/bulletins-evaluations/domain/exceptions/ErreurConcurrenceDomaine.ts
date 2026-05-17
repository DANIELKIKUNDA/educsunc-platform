import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale un conflit de concurrence sur une ressource de cotation ou de bulletin.
export class ErreurConcurrenceDomaine extends ErreurMetier {
  constructor(message = 'Un conflit de concurrence domaine a ete detecte.') {
    super(message);
    this.name = 'ErreurConcurrenceDomaine';
  }
}
