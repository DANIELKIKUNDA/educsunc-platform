import type { ConsulterFicheCotationUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterFicheCotation/ConsulterFicheCotationUseCase';
import type { ConsulterFichesCotationClasseCoursUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterFichesCotationClasseCours/ConsulterFichesCotationClasseCoursUseCase';
import { FicheCotationPresenter } from '../presenters/FicheCotationPresenter';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { QueryFilterValidator } from '../validators/QueryFilterValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP de lecture des fiches de cotation.
export class FichesCotationController {
  // Ce constructeur injecte le cas d'usage de lecture disponible pour les fiches individuelles.
  constructor(
    private readonly consulterFicheCotationUseCase: ConsulterFicheCotationUseCase,
    private readonly consulterFichesCotationClasseCoursUseCase: ConsulterFichesCotationClasseCoursUseCase,
  ) {}

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

  // Cette methode ouvre la lecture de travail des fiches d'une classe pour un cours et une annee.
  public async consulterParClasse(
    params: unknown,
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const classe = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const filtres = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const donnees = await this.consulterFichesCotationClasseCoursUseCase.executer({
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(classe, 'classeId'),
      idReferentielCours: ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idReferentielCours'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idAnneeScolaire'),
    });
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }
}
