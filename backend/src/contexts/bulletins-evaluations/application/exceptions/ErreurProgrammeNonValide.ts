import { GenerationBulletinException } from './GenerationBulletinException';

// Cette erreur indique qu'un programme niveau existe mais n'est pas encore exploitable.
export class ErreurProgrammeNonValide extends GenerationBulletinException {
  constructor(message = 'Le programme niveau rattache au bulletin doit etre valide pour permettre la generation.') {
    super(message);
    this.name = 'ErreurProgrammeNonValide';
  }
}
