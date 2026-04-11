// Regroupe les contrats de pagination applicative.
export interface Pagination {
  page: number;
  taillePage: number;
}

export interface ResultatPagine<TElement> {
  donnees: TElement[];
  total: number;
  page: number;
  taillePage: number;
}
