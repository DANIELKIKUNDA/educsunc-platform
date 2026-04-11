import { CalendrierAcademique } from '../aggregates/CalendrierAcademique';
import { ErreurCalendrierInvalide } from '../exceptions/ErreurCalendrierInvalide';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { EcoleId } from '../value-objects/EcoleId';

// Cette policy porte les regles globales d'unicite et de coherence des calendriers academiques.
export class PolicyCalendrier {
  // Cette methode impose la coherence temporelle complete d'un calendrier academique.
  public verifierCoherenceTemporelleObligatoire(
    calendrierAcademique: CalendrierAcademique,
  ): void {
    calendrierAcademique.validerCalendrier();
  }

  // Cette methode verifie qu'une ecole ne porte qu'un seul calendrier par annee scolaire.
  public verifierCalendrierUnique(
    calendriersAcademiques: readonly CalendrierAcademique[],
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
  ): void {
    const totalCalendriers = calendriersAcademiques.filter(
      (calendrierAcademique) =>
        calendrierAcademique.obtenirEcoleId().estEgal(ecoleId)
        && calendrierAcademique.obtenirAnneeScolaireId().estEgal(anneeScolaireId),
    ).length;

    if (totalCalendriers > 1) {
      throw new ErreurCalendrierInvalide(
        'Un seul calendrier academique est autorise par ecole et par annee scolaire.',
      );
    }
  }
}
