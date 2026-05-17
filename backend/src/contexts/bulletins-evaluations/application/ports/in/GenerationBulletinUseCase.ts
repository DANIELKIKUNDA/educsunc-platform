import type { GenererBulletinEleveInput } from '../../dto/input/GenererBulletinEleveInput';
import type { BulletinEleveOutput } from '../../dto/output/BulletinEleveOutput';

// Ce contrat expose la generation applicative d'un bulletin eleve.
export interface GenerationBulletinUseCase {
  executer(input: GenererBulletinEleveInput): Promise<BulletinEleveOutput>;
}
