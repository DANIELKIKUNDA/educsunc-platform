import { UseCase } from '../../../../../shared/application/UseCase';
import { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { MoteurInscriptionEleve } from '../../../domain/services/MoteurInscriptionEleve';
import { CreerInscriptionScolaireEntreeDTO } from '../../dto/input/CreerInscriptionScolaireEntreeDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';
import { HistorisationParcoursScolaire } from '../../services/HistorisationParcoursScolaire';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

// Ce fichier contient le cas d'usage de creation d'une inscription scolaire.
export interface SortieCreerInscriptionScolaire { inscription: InscriptionScolaireSortieDTO }

/** Ce cas d'usage orchestre la creation annuelle d'une inscription. */
export class CreerInscriptionScolaire implements UseCase<CreerInscriptionScolaireEntreeDTO, SortieCreerInscriptionScolaire> {
  constructor(
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly depotEleve: DepotEleve,
    private readonly moteurInscription: MoteurInscriptionEleve = new MoteurInscriptionEleve(),
    private readonly historisationParcours?: HistorisationParcoursScolaire,
    private readonly eventBus?: DomainEventBusPort,
  ) {}

  /** Execute la creation de l'inscription. */
  public async executer(entree: CreerInscriptionScolaireEntreeDTO): Promise<SortieCreerInscriptionScolaire> {
    const eleve = await this.depotEleve.trouverParId(entree.idEleve);
    const inscriptionActiveExisteDeja = await this.depotInscription.existeInscriptionActiveParEleveEtAnnee(entree.idEleve, entree.idAnneeScolaire);

    this.moteurInscription.verifierCreationPossible({
      eleve,
      anneeScolaireExiste: true,
      anneeScolaireActiveOuSelectionnee: true,
      inscriptionActiveExisteDeja,
    });

    const inscription = InscriptionScolaire.creer({
      idInscriptionScolaire: entree.idInscriptionScolaire,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idEleve: entree.idEleve,
      idAnneeScolaire: entree.idAnneeScolaire,
      dateInscription: entree.dateInscription,
      origineInscription: entree.origineInscription,
      numeroOrdre: entree.numeroOrdre,
      observation: entree.observation,
      creePar: entree.idUtilisateur,
    });

    await this.depotInscription.sauvegarder(inscription);
    await this.historisationParcours?.enregistrerInscription({
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idEleve: entree.idEleve,
      idInscriptionScolaire: entree.idInscriptionScolaire,
      idAnneeScolaire: entree.idAnneeScolaire,
      declenchePar: entree.idUtilisateur,
      dateEvenement: new Date(`${entree.dateInscription}T00:00:00.000Z`),
    });
    await this.eventBus?.publier(inscription.recupererEvenements(), {
      organisationId: entree.idOrganisation,
      ecoleId: entree.idEcole,
      utilisateurId: entree.idUtilisateur,
    });
    inscription.viderEvenements();

    return { inscription: InscriptionScolaireMapper.versSortie(inscription) };
  }
}
