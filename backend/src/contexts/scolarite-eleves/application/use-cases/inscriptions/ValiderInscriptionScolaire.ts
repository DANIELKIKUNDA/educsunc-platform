import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage de validation d'une inscription scolaire.
export interface ValiderInscriptionScolaireEntree extends ContexteCommandeScolariteDTO { idInscriptionScolaire: string }
export interface SortieValiderInscriptionScolaire { inscription: InscriptionScolaireSortieDTO }

/** Ce cas d'usage valide une inscription existante. */
export class ValiderInscriptionScolaire implements UseCase<ValiderInscriptionScolaireEntree, SortieValiderInscriptionScolaire> {
  constructor(
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute la validation de l'inscription. */
  public async executer(entree: ValiderInscriptionScolaireEntree): Promise<SortieValiderInscriptionScolaire> {
    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);

    if (inscription === null) throw new ErreurRessourceIntrouvable('Inscription introuvable.');

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, inscription.obtenirVersion());
    inscription.valider(entree.idUtilisateur);
    await this.depotInscription.sauvegarder(inscription);

    return { inscription: InscriptionScolaireMapper.versSortie(inscription) };
  }
}
