import { DtoChronologieNotification } from '../dto';
import { ModeleLectureChronologieNotification } from '../read-models';

// Ce fichier transforme une chronologie projetee en DTO de sortie.

/** Cette classe convertit la chronologie projetee en DTO expose. */
export class MappeurChronologieNotification {
  /** Cette methode convertit toutes les entrees de chronologie en DTO stables. */
  public static versDto(modele: ModeleLectureChronologieNotification): DtoChronologieNotification[] {
    return modele.elements.map((element) => ({
      identifiant: element.identifiant,
      typeEvenement: element.typeEvenement,
      statutAvant: element.statutAvant,
      statutApres: element.statutApres,
      horodatage: element.horodatage.toISOString(),
      correlationId: element.correlationId,
      requestId: element.requestId,
      acteur: element.acteur,
      metadonnees: element.metadonnees,
    }));
  }
}
