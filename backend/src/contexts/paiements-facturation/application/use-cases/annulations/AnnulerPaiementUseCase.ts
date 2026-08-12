import type { AnnulerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import type { AutorisationAnnulationPaiementPort } from 'contexts/paiements-facturation/application/ports/AutorisationAnnulationPaiementPort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotRecuPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotRecuPaiement';
import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { DepotAnnulationPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotAnnulationPaiement';
import { MoteurAnnulationPaiement } from 'contexts/paiements-facturation/domain/services/MoteurAnnulationPaiement';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import type { DomainEventBusPort } from 'shared/application/DomainEventBusPort';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import type { ServiceTransactionPaiement } from 'contexts/paiements-facturation/application/services/ServiceTransactionPaiement';

export interface DepotRecuPaiementParPaiement extends DepotRecuPaiement {
  listerParPaiement(idPaiement: string): Promise<import('contexts/paiements-facturation/domain/aggregates/RecuPaiement').RecuPaiement[]>;
}

export class AnnulerPaiementUseCase {
  constructor(
    private readonly depotPaiement: DepotPaiement,
    private readonly depotRecuPaiement: DepotRecuPaiementParPaiement,
    private readonly depotCaisseJour: DepotCaisseJour,
    private readonly depotAnnulationPaiement: DepotAnnulationPaiement,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly autorisationAnnulationPaiementPort?: AutorisationAnnulationPaiementPort,
    private readonly moteurAnnulationPaiement = new MoteurAnnulationPaiement(),
    private readonly eventBus?: DomainEventBusPort,
    private readonly auditPort?: AuditPort,
    private readonly serviceTransactionPaiement?: ServiceTransactionPaiement,
  ) {}

  public async executer(input: AnnulerPaiementInput): Promise<string> {
    const operation = async (): Promise<string> => {
      const paiement = await this.depotPaiement.trouverParId(input.idPaiement);
      if (paiement === null) {
        throw new Error('Le paiement a annuler est introuvable.');
      }

      const eleve = this.scolariteElevesPort === undefined
        ? null
        : await this.scolariteElevesPort.consulterEleve(paiement.obtenirIdEleve());

      if (paiement.obtenirIdEcole() !== input.idEcole) {
        throw new ErreurDroitsInsuffisants(
          "Le paiement cible n'appartient pas a l'ecole courante.",
        );
      }

      if (
        eleve !== null
        && (eleve.idOrganisation !== input.idOrganisation || eleve.idEcole !== input.idEcole)
      ) {
        throw new ErreurDroitsInsuffisants(
          "Le paiement cible n'appartient pas au perimetre organisation + ecole courant.",
        );
      }

      await this.autorisationAnnulationPaiementPort?.verifierAnnulationPaiement({
        idUtilisateur: input.idUtilisateur,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idEleve: paiement.obtenirIdEleve(),
        typeFrais: paiement.obtenirTypeFraisDeclare(),
      });

      const recus = await this.depotRecuPaiement.listerParPaiement(input.idPaiement);
      const caisse = await this.depotCaisseJour.trouverActiveParEcoleEtDate(
        paiement.obtenirIdEcole(),
        new Date().toISOString().slice(0, 10),
      );
      if (caisse === null) {
        throw new Error('Aucune caisse active n a ete trouvee pour traiter cette annulation.');
      }
      const annulation = this.moteurAnnulationPaiement.annuler(
        paiement,
        recus,
        caisse,
        input.raison,
        input.annulePar,
      );
      await this.depotPaiement.sauvegarder(paiement);
      await Promise.all(recus.map((recu) => this.depotRecuPaiement.sauvegarder(recu)));
      await this.depotCaisseJour.sauvegarder(caisse);
      await this.depotAnnulationPaiement.sauvegarder(annulation);
      await this.auditPort?.journaliserActionFinanciere({
        action: 'ANNULER_PAIEMENT',
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idUtilisateur: input.idUtilisateur,
        referenceMetier: paiement.obtenirId(),
        details: {
          idAnnulation: annulation.obtenirId(),
          raison: input.raison,
        },
      });
      await this.eventBus?.publier(paiement.recupererEvenements(), {
        organisationId: input.idOrganisation,
        ecoleId: input.idEcole,
        utilisateurId: input.idUtilisateur,
      });
      paiement.viderEvenements();
      return annulation.obtenirId();
    };

    return this.serviceTransactionPaiement === undefined
      ? operation()
      : this.serviceTransactionPaiement.executer(operation);
  }
}
