import { UseCase } from '../../../../../shared/application/UseCase';
import { Ecole } from '../../../domain/aggregates/Ecole';
import { ErreurEcoleDejaExistante } from '../../../domain/exceptions/ErreurEcoleDejaExistante';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { ErreurModeExploitationInvalide } from '../../../domain/exceptions/ErreurModeExploitationInvalide';
import { ErreurOrganisationInactive } from '../../../domain/exceptions/ErreurOrganisationInactive';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ModeExploitation } from '../../../domain/value-objects/ModeExploitation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { CreerEcoleEntree } from '../../dto/input/CreerEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

interface InitialisationConfigurationEcolePort {
  amorcerEcole(params: {
    readonly organisationId: string;
    readonly ecoleId: string;
    readonly actorId?: string;
  }): Promise<unknown>;
}

// Cette interface represente la sortie du cas d'usage CreerEcole.
export interface SortieCreerEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre la creation d'une ecole.
export class CreerEcole implements UseCase<CreerEcoleEntree, SortieCreerEcole> {
  private readonly depotEcole: DepotEcole;
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une ecole.
  constructor(
    depotEcole: DepotEcole,
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
    private readonly initialisationConfiguration?: InitialisationConfigurationEcolePort,
  ) {
    this.depotEcole = depotEcole;
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
  }

  // Cette methode cree une ecole apres validation de l'entree et verification du rattachement organisationnel.
  public async executer(entree: CreerEcoleEntree): Promise<SortieCreerEcole> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_ECOLE',
      entreeValidee.creePar,
      horodatageCreation,
    );

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide(
        "L'organisation de rattachement est introuvable.",
      );
    }

    if (!organisation.estActif()) {
      throw new ErreurOrganisationInactive(
        "Une organisation inactive ne peut pas recevoir de nouvelle ecole.",
      );
    }

    const ecoleParCode = await this.depotEcole.trouverParCode(entreeValidee.code);

    if (ecoleParCode !== null) {
      throw new ErreurEcoleDejaExistante(
        'Une ecole avec ce code existe deja.',
      );
    }

    const ecole = new Ecole(
      new EcoleId(),
      organisation.obtenirId(),
      entreeValidee.code,
      entreeValidee.nom,
      entreeValidee.modeExploitation,
      entreeValidee.sigle,
      entreeValidee.adresse,
      entreeValidee.telephone,
      entreeValidee.email,
      entreeValidee.provinceEducationnelle,
      entreeValidee.ville,
      entreeValidee.communeOuTerritoire,
      entreeValidee.creePar,
      true,
      horodatageCreation,
    );

    await this.depotEcole.sauvegarder(ecole);
    await this.initialisationConfiguration?.amorcerEcole({
      organisationId: organisation.obtenirId().obtenirValeur(),
      ecoleId: ecole.obtenirId().obtenirValeur(),
      actorId: entreeValidee.creePar,
    });

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(entree: CreerEcoleEntree): CreerEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage CreerEcole est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
      code: this.validerTexteObligatoire(entree.code, 'code'),
      nom: this.validerTexteObligatoire(entree.nom, 'nom'),
      modeExploitation: this.validerModeExploitation(entree.modeExploitation),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
      sigle: this.validerTexteOptionnel(entree.sigle),
      adresse: this.validerTexteOptionnel(entree.adresse),
      telephone: this.validerTexteOptionnel(entree.telephone),
      email: this.validerTexteOptionnel(entree.email),
      provinceEducationnelle: this.validerTexteOptionnel(entree.provinceEducationnelle),
      ville: this.validerTexteOptionnel(entree.ville),
      communeOuTerritoire: this.validerTexteOptionnel(entree.communeOuTerritoire),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurEcoleInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerModeExploitation(valeur: ModeExploitation): ModeExploitation {
    if (!Object.values(ModeExploitation).includes(valeur)) {
      throw new ErreurModeExploitationInvalide(
        "Le mode d'exploitation fourni est invalide.",
      );
    }

    return valeur;
  }
}
