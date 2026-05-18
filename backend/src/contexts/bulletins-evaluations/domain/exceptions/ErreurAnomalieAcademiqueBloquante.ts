import { ErreurMetier } from './ErreurMetier';

// Cette erreur signale qu'une anomalie bloquante ou critique interdit une action metier.
export class ErreurAnomalieAcademiqueBloquante extends ErreurMetier {
  constructor(message = "Une anomalie academique bloquante interdit l'action demandee.") {
    super(message);
    this.name = 'ErreurAnomalieAcademiqueBloquante';
  }
}
