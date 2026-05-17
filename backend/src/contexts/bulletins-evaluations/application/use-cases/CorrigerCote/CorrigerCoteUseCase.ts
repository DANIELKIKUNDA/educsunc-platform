import type { DepotFicheCotationEleveCours } from '../../../domain/repositories/DepotFicheCotationEleveCours';
import type { CorrigerCoteInput } from '../../dto/input/CorrigerCoteInput';
import type { FicheCotationOutput } from '../../dto/output/FicheCotationOutput';
import { ModifierCoteUseCase } from '../ModifierCote/ModifierCoteUseCase';
import { ViderCoteUseCase } from '../ViderCote/ViderCoteUseCase';

// Ce use case choisit entre modification et vidage dans un scenario de correction.
export class CorrigerCoteUseCase {
  constructor(
    private readonly modifierCoteUseCase: ModifierCoteUseCase,
    private readonly viderCoteUseCase: ViderCoteUseCase,
  ) {}

  // Cette methode corrige une cote selon la nouvelle valeur demandee.
  public async executer(input: CorrigerCoteInput): Promise<FicheCotationOutput> {
    if (input.nouvelleCote === null) {
      return this.viderCoteUseCase.executer({
        idFicheCotationEleveCours: input.idFicheCotationEleveCours,
        codeColonne: input.codeColonne,
        versionAttendue: input.versionAttendue,
        idUtilisateur: input.idUtilisateur,
      });
    }

    return this.modifierCoteUseCase.executer({
      idFicheCotationEleveCours: input.idFicheCotationEleveCours,
      codeColonne: input.codeColonne,
      nouvelleCote: input.nouvelleCote,
      versionAttendue: input.versionAttendue,
      idUtilisateur: input.idUtilisateur,
    });
  }
}
