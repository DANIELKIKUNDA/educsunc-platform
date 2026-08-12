import { UseCase } from '../../../../../shared/application/UseCase';
import { CreerInscriptionCompleteEntreeDTO } from '../../dto/input/CreerInscriptionCompleteEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { ErreurValidationDTO } from '../../exceptions/ErreurValidationDTO';
import type { AuditPort, AutorisationInscriptionCompletePort } from '../../ports';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';
import { CreerEleve } from '../eleves/CreerEleve';
import { AffecterEleveAClasse } from '../affectations/AffecterEleveAClasse';
import { CreerInscriptionScolaire } from './CreerInscriptionScolaire';
import { ValiderInscriptionScolaire } from './ValiderInscriptionScolaire';

// Ce fichier contient le cas d'usage d'inscription complete.
export interface SortieCreerInscriptionComplete {
  eleve: EleveDetailSortieDTO;
  inscription: InscriptionScolaireSortieDTO;
  affectation?: AffectationClasseSortieDTO;
}

/** Ce cas d'usage coordonne creation eleve, inscription et affectation optionnelle. */
export class CreerInscriptionComplete implements UseCase<CreerInscriptionCompleteEntreeDTO, SortieCreerInscriptionComplete> {
  constructor(
    private readonly creerEleve: CreerEleve,
    private readonly creerInscription: CreerInscriptionScolaire,
    private readonly validerInscription?: ValiderInscriptionScolaire,
    private readonly affecterEleveAClasse?: AffecterEleveAClasse,
    private readonly autorisationInscriptionComplete?: AutorisationInscriptionCompletePort,
    private readonly serviceTransaction: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
    private readonly audit?: AuditPort,
  ) {}

  /** Execute l'inscription complete. */
  public async executer(entree: CreerInscriptionCompleteEntreeDTO): Promise<SortieCreerInscriptionComplete> {
    this.validerCoherence(entree);
    await this.autorisationInscriptionComplete?.verifierCreationInscriptionComplete({
      idUtilisateur: entree.eleve.idUtilisateur,
      idOrganisation: entree.eleve.idOrganisation,
      idEcole: entree.eleve.idEcole,
    });

    return this.serviceTransaction.executerDansTransaction(async () => {
      const { eleve } = await this.creerEleve.executer(entree.eleve);
      let { inscription } = await this.creerInscription.executer(entree.inscription);

      if (entree.affectation && this.validerInscription) {
        ({ inscription } = await this.validerInscription.executer({
          ...entree.inscription,
          idInscriptionScolaire: entree.inscription.idInscriptionScolaire,
          versionAttendue: inscription.version,
        }));
      }

      const affectation = entree.affectation && this.affecterEleveAClasse
        ? (await this.affecterEleveAClasse.executer(entree.affectation)).affectation
        : undefined;

      await this.audit?.journaliserAction({
        action: 'ELEVE_INSCRIT',
        idOrganisation: entree.eleve.idOrganisation,
        idEcole: entree.eleve.idEcole,
        idUtilisateur: entree.eleve.idUtilisateur,
        referenceMetier: inscription.idInscriptionScolaire,
      });

      return { eleve, inscription, affectation };
    });
  }

  private validerCoherence(entree: CreerInscriptionCompleteEntreeDTO): void {
    if (entree.eleve.idEleve !== entree.inscription.idEleve) {
      throw new ErreurValidationDTO(
        'L identifiant eleve doit etre coherent entre eleve et inscription.',
      );
    }

    if (
      entree.affectation
      && entree.affectation.idInscriptionScolaire !== entree.inscription.idInscriptionScolaire
    ) {
      throw new ErreurValidationDTO(
        'L identifiant inscription doit etre coherent entre inscription et affectation.',
      );
    }
  }
}
