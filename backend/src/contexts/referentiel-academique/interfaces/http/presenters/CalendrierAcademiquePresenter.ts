import { CalendrierAcademiqueSortie } from '../../../application/dto/output/CalendrierAcademiqueSortie';
import { PeriodeCalendrierSortie } from '../../../application/dto/output/PeriodeCalendrierSortie';

// Cette interface represente la reponse HTTP de detail d'un calendrier academique.
export interface ReponseCalendrierAcademiqueHttp {
  donnee: CalendrierAcademiqueSortie;
}

// Ce presenter transforme les sorties applicatives des calendriers academiques en reponses HTTP coherentes.
export class CalendrierAcademiquePresenter {
  // Cette methode presente le detail HTTP d'un calendrier academique.
  public static presenterCalendrierAcademique(
    calendrierAcademique: CalendrierAcademiqueSortie,
  ): ReponseCalendrierAcademiqueHttp {
    return {
      donnee: this.copierCalendrierAcademique(calendrierAcademique),
    };
  }

  // Cette methode produit une copie stable d'un calendrier academique pour la reponse HTTP.
  private static copierCalendrierAcademique(
    calendrierAcademique: CalendrierAcademiqueSortie,
  ): CalendrierAcademiqueSortie {
    return {
      ...calendrierAcademique,
      periodes: calendrierAcademique.periodes.map((periode) =>
        this.copierPeriodeCalendrier(periode)
      ),
    };
  }

  // Cette methode produit une copie stable d'une periode de calendrier.
  private static copierPeriodeCalendrier(
    periodeCalendrier: PeriodeCalendrierSortie,
  ): PeriodeCalendrierSortie {
    return {
      ...periodeCalendrier,
    };
  }
}
