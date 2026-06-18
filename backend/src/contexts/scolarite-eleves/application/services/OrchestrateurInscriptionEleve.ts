import { UseCase } from '../../../../shared/application/UseCase';
import { CreerInscriptionComplete, SortieCreerInscriptionComplete } from '../use-cases/inscriptions/CreerInscriptionComplete';
import { CreerInscriptionCompleteEntreeDTO } from '../dto/input/CreerInscriptionCompleteEntreeDTO';
import { ServiceApplicationIdempotence, StoreIdempotenceApplication } from './ServiceApplicationIdempotence';

interface SortieIdempotenceInscriptionComplete {
  donnee: SortieCreerInscriptionComplete;
}

// Ce fichier contient l'orchestrateur applicatif de l'inscription complete.
/**
 * Cet orchestrateur coordonne eleve, inscription, affectation et parcours sans logique metier profonde.
 */
export class OrchestrateurInscriptionEleve implements UseCase<CreerInscriptionCompleteEntreeDTO, SortieCreerInscriptionComplete> {
  private readonly serviceIdempotence: ServiceApplicationIdempotence<SortieIdempotenceInscriptionComplete>;

  constructor(
    private readonly creerInscriptionComplete: CreerInscriptionComplete,
    storeIdempotence?: StoreIdempotenceApplication<SortieIdempotenceInscriptionComplete>,
  ) {
    this.serviceIdempotence = new ServiceApplicationIdempotence(storeIdempotence);
  }

  /** Execute le parcours applicatif complet d'inscription. */
  public async inscrireEleve(entree: CreerInscriptionCompleteEntreeDTO): Promise<SortieCreerInscriptionComplete> {
    const cle = this.serviceIdempotence.exigerCle(entree.eleve.idempotencyKey);
    const empreinte = this.serviceIdempotence.creerEmpreintePayload(entree);
    const sortieExistante = await this.serviceIdempotence.trouverSortieDejaTraitee(
      cle,
      empreinte,
    );

    if (sortieExistante !== null) {
      return sortieExistante.donnee;
    }

    const sortie = await this.creerInscriptionComplete.executer(entree);

    await this.serviceIdempotence.enregistrerSortie(cle, empreinte, {
      donnee: sortie,
    });

    return sortie;
  }

  /** Expose le contrat standard UseCase pour l'integration HTTP. */
  public executer(entree: CreerInscriptionCompleteEntreeDTO): Promise<SortieCreerInscriptionComplete> {
    return this.inscrireEleve(entree);
  }
}
