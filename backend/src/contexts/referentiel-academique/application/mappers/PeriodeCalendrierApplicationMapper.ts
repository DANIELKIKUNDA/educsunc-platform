import { PeriodeCalendrier } from '../../domain/entities/PeriodeCalendrier';
import { PeriodeCalendrierSortie } from '../dto/output/PeriodeCalendrierSortie';

// Ce mapper transforme une periode de calendrier de domaine en DTO de sortie applicatif.
export class PeriodeCalendrierApplicationMapper {
  // Cette methode projette une periode de calendrier vers un contrat de sortie stable.
  public static versSortie(periodeCalendrier: PeriodeCalendrier): PeriodeCalendrierSortie {
    return {
      id: periodeCalendrier.obtenirId().obtenirValeur(),
      code: periodeCalendrier.obtenirCode(),
      libelle: periodeCalendrier.obtenirLibelle(),
      ordre: periodeCalendrier.obtenirOrdre(),
      typePeriode: periodeCalendrier.obtenirTypePeriode(),
      dateDebut: periodeCalendrier.obtenirDateDebut().toISOString(),
      dateFin: periodeCalendrier.obtenirDateFin().toISOString(),
    };
  }
}
