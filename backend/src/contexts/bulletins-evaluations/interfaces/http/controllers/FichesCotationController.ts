import type { ConsulterFicheCotationUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterFicheCotation/ConsulterFicheCotationUseCase';
import { FicheCotationPresenter } from '../presenters/FicheCotationPresenter';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP de lecture des fiches de cotation.
export class FichesCotationController {
  // Ce constructeur injecte le cas d'usage de lecture disponible pour les fiches individuelles.
  constructor(private readonly consulterFicheCotationUseCase: ConsulterFicheCotationUseCase) {}

  // Cette methode consulte une fiche de cotation par identifiant.
  public async consulterParId(params: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const sortie = await this.consulterFicheCotationUseCase.executer({
      idFicheCotationEleveCours: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'idFicheCotationEleveCours',
      ),
    });
    return FicheCotationPresenter.presenter(sortie as never);
  }

  // Cette methode expose un point d'entree documentaire de liste, sans inventer de query inexistante.
  public async consulterListe(
    query?: unknown,
  ): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const pagination = QueryFilterValidator.valider(query);
    void pagination;
    return PaginationPresenter.presenter([], 1, 20, 0);
  }

  // Cette methode reserve l'endpoint de lecture par classe en attendant une query specialisee dediee.
  public async consulterParClasse(
    params?: unknown,
    query?: unknown,
  ): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const pagination = QueryFilterValidator.valider(query);
    const classe = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    void pagination;
    void classe;
    return PaginationPresenter.presenter([], 1, 20, 0);
  }
}
