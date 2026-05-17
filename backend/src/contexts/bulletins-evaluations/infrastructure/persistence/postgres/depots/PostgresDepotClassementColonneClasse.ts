import { ClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ClassementColonneClasse';
import type { DepotClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotClassementColonneClasse';

// Ce fichier fournit un depot PostgreSQL simplifie pour les classements de classe.
export class PostgresDepotClassementColonneClasse implements DepotClassementColonneClasse {
  private static readonly stockage = new Map<string, ClassementColonneClasse>();

  public async sauvegarder(classementColonneClasse: ClassementColonneClasse): Promise<void> {
    PostgresDepotClassementColonneClasse.stockage.set(classementColonneClasse.obtenirId(), classementColonneClasse);
  }

  public async trouverParClasseEtColonne(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<ClassementColonneClasse | null> {
    return [...PostgresDepotClassementColonneClasse.stockage.values()].find((classement) =>
      classement.obtenirIdClassePedagogique() === idClassePedagogique
      && String(Reflect.get(classement, 'codeColonne') ?? '') === codeColonne
      && String(Reflect.get(classement, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<ClassementColonneClasse[]> {
    return [...PostgresDepotClassementColonneClasse.stockage.values()].filter((classement) =>
      classement.obtenirIdClassePedagogique() === idClassePedagogique
      && String(Reflect.get(classement, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }

  public async supprimerLogiquementAncienClassement(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<void> {
    const classement = await this.trouverParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    if (classement !== null) {
      PostgresDepotClassementColonneClasse.stockage.delete(classement.obtenirId());
    }
  }
}
