import type { GenererProclamationClasseInput } from '../../dto/input/GenererProclamationClasseInput';
import type { ProclamationClasseOutput } from '../../dto/output/ProclamationClasseOutput';

// Ce contrat expose la generation applicative d'une proclamation.
export interface ProclamationUseCase {
  executer(input: GenererProclamationClasseInput): Promise<ProclamationClasseOutput>;
}
