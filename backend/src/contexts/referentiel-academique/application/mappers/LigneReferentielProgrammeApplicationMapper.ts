import { LigneReferentielProgramme } from '../../domain/entities/LigneReferentielProgramme';
import { LigneReferentielProgrammeSortie } from '../dto/output/LigneReferentielProgrammeSortie';

// Ce mapper transforme l'entite LigneReferentielProgramme en DTO de sortie applicatif.
export class LigneReferentielProgrammeApplicationMapper {
  // Cette methode projette une ligne de programme de domaine vers un contrat de sortie stable.
  public static versSortie(
    ligneReferentielProgramme: LigneReferentielProgramme,
  ): LigneReferentielProgrammeSortie {
    return {
      id: ligneReferentielProgramme.obtenirId().obtenirValeur(),
      idReferentielCours: ligneReferentielProgramme.obtenirReferentielCoursId().obtenirValeur(),
      ordreAffichage: ligneReferentielProgramme.obtenirOrdreAffichage(),
      obligatoire: ligneReferentielProgramme.estObligatoire(),
      aExamen: ligneReferentielProgramme.aExamenAssocie(),
      estCalculable: ligneReferentielProgramme.estCalculableDansProgramme(),
      sourceLigne: ligneReferentielProgramme.obtenirSourceLigne(),
      ponderation: ligneReferentielProgramme.obtenirPonderation().obtenirValeurs(),
    };
  }
}
