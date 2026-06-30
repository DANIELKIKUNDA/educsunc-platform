import type {
  ClasseAcademiqueItem,
  OptionEtudeItem,
  ReferentielProgrammeItem,
  SectionScolaireItem,
} from '../models/academique.model';

function compareStrings(left: string, right: string): number {
  return left.localeCompare(right, 'fr');
}

export function mapperSectionsScolaires(items: SectionScolaireItem[]): SectionScolaireItem[] {
  return items
    .slice()
    .sort((left, right) => left.ordreAffichage - right.ordreAffichage || compareStrings(left.libelle, right.libelle));
}

export function mapperClassesAcademiques(items: ClasseAcademiqueItem[]): ClasseAcademiqueItem[] {
  return items
    .slice()
    .sort((left, right) => left.ordrePedagogique - right.ordrePedagogique || compareStrings(left.libelle, right.libelle));
}

export function mapperOptionsEtudes(items: OptionEtudeItem[]): OptionEtudeItem[] {
  return items
    .slice()
    .sort((left, right) => (left.ordreAffichage ?? 999) - (right.ordreAffichage ?? 999) || compareStrings(left.libelle, right.libelle));
}

export function mapperReferentielsProgrammes(items: ReferentielProgrammeItem[]): ReferentielProgrammeItem[] {
  return items
    .slice()
    .sort((left, right) => compareStrings(left.idClasseAcademique, right.idClasseAcademique) || compareStrings(left.id, right.id));
}
