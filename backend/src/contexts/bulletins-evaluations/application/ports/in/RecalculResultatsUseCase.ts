import type { RecalculerResultatEleveInput } from '../../dto/input/RecalculerResultatEleveInput';
import type { ResultatBulletinOutput } from '../../dto/output/ResultatBulletinOutput';

// Ce contrat expose le recalcul applicatif des resultats consolides.
export interface RecalculResultatsUseCase {
  executer(input: RecalculerResultatEleveInput): Promise<ResultatBulletinOutput>;
}
