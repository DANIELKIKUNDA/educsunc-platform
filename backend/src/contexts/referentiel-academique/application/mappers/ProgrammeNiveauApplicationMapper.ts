import { ProgrammeNiveau } from '../../domain/aggregates/ProgrammeNiveau';
import { ProgrammeNiveauSortie } from '../dto/output/ProgrammeNiveauSortie';
import { LigneProgrammeNiveauApplicationMapper } from './LigneProgrammeNiveauApplicationMapper';

// Ce mapper transforme l'agregat ProgrammeNiveau en DTO de sortie applicatif.
export class ProgrammeNiveauApplicationMapper {
  // Cette methode projette un programme niveau de domaine vers un contrat de sortie stable.
  public static versSortie(programmeNiveau: ProgrammeNiveau): ProgrammeNiveauSortie {
    return {
      id: programmeNiveau.obtenirId().obtenirValeur(),
      idEcole: programmeNiveau.obtenirEcoleId().obtenirValeur(),
      idAnneeScolaire: programmeNiveau.obtenirAnneeScolaireId().obtenirValeur(),
      idClasseAcademique: programmeNiveau.obtenirClasseAcademiqueId().obtenirValeur(),
      idReferentielProgramme: programmeNiveau.obtenirReferentielProgrammeId().obtenirValeur(),
      idVersionReferentielProgramme: programmeNiveau.obtenirVersionReferentielProgrammeId().obtenirValeur(),
      statut: programmeNiveau.obtenirStatut(),
      creeLe: programmeNiveau.obtenirCreeLe().toISOString(),
      version: programmeNiveau.obtenirVersion(),
      lignes: programmeNiveau.obtenirLignes().map((ligne) => (
        LigneProgrammeNiveauApplicationMapper.versSortie(ligne)
      )),
      creePar: programmeNiveau.obtenirCreePar(),
      valideLe: programmeNiveau.obtenirValideLe()?.toISOString(),
      validePar: programmeNiveau.obtenirValidePar(),
      archiveLe: programmeNiveau.obtenirArchiveLe()?.toISOString(),
    };
  }
}
