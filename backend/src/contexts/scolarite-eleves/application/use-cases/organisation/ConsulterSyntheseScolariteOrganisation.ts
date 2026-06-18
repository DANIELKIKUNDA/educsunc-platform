import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import { SyntheseScolariteOrganisationSortieDTO } from '../../dto/output/SyntheseScolariteOrganisationSortieDTO';
import type { AutorisationOrganisationScolaritePort } from '../../ports';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { StatutInscription } from '../../../domain/value-objects/StatutInscription';

// Ce fichier contient le cas d'usage de synthese organisationnelle.
export interface ConsulterSyntheseScolariteOrganisationEntree {
  idOrganisation: string;
  idUtilisateur: string;
  idAnneeScolaire?: string;
}

/** Ce cas d'usage retourne une synthese organisationnelle reelle a partir des depots existants. */
export class ConsulterSyntheseScolariteOrganisation implements UseCase<ConsulterSyntheseScolariteOrganisationEntree, SyntheseScolariteOrganisationSortieDTO> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly depotFamille: DepotFamille,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly autorisationOrganisation?: AutorisationOrganisationScolaritePort,
  ) {}
  /** Execute la consultation de synthese organisationnelle. */
  public async executer(entree: ConsulterSyntheseScolariteOrganisationEntree): Promise<SyntheseScolariteOrganisationSortieDTO> {
    await this.autorisationOrganisation?.verifierLectureOrganisationScolarite({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
    });

    const [eleves, familles, inscriptions] = await Promise.all([
      this.depotEleve.listerParOrganisation(entree.idOrganisation),
      this.depotFamille.listerParOrganisation(entree.idOrganisation),
      entree.idAnneeScolaire === undefined
        ? Promise.resolve([])
        : this.depotInscription.listerParOrganisationEtAnnee(entree.idOrganisation, entree.idAnneeScolaire),
    ]);
    const ecoles = new Set([
      ...eleves.map((eleve) => eleve.obtenirIdEcole()),
      ...familles.map((famille) => famille.obtenirIdEcole()),
      ...inscriptions.map((inscription) => inscription.obtenirIdEcole()),
    ]);

    return {
      idOrganisation: entree.idOrganisation,
      totalEcoles: ecoles.size,
      totalEleves: eleves.length,
      totalElevesActifs: eleves.filter((eleve) => eleve.obtenirStatutGlobal() === StatutEleve.ACTIF).length,
      totalFamilles: familles.length,
      totalInscriptionsActives: inscriptions.filter((inscription) => inscription.obtenirStatutInscription() === StatutInscription.VALIDEE).length,
    };
  }
}
