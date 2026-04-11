// Cet enum represente la nature metier d'une difference detectee entre deux versions de referentiel.
export enum TypeDiffReferentiel {
  PONDERATION_MODIFIEE = 'PONDERATION_MODIFIEE',
  ORDRE_MODIFIE = 'ORDRE_MODIFIE',
  COURS_AJOUTE = 'COURS_AJOUTE',
  COURS_RETIRE = 'COURS_RETIRE',
  COURS_DEVENU_NON_CALCULABLE = 'COURS_DEVENU_NON_CALCULABLE',
}
