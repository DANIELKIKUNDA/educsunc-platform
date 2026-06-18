import { UseCase } from '../../../../../shared/application/UseCase';
import { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import type { AutorisationAffectationClassePort } from '../../ports';
import { MoteurAffectationClasse } from '../../../domain/services/MoteurAffectationClasse';
import { AffecterEleveAClasseEntreeDTO } from '../../dto/input/AffecterEleveAClasseEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';
import { HistorisationParcoursScolaire } from '../../services/HistorisationParcoursScolaire';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier contient le cas d'usage d'affectation d'un eleve a une classe.
export interface SortieAffecterEleveAClasse { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage cree une affectation active pour une inscription validee. */
export class AffecterEleveAClasse implements UseCase<AffecterEleveAClasseEntreeDTO, SortieAffecterEleveAClasse> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly autorisationAffectationClasse?: AutorisationAffectationClassePort,
    private readonly moteurAffectation: MoteurAffectationClasse = new MoteurAffectationClasse(),
    private readonly historisationParcours?: HistorisationParcoursScolaire,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  /** Execute l'affectation en classe. */
  public async executer(entree: AffecterEleveAClasseEntreeDTO): Promise<SortieAffecterEleveAClasse> {
    await this.autorisationAffectationClasse?.verifierCreationAffectationClasse({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idInscriptionScolaire: entree.idInscriptionScolaire,
      idClassePedagogique: entree.idClassePedagogique,
    });

    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);
    if (inscription === null) throw new ErreurRessourceIntrouvable('Inscription scolaire introuvable.');
    const affectationActiveExisteDeja = await this.depotAffectation.trouverAffectationActiveParInscription(entree.idInscriptionScolaire) !== null;

    this.moteurAffectation.verifierAffectationPossible({
      inscription,
      classePedagogiqueExiste: true,
      classePedagogiqueArchivee: false,
      memeEcole: true,
      memeAnneeScolaire: true,
      affectationActiveExisteDeja,
    });

    const affectation = AffectationClasse.creer({
      idAffectationClasse: entree.idAffectationClasse,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idInscriptionScolaire: entree.idInscriptionScolaire,
      idClassePedagogique: entree.idClassePedagogique,
      dateAffectation: entree.dateAffectation,
      motifAffectation: entree.motifAffectation,
      creePar: entree.idUtilisateur,
    });

    await this.depotAffectation.sauvegarder(affectation);
    await this.historisationParcours?.enregistrerAffectation({
      idOrganisation: affectation.obtenirIdOrganisation(),
      idEcole: affectation.obtenirIdEcole(),
      idEleve: inscription.obtenirIdEleve(),
      idAffectationClasse: affectation.obtenirId(),
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      idClassePedagogique: affectation.obtenirIdClassePedagogique(),
      declenchePar: entree.idUtilisateur,
      dateEvenement: new Date(`${entree.dateAffectation}T00:00:00.000Z`),
      description: entree.motifAffectation,
    });
    await this.eventBus?.publier(affectation.recupererEvenements(), {
      organisationId: affectation.obtenirIdOrganisation(),
      ecoleId: affectation.obtenirIdEcole(),
      utilisateurId: entree.idUtilisateur,
    });
    affectation.viderEvenements();

    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
