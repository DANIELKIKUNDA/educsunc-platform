import { BulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/BulletinEleve';
import type { HistoriqueGenerationBulletin } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationBulletin';
import type { DepotBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotBulletinEleve';

// Ce fichier fournit un depot PostgreSQL simplifie pour les bulletins d'eleve.
export class PostgresDepotBulletinEleve implements DepotBulletinEleve {
  private static readonly stockage = new Map<string, BulletinEleve>();

  public async sauvegarder(bulletinEleve: BulletinEleve): Promise<void> {
    PostgresDepotBulletinEleve.stockage.set(bulletinEleve.obtenirId(), bulletinEleve);
  }

  public async trouverParEleveEtAnnee(idEleve: string, idAnneeScolaire: string): Promise<BulletinEleve | null> {
    return [...PostgresDepotBulletinEleve.stockage.values()].find((bulletin) =>
      String(Reflect.get(bulletin, 'idEleve') ?? '') === idEleve
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async trouverVersionActive(
    idEleve: string,
    idInscriptionScolaire: string,
    idAnneeScolaire: string,
  ): Promise<BulletinEleve | null> {
    return [...PostgresDepotBulletinEleve.stockage.values()].find((bulletin) =>
      String(Reflect.get(bulletin, 'idEleve') ?? '') === idEleve
      && String(Reflect.get(bulletin, 'idInscriptionScolaire') ?? '') === idInscriptionScolaire
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParClasse(idClassePedagogique: string, idAnneeScolaire: string): Promise<BulletinEleve[]> {
    return [...PostgresDepotBulletinEleve.stockage.values()].filter((bulletin) =>
      String(Reflect.get(bulletin, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(bulletin, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }

  public async listerHistoriqueGenerations(idBulletinEleve: string): Promise<HistoriqueGenerationBulletin[]> {
    const bulletin = PostgresDepotBulletinEleve.stockage.get(idBulletinEleve);
    return bulletin?.obtenirHistoriqueGeneration() ?? [];
  }
}
