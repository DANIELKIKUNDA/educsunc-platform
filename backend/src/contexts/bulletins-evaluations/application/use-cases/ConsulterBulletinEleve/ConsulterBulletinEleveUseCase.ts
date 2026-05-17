import type { BulletinEleveQuery } from '../../queries/BulletinEleveQuery';
import type { ConsulterBulletinInput } from '../../dto/input/ConsulterBulletinInput';
import type { BulletinEleveOutput } from '../../dto/output/BulletinEleveOutput';
import { QueryException } from '../../exceptions/QueryException';

// Ce use case expose la lecture optimisee d'un bulletin eleve.
export class ConsulterBulletinEleveUseCase {
  constructor(private readonly query: BulletinEleveQuery) {}

  // Cette methode retourne le bulletin pre-calcule ou echoue proprement.
  public async executer(input: ConsulterBulletinInput): Promise<BulletinEleveOutput> {
    const bulletin = await this.query.executer(input.idEleve, input.idAnneeScolaire);
    if (bulletin === null) {
      throw new QueryException('Le bulletin demande est introuvable.');
    }

    return bulletin;
  }
}
