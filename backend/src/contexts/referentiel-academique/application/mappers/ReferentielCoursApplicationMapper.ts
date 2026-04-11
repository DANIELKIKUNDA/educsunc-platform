import { ReferentielCours } from '../../domain/aggregates/ReferentielCours';
import { ReferentielCoursSortie } from '../dto/output/ReferentielCoursSortie';

// Ce mapper transforme l'agregat ReferentielCours en DTO de sortie applicatif.
export class ReferentielCoursApplicationMapper {
  // Cette methode projette un cours officiel de domaine vers un contrat de sortie stable.
  public static versSortie(referentielCours: ReferentielCours): ReferentielCoursSortie {
    return {
      id: referentielCours.obtenirId().obtenirValeur(),
      code: referentielCours.obtenirCode(),
      libelle: referentielCours.obtenirLibelle(),
      actif: referentielCours.estActif(),
      creeLe: referentielCours.obtenirCreeLe().toISOString(),
      version: referentielCours.obtenirVersion(),
      abreviation: referentielCours.obtenirAbreviation(),
      domaine: referentielCours.obtenirDomaine(),
      sousDomaine: referentielCours.obtenirSousDomaine(),
      modifieLe: referentielCours.obtenirModifieLe()?.toISOString(),
    };
  }
}
