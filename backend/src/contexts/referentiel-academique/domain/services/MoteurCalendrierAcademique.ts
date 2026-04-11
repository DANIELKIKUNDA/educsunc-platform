import { CalendrierAcademique } from '../aggregates/CalendrierAcademique';
import { PeriodeCalendrier } from '../entities/PeriodeCalendrier';
import { ErreurCalendrierInvalide } from '../exceptions/ErreurCalendrierInvalide';
import { ErreurChevauchement } from '../exceptions/ErreurChevauchement';
import { ErreurModificationCalendrierVerrouille } from '../exceptions/ErreurModificationCalendrierVerrouille';
import { TypePeriodeCalendrier } from '../value-objects/TypePeriodeCalendrier';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Ce rapport expose une synthese metier apres validation du calendrier.
export interface RapportCalendrierAcademique {
  nombrePeriodes: number;
  nombrePeriodesPedagogiques: number;
  nombreExamens: number;
  structure: TypeStructureEvaluation;
  verrouille: boolean;
}

// Ce moteur gere la coherence temporelle et structurelle d'un calendrier academique.
export class MoteurCalendrierAcademique {
  // Cette methode valide un calendrier complet et retourne un rapport synthese.
  public validerCalendrier(calendrier: CalendrierAcademique): RapportCalendrierAcademique {
    const periodes = calendrier.obtenirPeriodes();

    this.verifierOrdreDesPeriodes(periodes);
    this.verifierAbsenceChevauchement(periodes);
    this.verifierCompatibiliteAvecType(
      periodes,
      calendrier.obtenirTypeStructureEvaluation(),
    );
    calendrier.validerCalendrier();

    return this.construireRapport(calendrier);
  }

  // Cette methode verifie que l'ordre legal des periodes reste strict.
  public verifierOrdreDesPeriodes(periodes: readonly PeriodeCalendrier[]): void {
    const periodesTriees = [...periodes].sort(
      (premiere, seconde) => premiere.obtenirOrdre() - seconde.obtenirOrdre(),
    );

    for (let index = 1; index < periodesTriees.length; index += 1) {
      const precedente = periodesTriees[index - 1];
      const courante = periodesTriees[index];

      if (courante.obtenirOrdre() <= precedente.obtenirOrdre()) {
        throw new ErreurCalendrierInvalide(
          "L'ordre des periodes du calendrier doit rester strictement croissant.",
        );
      }

      if (
        courante.obtenirDateDebut().getTime() < precedente.obtenirDateDebut().getTime()
      ) {
        throw new ErreurCalendrierInvalide(
          "L'ordre des periodes doit rester coherent avec la chronologie du calendrier.",
        );
      }
    }
  }

  // Cette methode interdit tout chevauchement entre periodes d'un meme calendrier.
  public verifierAbsenceChevauchement(periodes: readonly PeriodeCalendrier[]): void {
    for (let index = 0; index < periodes.length; index += 1) {
      for (let indexSuivant = index + 1; indexSuivant < periodes.length; indexSuivant += 1) {
        if (periodes[index].seChevaucheAvec(periodes[indexSuivant])) {
          throw new ErreurChevauchement(
            'Deux periodes de calendrier ne peuvent pas se chevaucher.',
          );
        }
      }
    }
  }

  // Cette methode verifie la compatibilite des periodes avec la structure academique.
  public verifierCompatibiliteAvecType(
    periodes: readonly PeriodeCalendrier[],
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    const codes = periodes.map((periode) => periode.obtenirCode().toUpperCase());
    const nombrePeriodesPedagogiques = periodes.filter(
      (periode) => periode.obtenirTypePeriode() === TypePeriodeCalendrier.PERIODE,
    ).length;

    if (typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL) {
      if (codes.includes('P5') || codes.includes('P6') || codes.includes('EX3')) {
        throw new ErreurCalendrierInvalide(
          'Une structure semestrielle ne peut contenir ni P5, ni P6, ni EX3.',
        );
      }

      if (nombrePeriodesPedagogiques > 4) {
        throw new ErreurCalendrierInvalide(
          'Une structure semestrielle ne peut pas depasser quatre periodes pedagogiques.',
        );
      }
    }
  }

  // Cette methode modifie les bornes du calendrier en respectant son verrouillage.
  public modifierDates(
    calendrier: CalendrierAcademique,
    dateDebutAnnee: Date,
    dateFinAnnee: Date,
    periodes?: readonly PeriodeCalendrier[],
    modifiePar?: string,
  ): RapportCalendrierAcademique {
    if (calendrier.estVerrouille()) {
      throw new ErreurModificationCalendrierVerrouille(
        'Un calendrier verrouille ne peut plus etre modifie librement.',
      );
    }

    calendrier.modifierDates(
      dateDebutAnnee,
      dateFinAnnee,
      periodes === undefined ? undefined : [...periodes],
      modifiePar,
    );

    return this.validerCalendrier(calendrier);
  }

  // Cette methode verrouille un calendrier apres une validation complete.
  public verrouillerCalendrier(
    calendrier: CalendrierAcademique,
    modifiePar?: string,
  ): RapportCalendrierAcademique {
    this.validerCalendrier(calendrier);
    calendrier.verrouillerCalendrier(modifiePar);

    return this.construireRapport(calendrier);
  }

  private construireRapport(calendrier: CalendrierAcademique): RapportCalendrierAcademique {
    const periodes = calendrier.obtenirPeriodes();

    return {
      nombrePeriodes: periodes.length,
      nombrePeriodesPedagogiques: periodes.filter(
        (periode) => periode.obtenirTypePeriode() === TypePeriodeCalendrier.PERIODE,
      ).length,
      nombreExamens: periodes.filter(
        (periode) => periode.obtenirTypePeriode() === TypePeriodeCalendrier.EXAMEN,
      ).length,
      structure: calendrier.obtenirTypeStructureEvaluation(),
      verrouille: calendrier.estVerrouille(),
    };
  }
}
