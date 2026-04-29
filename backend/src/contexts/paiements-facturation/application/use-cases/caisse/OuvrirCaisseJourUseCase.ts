import { CaisseJour } from 'contexts/paiements-facturation/domain/aggregates/CaisseJour';
import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { OuvrirCaisseJourInput } from 'contexts/paiements-facturation/application/dto/input/CaisseEntreeDTO';
import type { CaisseJourOutput } from 'contexts/paiements-facturation/application/dto/output/CaisseSortieDTO';
import { versCaisseJourOutput } from 'contexts/paiements-facturation/application/mappers/CaisseApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurCaisseIndisponible } from 'contexts/paiements-facturation/application/exceptions/ErreurCaisseIndisponible';

export class OuvrirCaisseJourUseCase {
  constructor(
    private readonly depotCaisseJour: DepotCaisseJour,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: OuvrirCaisseJourInput): Promise<CaisseJourOutput> {
    const existante = await this.depotCaisseJour.trouverActiveParEcoleEtDate(input.idEcole, input.date);
    if (existante !== null) {
      throw new ErreurCaisseIndisponible('Une caisse active existe deja pour cette ecole et cette date.');
    }
    const caisse = CaisseJour.ouvrir({
      idCaisseJour: `${input.idEcole}-${input.date}`,
      idEcole: input.idEcole,
      dateCaisse: input.date,
      ouvertePar: input.idUtilisateur,
    });
    await this.depotCaisseJour.sauvegarder(caisse);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'OUVRIR_CAISSE_JOUR',
      idEcole: input.idEcole,
      idUtilisateur: input.idUtilisateur,
      referenceMetier: caisse.obtenirId(),
    });
    return versCaisseJourOutput(caisse);
  }
}
