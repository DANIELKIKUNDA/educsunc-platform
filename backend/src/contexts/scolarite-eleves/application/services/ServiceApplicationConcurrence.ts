import { ErreurConcurrenceApplication } from '../exceptions/ErreurConcurrenceApplication';

// Ce fichier contient le service applicatif qui exige et verifie les versions attendues.
/**
 * Ce service protege les commandes critiques contre l'ecrasement silencieux.
 */
export class ServiceApplicationConcurrence {
  /** Verifie qu'une version attendue est fournie et correspond a la version courante. */
  public verifierVersion(versionAttendue: number | undefined, versionCourante: number): void {
    if (versionAttendue === undefined) {
      throw new ErreurConcurrenceApplication('La versionAttendue est obligatoire pour cette modification.');
    }

    if (versionAttendue !== versionCourante) {
      throw new ErreurConcurrenceApplication(`Conflit de version: attendue ${versionAttendue}, courante ${versionCourante}.`);
    }
  }
}
