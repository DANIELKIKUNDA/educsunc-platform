import { CalendrierAcademique } from '../../domain/aggregates/CalendrierAcademique';
import { CalendrierAcademiqueSortie } from '../dto/output/CalendrierAcademiqueSortie';
import { PeriodeCalendrierApplicationMapper } from './PeriodeCalendrierApplicationMapper';

// Ce mapper transforme l'agregat CalendrierAcademique en DTO de sortie applicatif.
export class CalendrierAcademiqueApplicationMapper {
  // Cette methode projette un calendrier academique de domaine vers un contrat de sortie stable.
  public static versSortie(calendrierAcademique: CalendrierAcademique): CalendrierAcademiqueSortie {
    return {
      id: calendrierAcademique.obtenirId().obtenirValeur(),
      idEcole: calendrierAcademique.obtenirEcoleId().obtenirValeur(),
      idAnneeScolaire: calendrierAcademique.obtenirAnneeScolaireId().obtenirValeur(),
      typeStructureEvaluation: calendrierAcademique.obtenirTypeStructureEvaluation(),
      dateDebutAnnee: calendrierAcademique.obtenirDateDebutAnnee().toISOString(),
      dateFinAnnee: calendrierAcademique.obtenirDateFinAnnee().toISOString(),
      creeLe: calendrierAcademique.obtenirCreeLe().toISOString(),
      creePar: calendrierAcademique.obtenirCreePar(),
      modifieLe: calendrierAcademique.obtenirModifieLe()?.toISOString(),
      modifiePar: calendrierAcademique.obtenirModifiePar(),
      version: calendrierAcademique.obtenirVersion(),
      verrouille: calendrierAcademique.estVerrouille(),
      periodes: calendrierAcademique.obtenirPeriodes().map((periodeCalendrier) =>
        PeriodeCalendrierApplicationMapper.versSortie(periodeCalendrier)
      ),
    };
  }
}
