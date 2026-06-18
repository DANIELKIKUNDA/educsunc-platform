import type { DtoHttpCaptureTrace } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de capture de trace.

export class ValidateurHttpCaptureTrace {
  public static valider(entree: unknown): DtoHttpCaptureTrace {
    return entree as DtoHttpCaptureTrace;
  }
}
