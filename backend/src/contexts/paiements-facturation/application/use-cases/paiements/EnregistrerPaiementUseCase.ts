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
import type { AutorisationPerceptionPaiementPort } from 'contexts/paiements-facturation/application/ports/AutorisationPerceptionPaiementPort';
import type { DepotRecuPaiementOfficielPort } from 'contexts/paiements-facturation/application/ports/DepotRecuPaiementOfficielPort';
import type { ServiceNumeroRecuPaiementPort } from 'contexts/paiements-facturation/application/ports/ServiceNumeroRecuPaiementPort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import { ErreurUseCasePaiement } from 'contexts/paiements-facturation/application/exceptions/ErreurUseCasePaiement';
import type { DomainEventBusPort } from 'shared/application/DomainEventBusPort';
import { convertirMontantEnLettres } from 'shared/utils/montantEnLettres';

export class EnregistrerPaiementUseCase {
  constructor(
    private readonly depotObligationFinanciere: DepotObligationFinanciere,
    private readonly depotPaiement: DepotPaiement,
    private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole,
    private readonly depotRecuPaiement: DepotRecuPaiement,
    private readonly depotCaisseJour: DepotCaisseJour,
    _depotRestitution: DepotRestitution,
    private readonly serviceIdempotencePaiement: ServiceIdempotencePaiement<PaiementEnregistreOutput>,
    private readonly serviceTransactionPaiement: ServiceTransactionPaiement,
    private readonly autorisationPerceptionPaiement?: AutorisationPerceptionPaiementPort,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly depotRecuPaiementOfficiel?: DepotRecuPaiementOfficielPort,
    private readonly serviceNumeroRecuPaiement?: ServiceNumeroRecuPaiementPort,
    private readonly moteurRepartitionPaiement = new MoteurRepartitionPaiement(),
    private readonly moteurRecu = new MoteurRecu(),
    private readonly moteurCaisse = new MoteurCaisse(),
    private readonly auditPort?: AuditPort,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  public async executer(input: EnregistrerPaiementInput): Promise<PaiementEnregistreOutput> {
    const cle = this.serviceIdempotencePaiement.exigerCle(input.idempotencyKey);
    const empreinte = this.serviceIdempotencePaiement.creerEmpreintePayload(input);
    const sortieDejaTraitee = await this.serviceIdempotencePaiement.verifierOuRejouer(cle, empreinte);
    if (sortieDejaTraitee !== null) {
      return sortieDejaTraitee;
    }

    return this.serviceTransactionPaiement.executer(async () => {
      const eleve = this.scolariteElevesPort === undefined
        ? null
        : await this.scolariteElevesPort.consulterEleve(input.idEleve);
      if (
        eleve !== null
        && (eleve.idEcole !== input.idEcole || eleve.idOrganisation !== input.idOrganisation)
      ) {
        throw new ErreurUseCasePaiement(
          "L'eleve cible n'appartient pas au perimetre organisationnel et scolaire fourni.",
        );
      }

      await this.autorisationPerceptionPaiement?.verifierPerceptionPaiement({
        idUtilisateur: input.idCaissier,
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idEleve: input.idEleve,
        typeFrais: input.typeFraisDeclare,
      });

      const parametres = await this.depotParametresPaiementEcole.trouverActifParEcole(input.idEcole);
      if (parametres === null) {
        throw new ErreurUseCasePaiement('Aucun parametre de paiement actif n est defini pour cette ecole.');
      }
      if (!parametres.estModePaiementAutorise(input.modePaiement)) {
        throw new ErreurUseCasePaiement('Le mode de paiement choisi est interdit par les parametres de l ecole.');
      }

      const inscriptionActive = this.scolariteElevesPort === undefined
        ? null
        : await this.scolariteElevesPort.consulterInscriptionActive(input.idEleve);
      const obligations = await this.depotObligationFinanciere.listerParEleveEtAnnee(
        input.idEcole,
        input.idEleve,
        inscriptionActive?.idAnneeScolaire ?? '',
      );
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

      const dateEmissionRecu = new Date();
      const numeroRecuOfficiel = this.serviceNumeroRecuPaiement === undefined
        ? undefined
        : await this.serviceNumeroRecuPaiement.generer(
          input.idEcole,
          dateEmissionRecu.getFullYear(),
        );
      const recus = this.moteurRecu.generer(
        paiement,
        new Map(obligationsCibles.map((obligation) => [obligation.obtenirId(), obligation])),
        input.idCaissier,
        numeroRecuOfficiel,
        dateEmissionRecu,
      );
      for (const recu of recus) {
        await this.depotRecuPaiement.sauvegarder(recu);
      }
      await this.depotRecuPaiementOfficiel?.sauvegarder({
        idRecu: recus[0]!.obtenirId(),
        numeroRecu: recus[0]!.obtenirNumeroRecu(),
        idPaiement: paiement.obtenirId(),
        idEcole: paiement.obtenirIdEcole(),
        idEleve: paiement.obtenirIdEleve(),
        totalPaye: paiement.obtenirMontantTotal().obtenirMontant(),
        devise: paiement.obtenirMontantTotal().obtenirDevise(),
        montantEnLettres: convertirMontantEnLettres(
          paiement.obtenirMontantTotal().obtenirMontant(),
          {
            devise: paiement.obtenirMontantTotal().obtenirDevise(),
            majusculeInitiale: true,
          },
        ),
        modePaiement: paiement.obtenirModePaiement(),
        idCaissier: input.idCaissier,
        dateEmission: dateEmissionRecu,
        statutRecu: String(recus[0]!.obtenirStatutRecu()),
        lignes: recus.map((recu, index) => ({
          idLigne: `${recu.obtenirId()}-OFFICIEL`,
          numeroLigne: index + 1,
          idRecuLigne: recu.obtenirId(),
          idObligation: recu.obtenirIdObligation(),
          typeFrais: String(recu.obtenirTypeFrais()),
          referenceFrais: recu.obtenirReferenceFrais().toString(),
          libelle: recu.obtenirLibelle(),
          montant: recu.obtenirMontant().obtenirMontant(),
          devise: recu.obtenirMontant().obtenirDevise(),
        })),
      });

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
        idOrganisation: input.idOrganisation,
        idEcole: input.idEcole,
        idUtilisateur: input.idCaissier,
        referenceMetier: paiement.obtenirId(),
        montant: input.montant.obtenirMontant(),
        devise: input.montant.obtenirDevise(),
      });
      await this.eventBus?.publier(paiement.recupererEvenements(), {
        organisationId: input.idOrganisation,
        ecoleId: input.idEcole,
        utilisateurId: input.idCaissier,
      });
      paiement.viderEvenements();

      return sortie;
    });
  }
}
