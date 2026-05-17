import type { ConsulterClassementInput } from '../../dto/input/ConsulterClassementInput';
import type { ClassementClasseOutput } from '../../dto/output/ClassementClasseOutput';
import { QueryException } from '../../exceptions/QueryException';
import type { ClassementClasseQuery } from '../../queries/ClassementClasseQuery';

// Ce use case expose la lecture optimisee d'un classement de classe.
export class ConsulterClassementClasseUseCase {
  constructor(private readonly query: ClassementClasseQuery) {}

  // Cette methode retourne le classement demande ou echoue proprement.
  public async executer(input: ConsulterClassementInput): Promise<ClassementClasseOutput> {
    const classement = await this.query.executer(input.idClassePedagogique, input.idAnneeScolaire, input.codeColonne);
    if (classement === null) {
      throw new QueryException('Le classement demande est introuvable.');
    }

    return classement;
  }
}
