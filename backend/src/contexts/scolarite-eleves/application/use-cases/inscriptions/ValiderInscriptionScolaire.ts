import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';
import { HistorisationParcoursScolaire } from '../../services/HistorisationParcoursScolaire';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier contient le cas d'usage de validation d'une inscription scolaire.
export interface ValiderInscriptionScolaireEntree extends ContexteCommandeScolariteDTO { idInscriptionScolaire: string }
export interface SortieValiderInscriptionScolaire { inscription: InscriptionScolaireSortieDTO }

/** Ce cas d'usage valide une inscription existante. */
export class ValiderInscriptionScolaire implements UseCase<ValiderInscriptionScolaireEntree, SortieValiderInscriptionScolaire> {
  constructor(
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
    private readonly historisationParcours?: HistorisationParcoursScolaire,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  /** Execute la validation de l'inscription. */
  public async executer(entree: ValiderInscriptionScolaireEntree): Promise<SortieValiderInscriptionScolaire> {
    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);

    if (inscription === null) throw new ErreurRessourceIntrouvable('Inscription introuvable.');

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, inscription.obtenirVersion());
    inscription.valider(entree.idUtilisateur);
    await this.depotInscription.sauvegarder(inscription);
    await this.historisationParcours?.enregistrerValidationInscription({
      idOrganisation: inscription.obtenirIdOrganisation(),
      idEcole: inscription.obtenirIdEcole(),
      idEleve: inscription.obtenirIdEleve(),
      idInscriptionScolaire: inscription.obtenirId(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      declenchePar: entree.idUtilisateur,
    });
    await this.eventBus?.publier(inscription.recupererEvenements(), {
      organisationId: inscription.obtenirIdOrganisation(),
      ecoleId: inscription.obtenirIdEcole(),
      utilisateurId: entree.idUtilisateur,
    });
    inscription.viderEvenements();

    return { inscription: InscriptionScolaireMapper.versSortie(inscription) };
  }
}
