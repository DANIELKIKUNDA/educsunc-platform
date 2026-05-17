// Ce fichier regroupe les transformations techniques minimales entre domaine et persistence.
export class MappingBulletinsPostgres {
  // Cette methode transforme un agregat ou une entite en objet serialisable.
  public static versObjet(source: object): Record<string, unknown> {
    return { ...source };
  }

  // Cette methode relit un objet brut tel qu'il vient de la persistence.
  public static depuisObjet<TSortie>(source: Record<string, unknown>): TSortie {
    return source as unknown as TSortie;
  }
}
