import type { DeclarerAbandonInput } from '../../dto/input/DeclarerAbandonInput';
import type { AbandonOutput } from '../../dto/output/AbandonOutput';
import type { ScolariteElevesPort } from '../../ports/out/ScolariteElevesPort';
import { SexeEleve } from '../../../domain/value-objects/SexeEleve';

// Ce use case expose la declaration applicative d'un abandon pour le BC.
export class DeclarerAbandonUseCase {
  constructor(private readonly scolariteElevesPort: ScolariteElevesPort) {}

  // Cette methode retourne une vue applicative de l'abandon declare ou constate.
  public async executer(input: DeclarerAbandonInput): Promise<AbandonOutput> {
    const eleve = await this.scolariteElevesPort.consulterEleve(input.idEleve);
    return {
      idEleve: input.idEleve,
      nomComplet: eleve?.nomComplet ?? 'Eleve inconnu',
      sexe: eleve?.sexe ?? SexeEleve.M,
      dateAbandon: input.dateAbandon,
      motifAbandon: input.motifAbandon,
    };
  }
}
