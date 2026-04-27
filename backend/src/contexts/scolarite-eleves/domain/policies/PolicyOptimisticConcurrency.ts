import { ErreurConcurrence } from '../exceptions/ErreurConcurrence';

// Ce fichier contient la regle d'optimistic concurrency commune aux agregats versionnes.
/**
 * Cette policy verifie qu'une commande modifie la version qu'elle a reellement lue.
 */
export class PolicyOptimisticConcurrency {
  /** Compare la version attendue avec la version courante. */
  public verifierVersion(versionAttendue: number, versionCourante: number): void {
    if (!Number.isInteger(versionAttendue) || versionAttendue <= 0) {
      throw new ErreurConcurrence('La version attendue doit etre un entier positif.');
    }

    if (versionAttendue !== versionCourante) {
      throw new ErreurConcurrence(`Conflit de version: attendue ${versionAttendue}, courante ${versionCourante}.`);
    }
  }
}
