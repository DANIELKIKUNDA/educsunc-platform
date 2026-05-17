// Ce fichier porte les types de differences detectables entre deux versions de referentiel pour les bulletins.
export enum TypeDiffBulletin {
  PONDERATION_MODIFIEE = 'PONDERATION_MODIFIEE',
  ORDRE_MODIFIE = 'ORDRE_MODIFIE',
  COURS_AJOUTE = 'COURS_AJOUTE',
  COURS_RETIRE = 'COURS_RETIRE',
  COURS_DEVENU_NON_CALCULABLE = 'COURS_DEVENU_NON_CALCULABLE',
  COURS_DEVENU_SANS_EXAMEN = 'COURS_DEVENU_SANS_EXAMEN',
}
