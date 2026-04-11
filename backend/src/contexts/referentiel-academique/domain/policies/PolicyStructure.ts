import { ClasseAcademique } from '../aggregates/ClasseAcademique';
import { SectionScolaire } from '../aggregates/SectionScolaire';
import { ErreurStructureInvalide } from '../exceptions/ErreurStructureInvalide';

// Cette policy porte les regles globales de structure scolaire figee du referentiel academique.
export class PolicyStructure {
  // Cette methode interdit toute invention libre de structure scolaire officielle hors referentiel.
  public interdireModificationLibreStructureScolaire(): never {
    throw new ErreurStructureInvalide(
      'La structure scolaire officielle est figee et ne peut pas etre redefinie librement.',
    );
  }

  // Cette methode verifie que les classes academiques rattachees respectent bien la section ciblee.
  public verifierRespectDesSections(
    sectionScolaire: SectionScolaire,
    classesAcademiques: readonly ClasseAcademique[],
  ): void {
    if (!sectionScolaire.estActive()) {
      throw new ErreurStructureInvalide(
        'Une structure scolaire ne peut pas s appuyer sur une section inactive.',
      );
    }

    for (const classeAcademique of classesAcademiques) {
      if (!classeAcademique.obtenirSectionScolaireId().estEgal(sectionScolaire.obtenirId())) {
        throw new ErreurStructureInvalide(
          'Chaque classe academique doit rester rattachee a la section scolaire attendue.',
        );
      }
    }
  }

  // Cette methode verifie que l'ordre des niveaux reste coherent dans une sequence de classes.
  public verifierRespectDesNiveaux(
    classesAcademiques: readonly ClasseAcademique[],
  ): void {
    let ordrePrecedent = 0;

    for (const classeAcademique of classesAcademiques) {
      const ordreCourant = classeAcademique.obtenirOrdrePedagogiqueNumerique();

      if (ordreCourant <= 0) {
        throw new ErreurStructureInvalide(
          'Chaque classe academique doit porter un ordre pedagogique strictement positif.',
        );
      }

      if (ordreCourant < ordrePrecedent) {
        throw new ErreurStructureInvalide(
          'La sequence des classes academiques doit respecter la progression des niveaux.',
        );
      }

      ordrePrecedent = ordreCourant;
    }
  }
}
