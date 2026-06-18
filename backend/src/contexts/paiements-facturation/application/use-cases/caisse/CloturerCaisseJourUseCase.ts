import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { CloturerCaisseJourInput } from 'contexts/paiements-facturation/application/dto/input/CaisseEntreeDTO';
import type { CaisseJourOutput } from 'contexts/paiements-facturation/application/dto/output/CaisseSortieDTO';
import { versCaisseJourOutput } from 'contexts/paiements-facturation/application/mappers/CaisseApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import type { AutorisationCaissePort } from 'contexts/paiements-facturation/application/ports/AutorisationCaissePort';
import { ErreurCaisseIndisponible } from 'contexts/paiements-facturation/application/exceptions/ErreurCaisseIndisponible';

export class CloturerCaisseJourUseCase {
  constructor(
    private readonly depotCaisseJour: DepotCaisseJour,
    private readonly autorisationCaissePort?: AutorisationCaissePort,
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: CloturerCaisseJourInput): Promise<CaisseJourOutput> {
    await this.autorisationCaissePort?.verifierClotureCaisse({
      idUtilisateur: input.clotureePar,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
    });

    const caisse = await this.depotCaisseJour.trouverParId(input.idCaisseJour);
    if (caisse === null) {
      throw new ErreurCaisseIndisponible('La caisse a cloturer est introuvable.');
    }
    if (caisse.obtenirIdEcole() !== input.idEcole) {
      throw new ErreurCaisseIndisponible("La caisse a cloturer n'appartient pas a l'ecole courante.");
    }
    caisse.cloturer(input.clotureePar);
    await this.depotCaisseJour.sauvegarder(caisse);
    await this.auditPort?.journaliserActionFinanciere({
      action: 'CLOTURER_CAISSE_JOUR',
      idOrganisation: input.idOrganisation,
      idEcole: caisse.obtenirIdEcole(),
      idUtilisateur: input.clotureePar,
      referenceMetier: caisse.obtenirId(),
      details: {
        montantPhysiqueDeclare: input.montantPhysiqueDeclare?.versJSON(),
        observation: input.observation,
      },
    });
    return versCaisseJourOutput(caisse);
  }
}
