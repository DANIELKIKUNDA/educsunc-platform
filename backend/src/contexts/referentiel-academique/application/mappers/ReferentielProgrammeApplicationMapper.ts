import { ReferentielProgramme } from '../../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../../domain/aggregates/VersionReferentielProgramme';
import { ReferentielProgrammeSortie } from '../dto/output/ReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from './VersionReferentielProgrammeApplicationMapper';

// Ce mapper transforme l'agregat ReferentielProgramme en DTO de sortie applicatif.
export class ReferentielProgrammeApplicationMapper {
  // Cette methode projette un referentiel programme de domaine vers un contrat de sortie stable.
  public static versSortie(referentielProgramme: ReferentielProgramme): ReferentielProgrammeSortie {
    const versionProjection = this.selectionnerVersionProjection(referentielProgramme);

    return {
      id: referentielProgramme.obtenirId().obtenirValeur(),
      idClasseAcademique: referentielProgramme.obtenirClasseAcademiqueId().obtenirValeur(),
      typeStructureEvaluation: referentielProgramme.obtenirTypeStructureEvaluation(),
      versionProjectionnee: versionProjection === null
        ? null
        : VersionReferentielProgrammeApplicationMapper.versSortie(versionProjection),
      actif: referentielProgramme.estActif(),
      creeLe: referentielProgramme.obtenirCreeLe().toISOString(),
      version: referentielProgramme.obtenirVersion(),
    };
  }

  private static selectionnerVersionProjection(
    referentielProgramme: ReferentielProgramme,
  ): VersionReferentielProgramme | null {
    const versionActive = referentielProgramme.obtenirVersionActive();

    if (versionActive !== null) {
      return versionActive;
    }

    const versions = referentielProgramme.obtenirVersionsReferentielProgramme();

    if (versions.length === 0) {
      return null;
    }

    const versionsTriees = [...versions].sort((premiere, seconde) =>
      seconde.obtenirDatePublication().getTime() - premiere.obtenirDatePublication().getTime());

    return versionsTriees[0] as VersionReferentielProgramme;
  }
}
