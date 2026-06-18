import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { DepotInscriptionScolaire } from '../../../domain/repositories/DepotInscriptionScolaire';
import type { AutorisationOrganisationScolaritePort } from '../../ports';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { StatutInscription } from '../../../domain/value-objects/StatutInscription';

// Ce fichier contient le cas d'usage de liste des alertes de scolarite organisationnelle.
export interface AlerteScolariteOrganisationSortie {
  niveau: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
  message: string;
  referenceMetier?: string;
}
export interface ListerAlertesScolariteOrganisationEntree {
  idOrganisation: string;
  idUtilisateur: string;
  idAnneeScolaire?: string;
}

/** Ce cas d'usage produit des alertes organisationnelles simples a partir des depots reels. */
export class ListerAlertesScolariteOrganisation implements UseCase<ListerAlertesScolariteOrganisationEntree, AlerteScolariteOrganisationSortie[]> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly depotFamille: DepotFamille,
    private readonly depotInscription: DepotInscriptionScolaire,
    private readonly autorisationOrganisation?: AutorisationOrganisationScolaritePort,
  ) {}
  /** Execute la liste des alertes. */
  public async executer(entree: ListerAlertesScolariteOrganisationEntree): Promise<AlerteScolariteOrganisationSortie[]> {
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
    const alertes: AlerteScolariteOrganisationSortie[] = [];
    const elevesActifs = eleves.filter((eleve) => eleve.obtenirStatutGlobal() === StatutEleve.ACTIF);
    const inscriptionsActives = inscriptions.filter((inscription) => inscription.obtenirStatutInscription() === StatutInscription.VALIDEE);

    if (eleves.length === 0) {
      alertes.push({
        niveau: 'CRITIQUE',
        message: 'Aucun eleve n est encore rattache a cette organisation.',
        referenceMetier: entree.idOrganisation,
      });
    }

    if (familles.length === 0) {
      alertes.push({
        niveau: 'AVERTISSEMENT',
        message: 'Aucune famille n est encore enregistree dans cette organisation.',
        referenceMetier: entree.idOrganisation,
      });
    }

    if (entree.idAnneeScolaire !== undefined && inscriptionsActives.length === 0) {
      alertes.push({
        niveau: 'CRITIQUE',
        message: "Aucune inscription active n est disponible pour l annee scolaire demandee.",
        referenceMetier: entree.idAnneeScolaire,
      });
    }

    if (eleves.length > 0 && elevesActifs.length === 0) {
      alertes.push({
        niveau: 'AVERTISSEMENT',
        message: 'Tous les eleves connus de cette organisation sont actuellement inactifs.',
        referenceMetier: entree.idOrganisation,
      });
    }

    if (alertes.length === 0) {
      alertes.push({
        niveau: 'INFO',
        message: 'Aucune alerte critique ou avertissement n est remontee pour cette organisation.',
        referenceMetier: entree.idOrganisation,
      });
    }

    return alertes;
  }
}
