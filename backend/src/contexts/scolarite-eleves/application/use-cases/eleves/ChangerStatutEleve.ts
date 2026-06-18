import { UseCase } from '../../../../../shared/application/UseCase';
import type { AutorisationCycleVieElevePort } from '../../ports';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';
import { HistorisationParcoursScolaire } from '../../services/HistorisationParcoursScolaire';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier contient le cas d'usage generique de changement de statut d'un eleve.
export interface ChangerStatutEleveEntree extends ContexteCommandeScolariteDTO {
  idEleve: string;
  nouveauStatut: StatutEleve;
}
export interface SortieChangerStatutEleve { eleve: EleveDetailSortieDTO }

/** Ce cas d'usage delegue au domaine le changement de statut demande. */
export class ChangerStatutEleve implements UseCase<ChangerStatutEleveEntree, SortieChangerStatutEleve> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
    private readonly autorisationCycleVieEleve?: AutorisationCycleVieElevePort,
    private readonly historisationParcours?: HistorisationParcoursScolaire,
    private readonly eventBus?: DomainEventBusPort,
    private readonly resoudreTypeEvenementParcours: (
      nouveauStatut: StatutEleve,
    ) => TypeEvenementParcours | undefined = ChangerStatutEleve.resoudreTypeEvenementParDefaut,
  ) {}

  /** Execute le changement de statut. */
  public async executer(entree: ChangerStatutEleveEntree): Promise<SortieChangerStatutEleve> {
    const eleve = await this.depotEleve.trouverParId(entree.idEleve);

    if (eleve === null) {
      throw new ErreurRessourceIntrouvable('Eleve introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, eleve.obtenirVersion());
    await this.autorisationCycleVieEleve?.verifierMutationStatutEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: eleve.obtenirIdOrganisation(),
      idEcole: eleve.obtenirIdEcole(),
      idEleve: entree.idEleve,
      nouveauStatut: entree.nouveauStatut,
    });

    if (entree.nouveauStatut === StatutEleve.ACTIF) eleve.reactiver(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.INACTIF) eleve.marquerInactif(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.ABANDONNE) eleve.marquerAbandonne(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.TRANSFERE) eleve.marquerTransfere(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.SUSPENDU) eleve.suspendre(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.DECEDE) eleve.marquerDecede(entree.idUtilisateur);

    await this.depotEleve.sauvegarder(eleve);
    const typeEvenementParcours = this.resoudreTypeEvenementParcours(entree.nouveauStatut);
    if (typeEvenementParcours !== undefined) {
      await this.historisationParcours?.enregistrerMutationStatut({
        idOrganisation: eleve.obtenirIdOrganisation(),
        idEcole: eleve.obtenirIdEcole(),
        idEleve: entree.idEleve,
        typeEvenement: typeEvenementParcours,
        declenchePar: entree.idUtilisateur,
      });
    }
    await this.eventBus?.publier(eleve.recupererEvenements(), {
      organisationId: eleve.obtenirIdOrganisation(),
      ecoleId: eleve.obtenirIdEcole(),
      utilisateurId: entree.idUtilisateur,
    });
    eleve.viderEvenements();

    return { eleve: EleveMapper.versDetail(eleve) };
  }

  private static resoudreTypeEvenementParDefaut(
    nouveauStatut: StatutEleve,
  ): TypeEvenementParcours | undefined {
    if (nouveauStatut === StatutEleve.ABANDONNE) return TypeEvenementParcours.ABANDON;
    if (nouveauStatut === StatutEleve.TRANSFERE) return TypeEvenementParcours.TRANSFERT;
    if (nouveauStatut === StatutEleve.SUSPENDU) return TypeEvenementParcours.SUSPENSION;
    if (nouveauStatut === StatutEleve.DECEDE) return TypeEvenementParcours.DECES;
    if (nouveauStatut === StatutEleve.ACTIF) return TypeEvenementParcours.REINTEGRATION;
    return undefined;
  }
}
