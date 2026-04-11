import { ProgrammeNiveau } from '../aggregates/ProgrammeNiveau';
import { ErreurProgrammeNiveauInvalide } from '../exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurValidationProgrammeImpossible } from '../exceptions/ErreurValidationProgrammeImpossible';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { StatutProgrammeNiveau } from '../value-objects/StatutProgrammeNiveau';

// Cette policy porte les regles globales d'exploitation locale des programmes de niveau.
export class PolicyProgrammeLocal {
  // Cette methode verifie qu'il n'existe qu'un seul programme actif pour une ecole, une annee et une classe.
  public verifierProgrammeActifParClasse(
    programmesNiveau: readonly ProgrammeNiveau[],
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
    classeAcademiqueId: ClasseAcademiqueId,
  ): void {
    const totalProgrammesActifs = programmesNiveau.filter(
      (programmeNiveau) =>
        programmeNiveau.obtenirStatut() === StatutProgrammeNiveau.VALIDE
        && programmeNiveau.obtenirEcoleId().estEgal(ecoleId)
        && programmeNiveau.obtenirAnneeScolaireId().estEgal(anneeScolaireId)
        && programmeNiveau.obtenirClasseAcademiqueId().estEgal(classeAcademiqueId),
    ).length;

    if (totalProgrammesActifs > 1) {
      throw new ErreurProgrammeNiveauInvalide(
        'Un seul programme niveau valide est autorise pour une classe academique donnee.',
      );
    }
  }

  // Cette methode verifie qu'aucun programme local n'est exploite sans validation prealable.
  public verifierValidationObligatoire(programmeNiveau: ProgrammeNiveau): void {
    if (programmeNiveau.obtenirStatut() === StatutProgrammeNiveau.BROUILLON) {
      throw new ErreurValidationProgrammeImpossible(
        'Un programme niveau doit etre valide avant toute exploitation locale.',
      );
    }
  }
}
