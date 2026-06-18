import type { BulletinsController } from './BulletinsController';
import type { ProclamationsController } from './ProclamationsController';
import type { SyntheseResultatsController } from './SyntheseResultatsController';

// Ce controleur expose les endpoints HTTP d'export du BC.
export class ExportsBulletinController {
  // Ce constructeur injecte les controleurs metiers deja disponibles pour produire les exports.
  constructor(
    private readonly bulletinsController: BulletinsController,
    private readonly proclamationsController: ProclamationsController,
    private readonly syntheseResultatsController: SyntheseResultatsController,
  ) {}

  // Cette methode exporte les bulletins.
  public async exporterBulletins(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    return this.bulletinsController.telechargerPdf(query, headers);
  }

  // Cette methode exporte les proclamations.
  public async exporterProclamations(query: unknown): Promise<{ donnee: unknown }> {
    return this.proclamationsController.telechargerPdf(query);
  }

  // Cette methode exporte les statistiques en reutilisant le document PDF de synthese pedagogique.
  public async exporterStatistiques(query: { idEcole: string; idAnneeScolaire: string; codeColonne: string }): Promise<{ donnee: unknown }> {
    return this.syntheseResultatsController.telechargerPdf(query);
  }
}
