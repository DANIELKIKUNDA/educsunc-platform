import type { RestituerExcedentInput } from 'contexts/paiements-facturation/application/dto/input/AnnulationsEntreeDTO';
import type { AutorisationRestitutionPaiementPort } from 'contexts/paiements-facturation/application/ports/AutorisationRestitutionPaiementPort';
import type { ScolariteElevesPort } from 'contexts/paiements-facturation/application/ports/ScolariteElevesPort';
import type { RestitutionOutput } from 'contexts/paiements-facturation/application/dto/output/PaiementsSortieDTO';
import type { DepotCaisseJour } from 'contexts/paiements-facturation/domain/repositories/DepotCaisseJour';
import type { DepotPaiement } from 'contexts/paiements-facturation/domain/repositories/DepotPaiement';
import type { DepotRestitution } from 'contexts/paiements-facturation/domain/repositories/DepotRestitution';
import { Restitution } from 'contexts/paiements-facturation/domain/aggregates/Restitution';
import { OperationCaisse } from 'contexts/paiements-facturation/domain/entities/OperationCaisse';
import { ErreurDroitsInsuffisants } from 'contexts/paiements-facturation/application/exceptions/ErreurDroitsInsuffisants';
import { versRestitutionOutput } from 'contexts/paiements-facturation/application/mappers/PaiementApplicationMapper';
import { TypeOperationCaisse } from 'contexts/paiements-facturation/domain/value-objects/TypeOperationCaisse';
import type { DomainEventBusPort } from 'shared/application/DomainEventBusPort';

export class RestituerExcedentUseCase {
  constructor(
    private readonly depotPaiement: DepotPaiement,
    private readonly depotRestitution: DepotRestitution,
    private readonly depotCaisseJour?: DepotCaisseJour,
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly autorisationRestitutionPaiementPort?: AutorisationRestitutionPaiementPort,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  public async executer(input: RestituerExcedentInput): Promise<RestitutionOutput> {
    const paiement = await this.depotPaiement.trouverParId(input.idPaiement);
    if (paiement === null) {
      throw new Error('Le paiement source de la restitution est introuvable.');
    }

    if (paiement.obtenirIdEcole() !== input.idEcole) {
      throw new ErreurDroitsInsuffisants(
        "Le paiement cible n'appartient pas a l'ecole courante.",
      );
    }

    if (paiement.obtenirIdEleve() !== input.idEleve) {
      throw new ErreurDroitsInsuffisants(
        "Le paiement cible n'appartient pas a l'eleve courant.",
      );
    }

    const eleve = this.scolariteElevesPort === undefined
      ? null
      : await this.scolariteElevesPort.consulterEleve(paiement.obtenirIdEleve());

    if (
      eleve !== null
      && (eleve.idOrganisation !== input.idOrganisation || eleve.idEcole !== input.idEcole)
    ) {
      throw new ErreurDroitsInsuffisants(
        "Le paiement cible n'appartient pas au perimetre organisation + ecole courant.",
      );
    }

    await this.autorisationRestitutionPaiementPort?.verifierRestitutionPaiement({
      idUtilisateur: input.idUtilisateur,
      idOrganisation: input.idOrganisation,
      idEcole: input.idEcole,
      idEleve: paiement.obtenirIdEleve(),
      typeFrais: paiement.obtenirTypeFraisDeclare(),
    });

    const restitutionExistante = await this.depotRestitution.trouverParPaiement(input.idPaiement);
    if (restitutionExistante !== null) {
      throw new Error('Une restitution existe deja pour ce paiement.');
    }

    const caisse = this.depotCaisseJour === undefined
      ? null
      : await this.depotCaisseJour.trouverActiveParEcoleEtDate(
        paiement.obtenirIdEcole(),
        new Date().toISOString().slice(0, 10),
      );

    if (this.depotCaisseJour !== undefined && caisse === null) {
      throw new Error('Aucune caisse active n a ete trouvee pour traiter cette restitution.');
    }

    paiement.rembourser();

    const restitution = new Restitution({
      idRestitution: `${input.idPaiement}-REST-${Date.now()}`,
      idPaiement: input.idPaiement,
      idEcole: input.idEcole,
      idEleve: input.idEleve,
      montant: paiement.obtenirMontantTotal(),
      raison: 'EXCEDENT',
      effectuePar: input.effectuePar,
      effectueLe: new Date(),
    });

    caisse?.ajouterOperation(new OperationCaisse({
      idOperation: `${restitution.obtenirId()}-CAISSE`,
      idPaiement: paiement.obtenirId(),
      idRestitution: restitution.obtenirId(),
      typeOperation: TypeOperationCaisse.RESTITUTION,
      montant: restitution.obtenirMontant(),
      modePaiement: paiement.obtenirModePaiement(),
      // La contre-operation neutralise comptablement la collecte d'origine.
      idCaissier: paiement.obtenirCreePar(),
      dateOperation: restitution.obtenirEffectueLe(),
    }));

    await this.depotPaiement.sauvegarder(paiement);
    await this.depotRestitution.sauvegarder(restitution);
    if (caisse !== null) {
      await this.depotCaisseJour?.sauvegarder(caisse);
    }
    await this.eventBus?.publier([
      ...paiement.recupererEvenements(),
      ...restitution.recupererEvenements(),
    ], {
      organisationId: input.idOrganisation,
      ecoleId: input.idEcole,
      utilisateurId: input.idUtilisateur,
    });
    paiement.viderEvenements();
    restitution.viderEvenements();
    return versRestitutionOutput(restitution);
  }
}
