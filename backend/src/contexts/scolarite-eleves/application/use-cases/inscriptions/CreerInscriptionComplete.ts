import { UseCase } from '../../../../../shared/application/UseCase';
import { CreerInscriptionCompleteEntreeDTO } from '../../dto/input/CreerInscriptionCompleteEntreeDTO';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { EleveDetailSortieDTO } from '../../dto/output/EleveDetailSortieDTO';
import { InscriptionScolaireSortieDTO } from '../../dto/output/InscriptionScolaireSortieDTO';
import { CreerEleve } from '../eleves/CreerEleve';
import { AffecterEleveAClasse } from '../affectations/AffecterEleveAClasse';
import { CreerInscriptionScolaire } from './CreerInscriptionScolaire';

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
    private readonly affecterEleveAClasse?: AffecterEleveAClasse,
  ) {}

  /** Execute l'inscription complete. */
  public async executer(entree: CreerInscriptionCompleteEntreeDTO): Promise<SortieCreerInscriptionComplete> {
    const { eleve } = await this.creerEleve.executer(entree.eleve);
    const { inscription } = await this.creerInscription.executer(entree.inscription);
    const affectation = entree.affectation && this.affecterEleveAClasse
      ? (await this.affecterEleveAClasse.executer(entree.affectation)).affectation
      : undefined;

    return { eleve, inscription, affectation };
  }
}
