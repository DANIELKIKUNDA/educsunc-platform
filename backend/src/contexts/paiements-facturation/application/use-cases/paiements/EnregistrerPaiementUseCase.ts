import type { EnregistrerPaiementInput } from 'contexts/paiements-facturation/application/dto/input/PaiementsEntreeDTO';
import type { PaiementEnregistreOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import type { DepotObligationFinanciere } from 'contexts/paiements-facturation/domain/repositories/DepotObligationFinanciere';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotParametresPaiementEcole } from 'contexts/paiements-facturation/domain/repositories/DepotParametresPaiementEcole';
import type { DepotRecuPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotRecuPaiement';
import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { DepotRestitution } from 'contexts/paiements-facturation/domain/repositories/DepotRestitution';
import { Paiement } from 'contexts/paiements-facturation/domain/aggregates/Paiement';
import { MoteurRepartitionPaiement } from 'contexts/paiements-facturation/domain/services/MoteurRepartitionPaiement';
import { MoteurRecu } from 'contexts/paiements-facturation/domain/services/MoteurRecu';
import { MoteurCaisse } from 'contexts/paiements-facturation/domain/services/MoteurCaisse';
import { OperationCaisse } from 'contexts/paiements-facturation/domain/entities/OperationCaisse';
import { CiblePaiement } from 'contexts/paiements-facturation/domain/value-objects/CiblePaiement';
import { TypeOperationCaisse } from 'contexts/paiements-facturation/domain/value-objects/TypeOperationCaisse';
import { OrigineAffectation } from 'contexts/paiements-facturation/domain/value-objects/OrigineAffectation';
import { ServiceIdempotencePaiement } from 'contexts/paiements-facturation/application/services/ServiceIdempotencePaiement';
import { ServiceTransactionPaiement } from 'contexts/paiements-facturation/application/services/ServiceTransactionPaiement';
import { versPaiementEnregistreOutput } from 'contexts/paiements-facturation/application/mappers/PaiementApplicationMapper';
import type { AuditPort } from 'contexts/paiements-facturation/application/ports/AuditPort';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';

export class EnregistrerPaiementUseCase {
  constructor(
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly depotPaiement: DepotPaiement,
    private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole,
    private readonly depotRecuPaiement: DepotRecuPaiement,
    private readonly depotCaisseJour: DepotCaisseJour,
    private readonly depotRestitution: DepotRestitution,
    private readonly serviceIdempotencePaiement: ServiceIdempotencePaiement<PaiementEnregistreOutput>,
    private readonly serviceTransactionPaiement: ServiceTransactionPaiement,
    private readonly moteurRepartitionPaiement = new MoteurRepartitionPaiement(),
    private readonly moteurRecu = new MoteurRecu(),
    private readonly moteurCaisse = new MoteurCaisse(),
    private readonly auditPort?: AuditPort,
  ) {}

  public async executer(input: EnregistrerPaiementInput): Promise<PaiementEnregistreOutput> {
    const cle = this.serviceIdempotencePaiement.exigerCle(input.idempotencyKey);
    const empreinte = this.serviceIdempotencePaiement.creerEmpreintePayload(input);
    const sortieDejaTraitee = await this.serviceIdempotencePaiement.verifierOuRejouer(cle, empreinte);
    if (sortieDejaTraitee !== null) {
      return sortieDejaTraitee;
    }

    return this.serviceTransactionPaiement.executer(async () => {
      const parametres = await this.depotParametresPaiementEcole.trouverActifParEcole(input.idEcole);
      if (parametres === null) {
        throw new ErreurUseCasePaiement('Aucun parametre de paiement actif n est defini pour cette ecole.');
      }
      if (!parametres.estModePaiementAutorise(input.modePaiement)) {
        throw new ErreurUseCasePaiement('Le mode de paiement choisi est interdit par les parametres de l ecole.');
      }

      const obligations = await this.depotObligationFinanciere.listerParEleveEtAnnee(input.idEcole, input.idEleve, '');
      const obligationsCibles = obligations.filter((obligation) =>
        obligation.obtenirTypeFrais() === input.typeFraisDeclare && !obligation.estSoldee(),
      );
      if (obligationsCibles.length === 0) {
        throw new ErreurUseCasePaiement('Aucune obligation exigible ne correspond a ce type de frais.');
      }

      const paiement = Paiement.creer({
        idPaiement: `${input.idEcole}-${input.idEleve}-${Date.now()}`,
        idEcole: input.idEcole,
        idEleve: input.idEleve,
        montantTotal: input.montant,
        modePaiement: input.modePaiement,
        typeFraisDeclare: input.typeFraisDeclare,
        ciblePaiement: input.ciblePaiement ?? CiblePaiement.STANDARD,
        idempotencyKey: cle,
        creePar: input.idCaissier,
      });

      const repartitions = this.moteurRepartitionPaiement.repartir(
        paiement.obtenirId(),
        input.montant,
        obligationsCibles,
        OrigineAffectation.NORMAL,
      );
      paiement.repartir(repartitions);
      paiement.valider();

      for (const obligation of obligationsCibles) {
        await this.depotObligationFinanciere.sauvegarder(obligation);
      }
      await this.depotPaiement.sauvegarder(paiement);

      const recus = this.moteurRecu.generer(
        paiement,
        new Map(obligationsCibles.map((obligation) => [obligation.obtenirId(), obligation])),
        input.idCaissier,
      );
      for (const recu of recus) {
        await this.depotRecuPaiement.sauvegarder(recu);
      }

      const caisse = await this.depotCaisseJour.trouverActiveParEcoleEtDate(input.idEcole, new Date().toISOString().slice(0, 10));
      if (caisse !== null) {
        this.moteurCaisse.enregistrerOperation(caisse, new OperationCaisse({
          idOperation: `${paiement.obtenirId()}-OP`,
          idPaiement: paiement.obtenirId(),
          typeOperation: TypeOperationCaisse.PAIEMENT,
          montant: input.montant,
          modePaiement: input.modePaiement,
          idCaissier: input.idCaissier,
          dateOperation: new Date(),
        }));
        await this.depotCaisseJour.sauvegarder(caisse);
      }

      const sortie = versPaiementEnregistreOutput(paiement, recus);
      await this.serviceIdempotencePaiement.enregistrer(cle, empreinte, sortie);
      await this.auditPort?.journaliserActionFinanciere({
        action: 'ENREGISTRER_PAIEMENT',
        idEcole: input.idEcole,
        idUtilisateur: input.idCaissier,
        referenceMetier: paiement.obtenirId(),
      });

      return sortie;
    });
  }
}
