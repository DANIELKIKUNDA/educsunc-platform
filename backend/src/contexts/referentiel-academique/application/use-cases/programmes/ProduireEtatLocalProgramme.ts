import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { PolicyProgrammeLocal } from '../../../domain/policies/PolicyProgrammeLocal';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { MoteurProgrammeLocal } from '../../../domain/services/MoteurProgrammeLocal';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { ProduireEtatLocalProgrammeEntree } from '../../dto/input/ProduireEtatLocalProgrammeEntree';
import { EtatLocalProgrammeNiveauSortie } from '../../dto/output/EtatLocalProgrammeNiveauSortie';
import { EtatLocalProgrammeNiveauApplicationMapper } from '../../mappers/EtatLocalProgrammeNiveauApplicationMapper';

// Cette interface represente la sortie du cas d'usage ProduireEtatLocalProgramme.
export interface SortieProduireEtatLocalProgramme {
  etatLocalProgramme: EtatLocalProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre la production de l'etat local d'un programme.
export class ProduireEtatLocalProgramme
  implements UseCase<ProduireEtatLocalProgrammeEntree, SortieProduireEtatLocalProgramme>
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly moteurProgrammeLocal: MoteurProgrammeLocal;
  private readonly policyProgrammeLocal: PolicyProgrammeLocal;

  // Ce constructeur injecte les dependances applicatives necessaires a la production de l'etat local du programme.
  constructor(
    depotProgrammeNiveau: DepotProgrammeNiveau,
    moteurProgrammeLocal: MoteurProgrammeLocal = new MoteurProgrammeLocal(),
    policyProgrammeLocal: PolicyProgrammeLocal = new PolicyProgrammeLocal(),
  ) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.moteurProgrammeLocal = moteurProgrammeLocal;
    this.policyProgrammeLocal = policyProgrammeLocal;
  }

  // Cette methode produit un etat local exploitable pour un programme niveau deja valide.
  public async executer(
    entree: ProduireEtatLocalProgrammeEntree,
  ): Promise<SortieProduireEtatLocalProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
      new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
    );

    if (programmeNiveau === null) {
      throw new ErreurProgrammeNiveauInvalide(
        "Le programme niveau dont l'etat local est demande est introuvable.",
      );
    }

    this.policyProgrammeLocal.verifierValidationObligatoire(programmeNiveau);

    const etatLocalProgramme = this.moteurProgrammeLocal.produireEtatLocal(programmeNiveau);

    return {
      etatLocalProgramme: EtatLocalProgrammeNiveauApplicationMapper.versSortie(
        etatLocalProgramme,
      ),
    };
  }

  private validerEntree(
    entree: ProduireEtatLocalProgrammeEntree,
  ): ProduireEtatLocalProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage ProduireEtatLocalProgramme est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
