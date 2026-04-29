import type { AnnulerExonerationInput } from 'contexts/paiements-facturation/application/dto/input/ExonerationsEntreeDTO';
import type { ExonerationOutput } from 'contexts/paiements-facturation/application/dto/output/ExonerationsSortieDTO';
import type { DepotExoneration } from 'contexts/paiements-facturation/domain/repositories/DepotExoneration';
import { versExonerationOutput } from 'contexts/paiements-facturation/application/mappers/ExonerationApplicationMapper';

export interface DepotExonerationLecture extends DepotExoneration {
  trouverParId(idExoneration: string): Promise<import('contexts/paiements-facturation/domain/aggregates/Exoneration').Exoneration | null>;
}

export class AnnulerExonerationUseCase {
  constructor(private readonly depotExoneration: DepotExonerationLecture) {}

  public async executer(input: AnnulerExonerationInput): Promise<ExonerationOutput> {
    const exoneration = await this.depotExoneration.trouverParId(input.idExoneration);
    if (exoneration === null) {
      throw new Error('L exoneration a annuler est introuvable.');
    }
    exoneration.annuler();
    await this.depotExoneration.sauvegarder(exoneration);
    return versExonerationOutput(exoneration);
  }
}
