// Ce fichier porte toutes les colonnes officielles supportees par les bulletins.
export enum CodeColonneBulletin {
  P1 = 'P1',
  P2 = 'P2',
  EX1 = 'EX1',
  TOTAL_S1 = 'TOTAL_S1',
  P3 = 'P3',
  P4 = 'P4',
  EX2 = 'EX2',
  TOTAL_S2 = 'TOTAL_S2',
  TOTAL_GENERAL = 'TOTAL_GENERAL',
  TOTAL_T1 = 'TOTAL_T1',
  TOTAL_T2 = 'TOTAL_T2',
  P5 = 'P5',
  P6 = 'P6',
  EX3 = 'EX3',
  TOTAL_T3 = 'TOTAL_T3',
}

// Cette fonction indique si la colonne represente un total calcule automatiquement.
export function estColonneTotalBulletin(codeColonne: CodeColonneBulletin): boolean {
  return [
    CodeColonneBulletin.TOTAL_S1,
    CodeColonneBulletin.TOTAL_S2,
    CodeColonneBulletin.TOTAL_T1,
    CodeColonneBulletin.TOTAL_T2,
    CodeColonneBulletin.TOTAL_T3,
    CodeColonneBulletin.TOTAL_GENERAL,
  ].includes(codeColonne);
}

// Cette fonction indique si la colonne represente un examen.
export function estColonneExamenBulletin(codeColonne: CodeColonneBulletin): boolean {
  return [
    CodeColonneBulletin.EX1,
    CodeColonneBulletin.EX2,
    CodeColonneBulletin.EX3,
  ].includes(codeColonne);
}
