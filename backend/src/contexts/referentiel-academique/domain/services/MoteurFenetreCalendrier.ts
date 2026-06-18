import { CalendrierAcademique } from '../aggregates/CalendrierAcademique';
import { PeriodeCalendrier } from '../entities/PeriodeCalendrier';
import { TypePeriodeCalendrier } from '../value-objects/TypePeriodeCalendrier';

// Ce service domaine derive la fenetre temporelle exploitable d'un calendrier academique.
export class MoteurFenetreCalendrier {
  // Cette methode retrouve la periode pedagogique courante a une date donnee.
  public determinerPeriodeCourante(
    calendrierAcademique: CalendrierAcademique,
    dateReference: Date,
  ): PeriodeCalendrier | null {
    return this.trouverPeriodeCouranteParType(
      calendrierAcademique,
      dateReference,
      TypePeriodeCalendrier.PERIODE,
    );
  }

  // Cette methode retrouve l'examen courant a une date donnee.
  public determinerExamenCourant(
    calendrierAcademique: CalendrierAcademique,
    dateReference: Date,
  ): PeriodeCalendrier | null {
    return this.trouverPeriodeCouranteParType(
      calendrierAcademique,
      dateReference,
      TypePeriodeCalendrier.EXAMEN,
    );
  }

  private trouverPeriodeCouranteParType(
    calendrierAcademique: CalendrierAcademique,
    dateReference: Date,
    typePeriode: TypePeriodeCalendrier,
  ): PeriodeCalendrier | null {
    return calendrierAcademique
      .obtenirPeriodes()
      .find((periode) =>
        periode.obtenirTypePeriode() === typePeriode && periode.contientDate(dateReference)
      ) ?? null;
  }
}
