import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { ConsulterCaisseJourInput } from 'contexts/paiements-facturation/application/dto/input/CaisseEntreeDTO';
import type { CaisseJourOutput } from 'contexts/paiements-facturation/application/dto/output/CaisseSortieDTO';
import { versCaisseJourOutput } from 'contexts/paiements-facturation/application/mappers/CaisseApplicationMapper';
import { ErreurCaisseIndisponible } from 'contexts/paiements-facturation/application/exceptions/ErreurCaisseIndisponible';

export class ConsulterCaisseJourUseCase {
  constructor(private readonly depotCaisseJour: DepotCaisseJour) {}

  public async executer(input: ConsulterCaisseJourInput): Promise<CaisseJourOutput> {
    const caisse = await this.depotCaisseJour.trouverActiveParEcoleEtDate(input.idEcole, input.date);
    if (caisse === null) {
      throw new ErreurCaisseIndisponible();
    }
    return versCaisseJourOutput(caisse);
  }
}
