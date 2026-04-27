import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

// Ce fichier contient le cas d'usage d'annulation d'une inscription scolaire.
export interface AnnulerInscriptionScolaireEntree extends ContexteCommandeScolariteDTO { idInscriptionScolaire: string }
export interface SortieAnnulerInscriptionScolaire { inscription: InscriptionScolaireSortieDTO }

/** Ce cas d'usage annule une inscription sans la supprimer. */
export class AnnulerInscriptionScolaire implements UseCase<AnnulerInscriptionScolaireEntree, SortieAnnulerInscriptionScolaire> {
  constructor(
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly serviceConcurrence: ServiceApplicationConcurrence = new ServiceApplicationConcurrence(),
  ) {}

  /** Execute l'annulation de l'inscription. */
  public async executer(entree: AnnulerInscriptionScolaireEntree): Promise<SortieAnnulerInscriptionScolaire> {
    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);

    if (inscription === null) {
      throw new ErreurRessourceIntrouvable('Inscription introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, inscription.obtenirVersion());
    inscription.annuler(entree.idUtilisateur);
    await this.depotInscription.sauvegarder(inscription);

    return { inscription: InscriptionScolaireMapper.versSortie(inscription) };
  }
}
