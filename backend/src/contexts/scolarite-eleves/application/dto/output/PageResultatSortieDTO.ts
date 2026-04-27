// Ce fichier definit une page de resultat applicative generique.
export interface PageResultatSortieDTO<TElement> {
  donnees: TElement[];
  total: number;
  page: number;
  taillePage: number;
}
