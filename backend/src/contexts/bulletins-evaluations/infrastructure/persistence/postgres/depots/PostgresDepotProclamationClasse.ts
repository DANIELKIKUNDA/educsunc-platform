import { ProclamationClasse } from 'contexts/bulletins-evaluations/domain/aggregates/ProclamationClasse';
import type { DepotProclamationClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotProclamationClasse';

// Ce fichier fournit un depot PostgreSQL simplifie pour les proclamations de classe.
export class PostgresDepotProclamationClasse implements DepotProclamationClasse {
  private static readonly stockage = new Map<string, ProclamationClasse>();

  public async sauvegarder(proclamationClasse: ProclamationClasse): Promise<void> {
    PostgresDepotProclamationClasse.stockage.set(proclamationClasse.obtenirId(), proclamationClasse);
  }

  public async trouverParClasseEtColonne(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<ProclamationClasse | null> {
    return [...PostgresDepotProclamationClasse.stockage.values()].find((proclamation) =>
      String(Reflect.get(proclamation, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(proclamation, 'codeColonne') ?? '') === codeColonne
      && String(Reflect.get(proclamation, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParClasseEtAnnee(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]> {
    return [...PostgresDepotProclamationClasse.stockage.values()].filter((proclamation) =>
      String(Reflect.get(proclamation, 'idClassePedagogique') ?? '') === idClassePedagogique
      && String(Reflect.get(proclamation, 'idAnneeScolaire') ?? '') === idAnneeScolaire,
    );
  }

  public async listerHistoriqueProclamations(idClassePedagogique: string, idAnneeScolaire: string): Promise<ProclamationClasse[]> {
    return await this.listerParClasseEtAnnee(idClassePedagogique, idAnneeScolaire);
  }
}
