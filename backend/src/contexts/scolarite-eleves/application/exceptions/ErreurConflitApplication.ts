import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur de conflit applicatif.
/**
 * Cette erreur represente un conflit fonctionnel detecte pendant l'orchestration.
 */
export class ErreurConflitApplication extends ErreurApplication {
  constructor(message = 'Un conflit applicatif empeche l operation.') {
    super(message, 'ERREUR_CONFLIT_APPLICATION_SCOLARITE_ELEVES');
    this.name = 'ErreurConflitApplication';
  }
}
