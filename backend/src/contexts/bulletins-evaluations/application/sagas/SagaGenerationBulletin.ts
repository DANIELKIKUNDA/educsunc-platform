import type { BulletinEleveOutput } from '../dto/output/BulletinEleveOutput';
import type { GenererBulletinEleveUseCase } from '../use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import type { RecalculerClassementClasseUseCase } from '../use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import type { RecalculerResultatEleveUseCase } from '../use-cases/RecalculerResultatEleve/RecalculerResultatEleveUseCase';
import type { GenererBulletinEleveInput } from '../dto/input/GenererBulletinEleveInput';

// Cette saga orchestre recalcul, classement puis generation d'un bulletin.
export class SagaGenerationBulletin {
  constructor(
    private readonly recalculerResultatEleveUseCase: RecalculerResultatEleveUseCase,
    private readonly recalculerClassementClasseUseCase: RecalculerClassementClasseUseCase,
    private readonly genererBulletinEleveUseCase: GenererBulletinEleveUseCase,
  ) {}

  // Cette methode enchaine les etapes applicatives majeures de generation du bulletin.
  public async executer(input: GenererBulletinEleveInput): Promise<BulletinEleveOutput> {
    const resultat = await this.recalculerResultatEleveUseCase.executer({
      idEleve: input.idEleve,
      idInscriptionScolaire: input.idInscriptionScolaire,
      idAnneeScolaire: input.idAnneeScolaire,
    });

    const colonnePrincipale = resultat.resultatsColonnes.at(-1)?.codeColonne;
    if (colonnePrincipale !== undefined) {
      await this.recalculerClassementClasseUseCase.executer({
        idClassePedagogique: '',
        idAnneeScolaire: input.idAnneeScolaire,
        codeColonne: colonnePrincipale,
      });
    }

    return this.genererBulletinEleveUseCase.executer(input);
  }
}
