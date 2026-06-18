import type { ConsulterComparatifClassesUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterComparatifClasses/ConsulterComparatifClassesUseCase';
import type { ConsulterCoursProblematiqueUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterCoursProblematiques/ConsulterCoursProblematiqueUseCase';
import type { ConsulterEchecsClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsClasse/ConsulterEchecsClasseUseCase';
import type { ConsulterEchecsProfondsClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsProfondsClasse/ConsulterEchecsProfondsClasseUseCase';
import type { ConsulterEvolutionResultatUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEvolutionResultat/ConsulterEvolutionResultatUseCase';
import type { ConsulterPerequationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterPerequationClasse/ConsulterPerequationClasseUseCase';
import type { ConsulterRepechageClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterRepechageClasse/ConsulterRepechageClasseUseCase';
import type { ConsulterDeliberationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterDeliberationClasse/ConsulterDeliberationClasseUseCase';
import type { ConsulterSecondeSessionClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterSecondeSessionClasse/ConsulterSecondeSessionClasseUseCase';
import type { ConsulterDiagnosticsResultatUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterDiagnosticsResultat/ConsulterDiagnosticsResultatUseCase';
import type { ConsulterResultatEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterResultatEleve/ConsulterResultatEleveUseCase';
import type { ConsulterNonClassesUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase';
import { PaginationPresenter } from '../presenters/PaginationPresenter';
import { ResultatBulletinPresenter } from '../presenters/ResultatBulletinPresenter';
import { ConsulterResultatsAnalyseValidator } from '../validators/ConsulterResultatsAnalyseValidator';
import { ConsulterStatistiquesValidator } from '../validators/ConsulterStatistiquesValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les lectures HTTP liees aux resultats, diagnostics et non classes.
export class ResultatsBulletinController {
  // Ce constructeur injecte la lecture du resultat courant et les queries de liste specialisees.
  constructor(
    private readonly consulterResultatEleveUseCase: ConsulterResultatEleveUseCase,
    private readonly consulterDiagnosticsResultatUseCase: ConsulterDiagnosticsResultatUseCase,
    private readonly consulterNonClassesUseCase: ConsulterNonClassesUseCase,
    private readonly consulterEchecsClasseUseCase: ConsulterEchecsClasseUseCase,
    private readonly consulterEchecsProfondsClasseUseCase: ConsulterEchecsProfondsClasseUseCase,
    private readonly consulterCoursProblematiqueUseCase: ConsulterCoursProblematiqueUseCase,
    private readonly consulterEvolutionResultatUseCase: ConsulterEvolutionResultatUseCase,
    private readonly consulterComparatifClassesUseCase: ConsulterComparatifClassesUseCase,
    private readonly consulterPerequationClasseUseCase: ConsulterPerequationClasseUseCase,
    private readonly consulterRepechageClasseUseCase: ConsulterRepechageClasseUseCase,
    private readonly consulterDeliberationClasseUseCase: ConsulterDeliberationClasseUseCase,
    private readonly consulterSecondeSessionClasseUseCase: ConsulterSecondeSessionClasseUseCase,
  ) {}

  // Cette methode consulte le resultat principal d'un eleve a partir des identifiants de route.
  public async consulterResultat(params: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const sortie = await this.consulterResultatEleveUseCase.executer({
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    });
    return ResultatBulletinPresenter.presenter(sortie);
  }

  // Cette methode lit les eleves non classes d'une classe.
  public async consulterNonClasses(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterStatistiquesValidator.validerNonClasses(query, headers);
    const donnees = await this.consulterNonClassesUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les diagnostics d'echec d'une classe.
  public async consulterDiagnostics(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const filtres = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const donnees = await this.consulterDiagnosticsResultatUseCase.executer({
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(filtres, 'idAnneeScolaire'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    });
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les eleves en echec d'une classe.
  public async consulterEchecs(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerEchecsClasse(query, headers);
    const donnees = await this.consulterEchecsClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les eleves en echec profond d'une classe.
  public async consulterEchecsProfonds(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerEchecsClasse(query, headers);
    const donnees = await this.consulterEchecsProfondsClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les cours problematiques d'une classe.
  public async consulterCoursProblematiques(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerCoursProblematique(query, headers);
    const donnees = await this.consulterCoursProblematiqueUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit l'evolution historisee d'un resultat.
  public async consulterEvolution(params: unknown, query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerEvolutionResultat(params, query, headers);
    const donnees = await this.consulterEvolutionResultatUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit un comparatif de classes.
  public async consulterComparatifClasses(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerComparatifClasses(query, headers);
    const donnees = await this.consulterComparatifClassesUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les eleves eligibles a la perequation.
  public async consulterPerequation(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerPerequation(query, headers);
    const donnees = await this.consulterPerequationClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les eleves eligibles au repechage.
  public async consulterRepechage(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerRepechage(query, headers);
    const donnees = await this.consulterRepechageClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les dossiers de deliberation d'une classe.
  public async consulterDeliberation(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerDeliberation(query, headers);
    const donnees = await this.consulterDeliberationClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }

  // Cette methode lit les dossiers de seconde session d'une classe.
  public async consulterSecondeSession(query: unknown, headers: unknown): Promise<{ donnee: unknown[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const entree = ConsulterResultatsAnalyseValidator.validerSecondeSession(query, headers);
    const donnees = await this.consulterSecondeSessionClasseUseCase.executer(entree);
    return PaginationPresenter.presenter(donnees, 1, donnees.length || 20, donnees.length);
  }
}
