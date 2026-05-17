import type { SynchroniserOperationOfflineInput } from '../../dto/input/SynchroniserOperationOfflineInput';
import type { SynchronisationOutput } from '../../dto/output/SynchronisationOutput';

// Ce contrat expose le rejeu applicatif des operations offline du BC.
export interface SynchronisationBulletinUseCase {
  executer(input: SynchroniserOperationOfflineInput): Promise<SynchronisationOutput>;
}
