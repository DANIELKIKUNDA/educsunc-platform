import { UseCase } from '../../../../../shared/application/UseCase';
import { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { MoteurAffectationClasse } from '../../../domain/services/MoteurAffectationClasse';
import { AffecterEleveAClasseEntreeDTO } from '../../dto/input/AffecterEleveAClasseEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';

// Ce fichier contient le cas d'usage d'affectation d'un eleve a une classe.
export interface SortieAffecterEleveAClasse { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage cree une affectation active pour une inscription validee. */
export class AffecterEleveAClasse implements UseCase<AffecterEleveAClasseEntreeDTO, SortieAffecterEleveAClasse> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly moteurAffectation: MoteurAffectationClasse = new MoteurAffectationClasse(),
  ) {}

  /** Execute l'affectation en classe. */
  public async executer(entree: AffecterEleveAClasseEntreeDTO): Promise<SortieAffecterEleveAClasse> {
    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);
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

    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
