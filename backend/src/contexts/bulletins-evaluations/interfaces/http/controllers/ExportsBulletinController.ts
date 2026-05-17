import type { BulletinsController } from './BulletinsController';
import type { ProclamationsController } from './ProclamationsController';
import type { StatistiquesBulletinController } from './StatistiquesBulletinController';

// Ce controleur expose les endpoints HTTP d'export du BC.
export class ExportsBulletinController {
  // Ce constructeur injecte les controleurs metiers deja disponibles pour produire les exports.
  constructor(
    private readonly bulletinsController: BulletinsController,
    private readonly proclamationsController: ProclamationsController,
    private readonly statistiquesController: StatistiquesBulletinController,
  ) {}

  // Cette methode exporte les bulletins.
  public async exporterBulletins(query: unknown): Promise<{ donnee: unknown }> {
    return this.bulletinsController.telechargerPdf(query);
  }

  // Cette methode exporte les proclamations.
  public async exporterProclamations(query: unknown): Promise<{ donnee: unknown }> {
    return this.proclamationsController.telechargerPdf(query);
  }

  // Cette methode exporte les statistiques.
  public async exporterStatistiques(query: { idEcole: string; idAnneeScolaire: string; codeColonne: string }): Promise<{ donnee: unknown }> {
    return this.statistiquesController.consulterEcole(query);
  }
}
