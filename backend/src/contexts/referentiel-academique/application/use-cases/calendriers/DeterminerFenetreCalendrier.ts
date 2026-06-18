import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { MoteurFenetreCalendrier } from '../../../domain/services/MoteurFenetreCalendrier';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { DeterminerFenetreCalendrierEntree } from '../../dto/input/DeterminerFenetreCalendrierEntree';
import { FenetreCalendrierSortie } from '../../dto/output/FenetreCalendrierSortie';

export interface SortieDeterminerFenetreCalendrier {
  fenetreCalendrier: FenetreCalendrierSortie | null;
}

// Ce cas d'usage derive la fenetre temporelle exploitable d'un calendrier pour une ecole et une annee.
export class DeterminerFenetreCalendrier
  implements UseCase<DeterminerFenetreCalendrierEntree, SortieDeterminerFenetreCalendrier>
{
  constructor(
    private readonly depotCalendrierAcademique: DepotCalendrierAcademique,
    private readonly moteurFenetreCalendrier = new MoteurFenetreCalendrier(),
  ) {}

  public async executer(
    entree: DeterminerFenetreCalendrierEntree,
  ): Promise<SortieDeterminerFenetreCalendrier> {
    const entreeValidee = this.validerEntree(entree);
    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParEcoleEtAnnee(
      new EcoleId(entreeValidee.idEcole),
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (calendrierAcademique === null) {
      return { fenetreCalendrier: null };
    }

    const periodeCourante = this.moteurFenetreCalendrier.determinerPeriodeCourante(
      calendrierAcademique,
      entreeValidee.dateReference,
    );
    const examenCourant = this.moteurFenetreCalendrier.determinerExamenCourant(
      calendrierAcademique,
      entreeValidee.dateReference,
    );

    return {
      fenetreCalendrier: {
        idCalendrierAcademique: calendrierAcademique.obtenirId().obtenirValeur(),
        idEcole: calendrierAcademique.obtenirEcoleId().obtenirValeur(),
        idAnneeScolaire: calendrierAcademique.obtenirAnneeScolaireId().obtenirValeur(),
        verrouille: calendrierAcademique.estVerrouille(),
        dateReference: entreeValidee.dateReference.toISOString(),
        periodeCourante: periodeCourante === null ? null : {
          id: periodeCourante.obtenirId().obtenirValeur(),
          code: periodeCourante.obtenirCode(),
          libelle: periodeCourante.obtenirLibelle(),
          ordre: periodeCourante.obtenirOrdre(),
          typePeriode: periodeCourante.obtenirTypePeriode(),
          dateDebut: periodeCourante.obtenirDateDebut().toISOString(),
          dateFin: periodeCourante.obtenirDateFin().toISOString(),
        },
        examenCourant: examenCourant === null ? null : {
          id: examenCourant.obtenirId().obtenirValeur(),
          code: examenCourant.obtenirCode(),
          libelle: examenCourant.obtenirLibelle(),
          ordre: examenCourant.obtenirOrdre(),
          typePeriode: examenCourant.obtenirTypePeriode(),
          dateDebut: examenCourant.obtenirDateDebut().toISOString(),
          dateFin: examenCourant.obtenirDateFin().toISOString(),
        },
      },
    };
  }

  private validerEntree(
    entree: DeterminerFenetreCalendrierEntree,
  ): { idEcole: string; idAnneeScolaire: string; dateReference: Date } {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage DeterminerFenetreCalendrier est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      dateReference: this.validerDate(entree.dateReference ?? new Date(), 'dateReference'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurCalendrierInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurCalendrierInvalide(`Le champ "${nomChamp}" doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }
}
