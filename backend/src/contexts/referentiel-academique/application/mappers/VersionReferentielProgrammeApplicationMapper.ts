import { VersionReferentielProgramme } from '../../domain/aggregates/VersionReferentielProgramme';
import { VersionReferentielProgrammeSortie } from '../dto/output/VersionReferentielProgrammeSortie';
import { LigneReferentielProgrammeApplicationMapper } from './LigneReferentielProgrammeApplicationMapper';

// Ce mapper transforme l'agregat VersionReferentielProgramme en DTO de sortie applicatif.
export class VersionReferentielProgrammeApplicationMapper {
  // Cette methode projette une version de referentiel de domaine vers un contrat de sortie stable.
  public static versSortie(
    versionReferentielProgramme: VersionReferentielProgramme,
  ): VersionReferentielProgrammeSortie {
    return {
      id: versionReferentielProgramme.obtenirId().obtenirValeur(),
      codeVersion: versionReferentielProgramme.obtenirCodeVersion(),
      anneeReference: versionReferentielProgramme.obtenirAnneeReference(),
      datePublication: versionReferentielProgramme.obtenirDatePublication().toISOString(),
      active: versionReferentielProgramme.estActive(),
      publiee: versionReferentielProgramme.estPubliee(),
      sourceImport: versionReferentielProgramme.obtenirSourceImport(),
      creeLe: versionReferentielProgramme.obtenirCreeLe().toISOString(),
      motifPublication: versionReferentielProgramme.obtenirMotifPublication(),
      lignes: versionReferentielProgramme.obtenirLignes().map((ligne) => (
        LigneReferentielProgrammeApplicationMapper.versSortie(ligne)
      )),
    };
  }
}
