import { HealthPresenter } from '../presenters/HealthPresenter';

// Ce controleur expose des endpoints de sante et de supervision legere du BC.
export class HealthBulletinController {
  // Cette methode retourne l'etat general du BC.
  public async consulterSante(): Promise<{ donnee: Record<string, unknown> }> {
    return HealthPresenter.presenter({
      bc: 'bulletins-evaluations',
      statut: 'OK',
    });
  }

  // Cette methode retourne l'etat simplifie des projections.
  public async consulterSanteProjections(): Promise<{ donnee: Record<string, unknown> }> {
    return HealthPresenter.presenter({
      projections: 'OK',
    });
  }

  // Cette methode retourne l'etat simplifie de la synchronisation.
  public async consulterSanteSynchronisation(): Promise<{ donnee: Record<string, unknown> }> {
    return HealthPresenter.presenter({
      synchronisation: 'OK',
    });
  }
}
