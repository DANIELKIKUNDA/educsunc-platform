import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { InscriptionScolaireMapper } from '../../mappers/InscriptionScolaireMapper';

// Ce fichier contient le cas d'usage de consultation d'une inscription.
export interface ConsulterInscriptionScolaireEntree { idInscriptionScolaire: string }
export interface SortieConsulterInscriptionScolaire { inscription: InscriptionScolaireSortieDTO }

/** Ce cas d'usage retourne une inscription scolaire. */
export class ConsulterInscriptionScolaire implements UseCase<ConsulterInscriptionScolaireEntree, SortieConsulterInscriptionScolaire> {
  constructor(private readonly depotInscription: DepotInscriptionScolaire) {}

  /** Execute la consultation d'une inscription. */
  public async executer(entree: ConsulterInscriptionScolaireEntree): Promise<SortieConsulterInscriptionScolaire> {
    const inscription = await this.depotInscription.trouverParId(entree.idInscriptionScolaire);
    if (inscription === null) throw new ErreurRessourceIntrouvable('Inscription introuvable.');
    return { inscription: InscriptionScolaireMapper.versSortie(inscription) };
  }
}
