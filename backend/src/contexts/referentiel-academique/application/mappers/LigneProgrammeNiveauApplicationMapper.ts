import { LigneProgrammeNiveau } from '../../domain/entities/LigneProgrammeNiveau';
import { LigneProgrammeNiveauSortie } from '../dto/output/LigneProgrammeNiveauSortie';

// Ce mapper transforme l'entite LigneProgrammeNiveau en DTO de sortie applicatif.
export class LigneProgrammeNiveauApplicationMapper {
  // Cette methode projette une ligne locale de programme vers un contrat de sortie stable.
  public static versSortie(ligneProgrammeNiveau: LigneProgrammeNiveau): LigneProgrammeNiveauSortie {
    return {
      id: ligneProgrammeNiveau.obtenirId().obtenirValeur(),
      idReferentielCours: ligneProgrammeNiveau.obtenirReferentielCoursId().obtenirValeur(),
      ordreAffichage: ligneProgrammeNiveau.obtenirOrdreAffichage(),
      obligatoire: ligneProgrammeNiveau.estObligatoire(),
      aExamen: ligneProgrammeNiveau.aExamenAssocie(),
      estActifDansEcole: ligneProgrammeNiveau.estActiveDansEcole(),
      estCalculable: ligneProgrammeNiveau.estCalculableDansProgramme(),
      obsolete: ligneProgrammeNiveau.estObsolete(),
      sourceLigne: ligneProgrammeNiveau.obtenirSourceLigne(),
      ponderation: ligneProgrammeNiveau.obtenirPonderation().obtenirValeurs(),
    };
  }
}
