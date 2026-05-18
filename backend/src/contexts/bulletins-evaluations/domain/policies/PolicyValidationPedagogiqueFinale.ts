import { DiagnosticTechniqueAcademique } from '../entities/DiagnosticTechniqueAcademique';
import { ErreurValidationBulletinImpossible } from '../exceptions/ErreurValidationBulletinImpossible';

// Cette policy verifie que les conditions de validation pedagogique finale sont reunies.
export class PolicyValidationPedagogiqueFinale {
  // Cette methode bloque la validation si une anomalie bloquante ou critique reste presente.
  public verifier(
    diagnostics: DiagnosticTechniqueAcademique[],
    applicationPresente: boolean,
    conduitePresente: boolean,
  ): void {
    if (diagnostics.some((diagnostic) => diagnostic.estBloquanteOuCritique())) {
      throw new ErreurValidationBulletinImpossible(
        'Une anomalie bloquante ou critique interdit la validation officielle.',
      );
    }

    if (!applicationPresente) {
      throw new ErreurValidationBulletinImpossible(
        "L'application doit etre calculee avant validation.",
      );
    }

    if (!conduitePresente) {
      throw new ErreurValidationBulletinImpossible(
        'La conduite exigible doit etre presente avant validation.',
      );
    }
  }
}
