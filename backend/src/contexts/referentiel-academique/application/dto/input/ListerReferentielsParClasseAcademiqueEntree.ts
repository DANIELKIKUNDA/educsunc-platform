// Ce DTO represente les donnees attendues pour lister les referentiels programmes d'une classe academique.
export interface ListerReferentielsParClasseAcademiqueEntree {
  idClasseAcademique: string;
  page: number;
  taillePage: number;
}
