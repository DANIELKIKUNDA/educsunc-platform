import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { ChangerEleveDeClasseEntreeDTO } from '../../dto/input/ChangerEleveDeClasseEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';
import { HistorisationParcoursScolaire } from '../../services/HistorisationParcoursScolaire';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import type { AutorisationAffectationClassePort } from '../../ports';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier contient le cas d'usage de changement de classe.
export interface SortieChangerEleveDeClasse { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage change la classe d'une affectation active. */
export class ChangerEleveDeClasse implements UseCase<ChangerEleveDeClasseEntreeDTO, SortieChangerEleveDeClasse> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly autorisationAffectationClasse?: AutorisationAffectationClassePort,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
    private readonly historisationParcours?: HistorisationParcoursScolaire,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  /** Execute le changement de classe. */
  public async executer(entree: ChangerEleveDeClasseEntreeDTO): Promise<SortieChangerEleveDeClasse> {
    await this.autorisationAffectationClasse?.verifierChangementClasse({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idInscriptionScolaire: entree.idInscriptionScolaire,
      idNouvelleClassePedagogique: entree.idNouvelleClassePedagogique,
    });

    const affectation = await this.depotAffectation.trouverAffectationActiveParInscription(entree.idInscriptionScolaire);

    if (affectation === null) throw new ErreurRessourceIntrouvable('Affectation active introuvable.');

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, affectation.obtenirVersion());
    affectation.changerClasse(entree.idNouvelleClassePedagogique, entree.motifAffectation, entree.idUtilisateur);
    await this.depotAffectation.sauvegarder(affectation);
    const inscription = await this.depotInscription.trouverParId(affectation.obtenirIdInscriptionScolaire());
    if (inscription !== null) {
      await this.historisationParcours?.enregistrerChangementClasse({
        idOrganisation: affectation.obtenirIdOrganisation(),
        idEcole: affectation.obtenirIdEcole(),
        idEleve: inscription.obtenirIdEleve(),
        idAffectationClasse: affectation.obtenirId(),
        idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
        idClassePedagogique: affectation.obtenirIdClassePedagogique(),
        declenchePar: entree.idUtilisateur,
        description: entree.motifAffectation,
      });
    }
    await this.eventBus?.publier(affectation.recupererEvenements(), {
      organisationId: affectation.obtenirIdOrganisation(),
      ecoleId: affectation.obtenirIdEcole(),
      utilisateurId: entree.idUtilisateur,
    });
    affectation.viderEvenements();

    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
