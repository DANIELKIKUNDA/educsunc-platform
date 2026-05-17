import type { RecalculerClassementInput } from '../../dto/input/RecalculerClassementInput';
import type { ClassementClasseOutput } from '../../dto/output/ClassementClasseOutput';

// Ce contrat expose le recalcul applicatif du classement d'une classe.
export interface ClassementUseCase {
  executer(input: RecalculerClassementInput): Promise<ClassementClasseOutput>;
}
