import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurActivationVersionImpossible } from '../../../domain/exceptions/ErreurActivationVersionImpossible';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import { ActiverVersionReferentielEntree } from '../../dto/input/ActiverVersionReferentielEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage ActiverVersionReferentiel.
export interface SortieActiverVersionReferentiel {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre l'activation d'une version de referentiel via son agregat parent.
export class ActiverVersionReferentiel
  implements UseCase<ActiverVersionReferentielEntree, SortieActiverVersionReferentiel>
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a l'activation d'une version.
  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode active une version du referentiel parent et desactive les autres.
  public async executer(
    entree: ActiverVersionReferentielEntree,
  ): Promise<SortieActiverVersionReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageActivation = new Date();
    const idVersionReferentielProgramme = new VersionReferentielProgrammeId(
      entreeValidee.idVersionReferentielProgramme,
    );

    this.policyAudit.verifierTracabiliteObligatoire(
      'ACTIVER_VERSION_REFERENTIEL',
      entreeValidee.activePar,
      horodatageActivation,
    );

    const referentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(
      idVersionReferentielProgramme,
    );

    if (referentielProgramme === null) {
      throw new ErreurVersionReferentielInvalide(
        "La version de referentiel a activer est introuvable.",
      );
    }

    const versionReferentielProgramme = referentielProgramme.trouverVersionParId(
      idVersionReferentielProgramme,
    );

    if (versionReferentielProgramme === null) {
      throw new ErreurVersionReferentielInvalide(
        "La version de referentiel a activer n'appartient a aucun referentiel charge.",
      );
    }

    if (!versionReferentielProgramme.estActive()) {
      try {
        referentielProgramme.activerVersion(idVersionReferentielProgramme);
      } catch (erreur) {
        const message = erreur instanceof Error
          ? erreur.message
          : "L'activation de la version de referentiel a echoue.";

        throw new ErreurActivationVersionImpossible(message);
      }

      await this.depotReferentielProgramme.sauvegarder(referentielProgramme);
    }

    const versionActive = referentielProgramme.trouverVersionParId(idVersionReferentielProgramme)
      ?? versionReferentielProgramme;

    await this.serviceJournalAudit.journaliser({
      action: 'ACTIVER_VERSION_REFERENTIEL',
      acteur: entreeValidee.activePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: versionActive.obtenirId().obtenirValeur(),
      details: {
        idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
        codeVersion: versionActive.obtenirCodeVersion(),
        dejaActive: versionReferentielProgramme.estActive(),
      },
      creeLe: horodatageActivation,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        versionActive,
      ),
    };
  }

  private validerEntree(
    entree: ActiverVersionReferentielEntree,
  ): ActiverVersionReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurActivationVersionImpossible(
        "L'entree du cas d'usage ActiverVersionReferentiel est obligatoire.",
      );
    }

    return {
      idVersionReferentielProgramme: this.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      activePar: this.validerTexteObligatoire(entree.activePar, 'activePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurActivationVersionImpossible(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurActivationVersionImpossible(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
