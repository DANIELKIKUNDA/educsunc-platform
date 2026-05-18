import { BulletinEleve } from '../aggregates/BulletinEleve';
import { DiagnosticTechniqueAcademique } from '../entities/DiagnosticTechniqueAcademique';
import { PolicyCompatibiliteVersionReferentiel } from '../policies/PolicyCompatibiliteVersionReferentiel';
import { PolicyValidationPedagogiqueFinale } from '../policies/PolicyValidationPedagogiqueFinale';

// Ce moteur verifie qu'un bulletin reste coherent avant generation finale ou validation.
export class MoteurValidationBulletin {
  // Cette methode valide un bulletin et retourne les diagnostics exploitable par l'application.
  public valider(params: {
    bulletin: BulletinEleve;
    diagnostics: DiagnosticTechniqueAcademique[];
    versionReferentielAttendue: string;
  }): {
    validationReussie: boolean;
    diagnostics: DiagnosticTechniqueAcademique[];
    bloquant: boolean;
  } {
    new PolicyCompatibiliteVersionReferentiel().verifier(
      params.versionReferentielAttendue,
      params.bulletin.obtenirVersionReferentielProgramme(),
      'Controle explicite de validation',
    );

    new PolicyValidationPedagogiqueFinale().verifier(
      params.diagnostics,
      true,
      true,
    );

    const bloquant = params.diagnostics.some((diagnostic) =>
      diagnostic.estBloquanteOuCritique(),
    );

    return {
      validationReussie: !bloquant,
      diagnostics: params.diagnostics,
      bloquant,
    };
  }
}
