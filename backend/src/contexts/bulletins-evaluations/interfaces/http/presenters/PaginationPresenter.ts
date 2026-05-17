// Ce presenter applique une pagination HTTP standard sur une collection.
export class PaginationPresenter {
  // Cette methode produit la structure paginee avec metadonnees de navigation.
  public static presenter<TElement>(
    elements: TElement[],
    page = 1,
    limit = elements.length || 1,
    total = elements.length,
  ): {
    donnee: TElement[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  } {
    const totalPages = limit <= 0 ? 1 : Math.max(1, Math.ceil(total / limit));

    return {
      donnee: elements,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
