import { ConflitConcurrenceDetecte } from '../events/ConflitConcurrenceDetecte';
import { ErreurConcurrence } from '../exceptions/ErreurConcurrence';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient le service de domaine qui protege les agregats contre les ecritures concurrentes.
/**
 * Ce moteur compare la version attendue par l'utilisateur avec la version reelle de l'agregat.
 */
export class MoteurConcurrenceAgregat {
  /** Verifie la coherence optimistic concurrency d'un agregat versionne. */
  public verifierVersionAttendues(idOrganisation: UUID, idEcole: UUID, declenchePar: UUID, referenceMetier: UUID, versionAttendue: number, versionReelle: number): void {
    if (!Number.isInteger(versionAttendue) || versionAttendue <= 0) {
      throw new ErreurConcurrence('La version attendue doit etre un entier positif.');
    }

    if (versionAttendue !== versionReelle) {
      new ConflitConcurrenceDetecte(idOrganisation, idEcole, declenchePar, referenceMetier);
      throw new ErreurConcurrence(`Conflit de modification: version attendue ${versionAttendue}, version reelle ${versionReelle}.`);
    }
  }
}
