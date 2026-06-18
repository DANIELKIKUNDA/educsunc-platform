import type { BulletinPdfPort } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { ConsulterBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterBulletinEleve/ConsulterBulletinEleveUseCase';
import type { ConsulterHistoriqueBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterHistoriqueBulletin/ConsulterHistoriqueBulletinUseCase';
import type { GenererBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import { BulletinPresenter } from '../presenters/BulletinPresenter';
import { ConsulterBulletinValidator } from '../validators/ConsulterBulletinValidator';
import { ConsulterHistoriqueBulletinValidator } from '../validators/ConsulterHistoriqueBulletinValidator';
import { GenererBulletinValidator } from '../validators/GenererBulletinValidator';

// Ce controleur expose les endpoints HTTP autour des bulletins d'eleve.
export class BulletinsController {
  // Ce constructeur injecte les cas d'usage de generation, de lecture et l'adaptateur PDF.
  constructor(
    private readonly genererBulletinEleveUseCase: GenererBulletinEleveUseCase,
    private readonly consulterBulletinEleveUseCase: ConsulterBulletinEleveUseCase,
    private readonly consulterHistoriqueBulletinUseCase: ConsulterHistoriqueBulletinUseCase,
    private readonly bulletinPdfPort?: BulletinPdfPort,
  ) {}

  // Cette methode genere un bulletin eleve.
  public async generer(corps: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = GenererBulletinValidator.valider(corps, headers);
    const sortie = await this.genererBulletinEleveUseCase.executer(entree);
    return BulletinPresenter.presenter(sortie as never);
  }

  // Cette methode consulte un bulletin eleve.
  public async consulter(params: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterBulletinValidator.valider(params, headers);
    const sortie = await this.consulterBulletinEleveUseCase.executer(entree);
    return BulletinPresenter.presenter(sortie as never);
  }

  // Cette methode prepare un PDF de bulletin a partir de la lecture existante.
  public async telechargerPdf(params: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const bulletin = await this.consulter(params, headers);

    if (this.bulletinPdfPort === undefined) {
      return bulletin;
    }

    const pdf = await this.bulletinPdfPort.genererBulletinPdf(bulletin.donnee as never);
    return BulletinPresenter.presenter(pdf as never);
  }

  // Cette methode expose l'historique d'un bulletin.
  public async consulterHistorique(params: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterHistoriqueBulletinValidator.valider(params, headers);
    const sortie = await this.consulterHistoriqueBulletinUseCase.executer(entree);
    return { donnee: sortie };
  }
}
