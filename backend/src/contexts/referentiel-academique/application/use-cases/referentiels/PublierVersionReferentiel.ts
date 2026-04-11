import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { ReferentielProgrammeId } from '../../../domain/value-objects/ReferentielProgrammeId';
import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';
import { PublierVersionReferentielEntree } from '../../dto/input/PublierVersionReferentielEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage PublierVersionReferentiel.
export interface SortiePublierVersionReferentiel {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la publication d'une version de referentiel sur un referentiel parent explicite.
export class PublierVersionReferentiel
  implements UseCase<PublierVersionReferentielEntree, SortiePublierVersionReferentiel>
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la publication d'une version.
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

  // Cette methode confirme la publication d'une version deja rattachee a son referentiel parent.
  public async executer(
    entree: PublierVersionReferentielEntree,
  ): Promise<SortiePublierVersionReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    const horodatagePublication = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'PUBLIER_VERSION_REFERENTIEL',
      entreeValidee.publiePar,
      horodatagePublication,
    );

    const referentielProgramme = await this.depotReferentielProgramme.trouverParId(
      new ReferentielProgrammeId(entreeValidee.idReferentielProgramme),
    );

    if (referentielProgramme === null) {
      throw new ErreurProgrammeInvalide(
        'Le referentiel programme parent de la version est introuvable.',
      );
    }

    const versionExistante = referentielProgramme.trouverVersionParCode(entreeValidee.codeVersion);

    if (versionExistante === null) {
      throw new ErreurVersionReferentielInvalide(
        "La version de referentiel a publier est introuvable. Importez d'abord le referentiel complet avec ses lignes officielles.",
      );
    }

    this.verifierCoherenceVersionExistante(versionExistante, entreeValidee);
    await this.serviceJournalAudit.journaliser({
      action: 'PUBLIER_VERSION_REFERENTIEL',
      acteur: entreeValidee.publiePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: versionExistante.obtenirId().obtenirValeur(),
      details: {
        idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
        codeVersion: versionExistante.obtenirCodeVersion(),
        anneeReference: versionExistante.obtenirAnneeReference(),
        dejaExistante: true,
      },
      creeLe: horodatagePublication,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        versionExistante,
      ),
    };
  }

  private validerEntree(
    entree: PublierVersionReferentielEntree,
  ): PublierVersionReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurVersionReferentielInvalide(
        "L'entree du cas d'usage PublierVersionReferentiel est obligatoire.",
      );
    }

    return {
      idReferentielProgramme: this.validerTexteObligatoire(
        entree.idReferentielProgramme,
        'idReferentielProgramme',
      ),
      codeVersion: this.validerTexteObligatoire(entree.codeVersion, 'codeVersion'),
      anneeReference: this.validerTexteObligatoire(entree.anneeReference, 'anneeReference'),
      datePublication: this.validerDate(entree.datePublication, 'datePublication'),
      sourceImport: this.validerSource(entree.sourceImport),
      motifPublication: this.validerTexteOptionnel(entree.motifPublication),
      publiePar: this.validerTexteObligatoire(entree.publiePar, 'publiePar'),
    };
  }

  private verifierCoherenceVersionExistante(
    versionExistante: import('../../../domain/aggregates/VersionReferentielProgramme').VersionReferentielProgramme,
    entree: PublierVersionReferentielEntree,
  ): void {
    if (
      versionExistante.obtenirAnneeReference() !== entree.anneeReference
      || versionExistante.obtenirDatePublication().toISOString() !== entree.datePublication.toISOString()
      || versionExistante.obtenirSourceImport() !== entree.sourceImport
      || versionExistante.obtenirMotifPublication() !== entree.motifPublication
    ) {
      throw new ErreurVersionReferentielInvalide(
        'Une version de referentiel avec ce code existe deja avec une definition differente.',
      );
    }
  }

  private validerTexteObligatoire(valeur: string | undefined, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurVersionReferentielInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurVersionReferentielInvalide(
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
      throw new ErreurVersionReferentielInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurVersionReferentielInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }

  private validerSource(valeur: SourceReferentiel): SourceReferentiel {
    if (!Object.values(SourceReferentiel).includes(valeur)) {
      throw new ErreurVersionReferentielInvalide(
        "La source du referentiel est invalide.",
      );
    }

    return valeur;
  }
}
