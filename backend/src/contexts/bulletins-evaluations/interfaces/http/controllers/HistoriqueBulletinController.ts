import type { ConsulterHistoriqueBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterHistoriqueBulletin/ConsulterHistoriqueBulletinUseCase';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP d'historique et d'archives du BC.
export class HistoriqueBulletinController {
  // Ce constructeur injecte le cas d'usage de consultation d'historique deja disponible.
  constructor(private readonly consulterHistoriqueBulletinUseCase: ConsulterHistoriqueBulletinUseCase) {}

  // Cette methode consulte l'historique d'un bulletin.
  public async consulterHistoriqueBulletins(params: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const sortie = await this.consulterHistoriqueBulletinUseCase.executer(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idBulletinEleve'),
    );
    return { donnee: sortie };
  }

  // Cette methode expose l'historique des proclamations quand il sera branche.
  public async consulterHistoriqueProclamations(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }

  // Cette methode expose les snapshots disponibles quand ils seront branches.
  public async consulterSnapshots(): Promise<{ donnee: unknown[] }> {
    return { donnee: [] };
  }
}
