import type { GenererSyntheseEcoleInput } from '../../dto/input/GenererSyntheseEcoleInput';
import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';

// Ce contrat expose la generation applicative d'une synthese de resultats ecole.
export interface SyntheseResultatsUseCase {
  executer(input: GenererSyntheseEcoleInput): Promise<SyntheseEcoleOutput>;
}
