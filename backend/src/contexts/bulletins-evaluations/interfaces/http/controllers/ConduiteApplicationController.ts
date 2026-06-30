import type { DeclarerAbandonUseCase } from 'contexts/bulletins-evaluations/application/use-cases/DeclarerAbandon/DeclarerAbandonUseCase';
import type { DeclarerNonClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/DeclarerNonClasse/DeclarerNonClasseUseCase';
import type { ConsulterConduiteClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterConduiteClasse/ConsulterConduiteClasseUseCase';
import type { ConsulterResultatEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterResultatEleve/ConsulterResultatEleveUseCase';
import type { EncoderConduiteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderConduite/EncoderConduiteUseCase';
import { EncoderConduiteValidator } from '../validators/EncoderConduiteValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose l'encodage de conduite et les lectures associees.
export class ConduiteApplicationController {
  // Ce constructeur injecte les cas d'usage de conduite et les actions associees sur l'application.
  constructor(
    private readonly encoderConduiteUseCase: EncoderConduiteUseCase,
    private readonly consulterConduiteClasseUseCase: ConsulterConduiteClasseUseCase,
    private readonly consulterResultatEleveUseCase: ConsulterResultatEleveUseCase,
    _declarerNonClasseUseCase: DeclarerNonClasseUseCase,
    _declarerAbandonUseCase: DeclarerAbandonUseCase,
  ) {}

  // Cette methode encode la conduite d'une periode.
  public async encoder(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = EncoderConduiteValidator.valider(corps, headers);
    const sortie = await this.encoderConduiteUseCase.executer(entree);
    return { donnee: sortie };
  }

  // Cette methode expose la liste de conduite d'une classe pour l'encodage.
  public async consulterConduiteClasse(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const sortie = await this.consulterConduiteClasseUseCase.executer({
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      idEcole: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    });
    return { donnee: sortie };
  }

  // Cette methode expose une lecture simple de conduite quand la projection existe.
  public async consulterConduite(params: unknown, query: unknown, headers: unknown): Promise<{ donnee: unknown[] }> {
    const resultat = await this.consulterResultat(params, query, headers);
    return {
      donnee: resultat.applications
        .filter((element) => element.conduite !== undefined || element.pointsConduite !== undefined)
        .map((element) => ({
          codePeriode: element.codePeriode,
          conduite: element.conduite,
          pointsConduite: element.pointsConduite,
        })),
    };
  }

  // Cette methode expose une lecture simple d'application quand la projection existe.
  public async consulterApplication(params: unknown, query: unknown, headers: unknown): Promise<{ donnee: unknown[] }> {
    const resultat = await this.consulterResultat(params, query, headers);
    return {
      donnee: resultat.applications
        .filter((element) => element.application !== undefined)
        .map((element) => ({
          codePeriode: element.codePeriode,
          application: element.application,
        })),
    };
  }

  private async consulterResultat(params: unknown, query: unknown, headers: unknown) {
    const donneesParams = ValidationHttpBulletinsEvaluations.obtenirObjet(params, 'params');
    const donneesQuery = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');

    return this.consulterResultatEleveUseCase.executer({
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donneesParams, 'idEleve'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donneesQuery, 'idAnneeScolaire'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
    });
  }
}
