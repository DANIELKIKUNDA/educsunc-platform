import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { EleveMapper } from '../../mappers/EleveMapper';
import { ServiceApplicationConcurrence } from '../../services/ServiceApplicationConcurrence';

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
  ) {}

  /** Execute le changement de statut. */
  public async executer(entree: ChangerStatutEleveEntree): Promise<SortieChangerStatutEleve> {
    const eleve = await this.depotEleve.trouverParId(entree.idEleve);

    if (eleve === null) {
      throw new ErreurRessourceIntrouvable('Eleve introuvable.');
    }

    this.serviceConcurrence.verifierVersion(entree.versionAttendue, eleve.obtenirVersion());

    if (entree.nouveauStatut === StatutEleve.ACTIF) eleve.reactiver(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.INACTIF) eleve.marquerInactif(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.ABANDONNE) eleve.marquerAbandonne(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.TRANSFERE) eleve.marquerTransfere(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.SUSPENDU) eleve.suspendre(entree.idUtilisateur);
    if (entree.nouveauStatut === StatutEleve.DECEDE) eleve.marquerDecede(entree.idUtilisateur);

    await this.depotEleve.sauvegarder(eleve);

    return { eleve: EleveMapper.versDetail(eleve) };
  }
}
