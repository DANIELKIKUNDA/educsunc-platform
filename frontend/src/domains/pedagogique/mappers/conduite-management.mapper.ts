import type {
  ConduiteClasseApiData,
  ConduiteClasseFilters,
  ConduiteClasseLineViewModel,
  ConduiteClasseViewModel,
} from '../models/conduite-management.model';

function actorScopeMessage(actorCode: string): string {
  switch (actorCode) {
    case 'TITULAIRE':
      return 'Encodage borne a la classe titulaire et a la bonne annee scolaire.';
    case 'DIRECTEUR_DISCIPLINE':
      return 'Encodage borne a la meme ecole et a la meme section secondaire autorisee.';
    default:
      return 'Aucun perimetre officiel d encodage de conduite n est ouvert pour cet acteur.';
  }
}

export function mapConduiteClasseViewModel(
  data: ConduiteClasseApiData,
  filters: ConduiteClasseFilters,
  actorCode: string,
): ConduiteClasseViewModel {
  const classe = filters.classeLabel?.trim() || `Classe ${filters.idClassePedagogique}`;
  const section = filters.sectionLabel?.trim() || 'Section active';
  const annee = filters.anneeScolaireLabel?.trim() || filters.idAnneeScolaire;

  const lignes: ConduiteClasseLineViewModel[] = data.lignes.map((line) => ({
    idResultatBulletinEleve: line.idResultatBulletinEleve,
    idEleve: line.idEleve,
    nomComplet: line.nomComplet,
    sexe: line.sexe ?? '-',
    periodes: line.applications.map((bloc) => ({
      codePeriode: bloc.codePeriode,
      application: bloc.application ?? 'Non exposee',
      conduite: bloc.conduite ?? 'Non exposee',
      pointsConduite: bloc.pointsConduite === undefined ? 'Non saisi' : `${bloc.pointsConduite}`,
      pointsConduiteValue: bloc.pointsConduite ?? null,
    })),
    conduitesEncodees: line.applications.filter((bloc) => bloc.pointsConduite !== undefined).length,
  }));

  const totalConduitesEncodees = lignes.reduce((sum, line) => sum + line.conduitesEncodees, 0);
  const totalBlocs = lignes.reduce((sum, line) => sum + line.periodes.length, 0);

  return {
    scopeLabel: `${classe} | ${section} | ${annee}`,
    actorScopeMessage: actorScopeMessage(actorCode),
    lignes,
    totalEleves: lignes.length,
    totalConduitesEncodees,
    totalConduitesRestantes: Math.max(totalBlocs - totalConduitesEncodees, 0),
  };
}
