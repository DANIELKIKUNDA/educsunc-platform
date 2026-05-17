import type { NonClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/NonClasseReadModel';

// Ce fichier prepare la projection documentaire des eleves non classes.
export class NonClasseProjectionHandler {
  // Cette methode retourne simplement les non classes deja normalises pour la lecture.
  public projeter(nonClasses: NonClasseReadModel[]): NonClasseReadModel[] {
    return [...nonClasses];
  }
}
