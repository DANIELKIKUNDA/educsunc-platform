import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { CalendrierAcademique } from '../aggregates/CalendrierAcademique';
import { ProgrammeNiveau } from '../aggregates/ProgrammeNiveau';
import { ReferentielCours } from '../aggregates/ReferentielCours';
import { ReferentielProgramme } from '../aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../aggregates/VersionReferentielProgramme';

// Cette interface represente la politique metier associee a une entree de cache.
export interface ProfilCacheMetier {
  cle: string;
  ttlSecondes: number;
  etiquettes: string[];
}

// Cette interface represente les invalidations a transmettre a la couche technique.
export interface PlanInvalidationCache {
  cles: string[];
  etiquettes: string[];
}

// Ce moteur centralise la construction des cles de cache et les invalidations metier associees.
export class MoteurCache {
  private static readonly TTL_REFERENTIEL = 900;
  private static readonly TTL_PROGRAMME_LOCAL = 300;
  private static readonly TTL_CALENDRIER = 600;
  private static readonly TTL_COURS = 900;

  // Cette methode construit le profil de cache d'un referentiel programme officiel.
  public construireProfilReferentielProgramme(
    referentielProgramme: ReferentielProgramme,
    versionReferentielProgramme: VersionReferentielProgramme,
  ): ProfilCacheMetier {
    const classeId = referentielProgramme.obtenirClasseAcademiqueId().obtenirValeur();
    const version = this.normaliserFragment(versionReferentielProgramme.obtenirCodeVersion());
    const cle = this.construireCle(
      'referentiel-programme',
      referentielProgramme.obtenirId().obtenirValeur(),
      classeId,
      version,
    );

    return {
      cle,
      ttlSecondes: MoteurCache.TTL_REFERENTIEL,
      etiquettes: [
        'referentiel-programme',
        `classe:${classeId}`,
        `source:${versionReferentielProgramme.obtenirSourceImport()}`,
      ],
    };
  }

  // Cette methode construit le profil de cache d'un programme niveau local.
  public construireProfilProgrammeNiveau(programmeNiveau: ProgrammeNiveau): ProfilCacheMetier {
    const cle = this.construireCle(
      'programme-niveau',
      programmeNiveau.obtenirId().obtenirValeur(),
      programmeNiveau.obtenirEcoleId().obtenirValeur(),
      programmeNiveau.obtenirAnneeScolaireId().obtenirValeur(),
      programmeNiveau.obtenirClasseAcademiqueId().obtenirValeur(),
    );

    return {
      cle,
      ttlSecondes: MoteurCache.TTL_PROGRAMME_LOCAL,
      etiquettes: [
        'programme-niveau',
        `ecole:${programmeNiveau.obtenirEcoleId().obtenirValeur()}`,
        `annee:${programmeNiveau.obtenirAnneeScolaireId().obtenirValeur()}`,
        `classe:${programmeNiveau.obtenirClasseAcademiqueId().obtenirValeur()}`,
        `statut:${programmeNiveau.obtenirStatut()}`,
      ],
    };
  }

  // Cette methode construit le profil de cache d'un calendrier academique.
  public construireProfilCalendrier(calendrier: CalendrierAcademique): ProfilCacheMetier {
    const cle = this.construireCle(
      'calendrier-academique',
      calendrier.obtenirId().obtenirValeur(),
      calendrier.obtenirEcoleId().obtenirValeur(),
      calendrier.obtenirAnneeScolaireId().obtenirValeur(),
    );

    return {
      cle,
      ttlSecondes: MoteurCache.TTL_CALENDRIER,
      etiquettes: [
        'calendrier-academique',
        `ecole:${calendrier.obtenirEcoleId().obtenirValeur()}`,
        `annee:${calendrier.obtenirAnneeScolaireId().obtenirValeur()}`,
        `structure:${calendrier.obtenirTypeStructureEvaluation()}`,
      ],
    };
  }

  // Cette methode construit le profil de cache d'un cours du referentiel.
  public construireProfilCours(referentielCours: ReferentielCours): ProfilCacheMetier {
    const cle = this.construireCle(
      'referentiel-cours',
      referentielCours.obtenirId().obtenirValeur(),
      this.normaliserFragment(referentielCours.obtenirCode()),
    );

    return {
      cle,
      ttlSecondes: MoteurCache.TTL_COURS,
      etiquettes: [
        'referentiel-cours',
        `code:${this.normaliserFragment(referentielCours.obtenirCode())}`,
        `actif:${referentielCours.estActif()}`,
      ],
    };
  }

  // Cette methode determine le plan d'invalidation apres modification d'un referentiel officiel.
  public determinerInvalidationReferentielProgramme(
    referentielProgramme: ReferentielProgramme,
    versionReferentielProgramme: VersionReferentielProgramme,
  ): PlanInvalidationCache {
    return {
      cles: [this.construireProfilReferentielProgramme(
        referentielProgramme,
        versionReferentielProgramme,
      ).cle],
      etiquettes: [
        'referentiel-programme',
        `classe:${referentielProgramme.obtenirClasseAcademiqueId().obtenirValeur()}`,
      ],
    };
  }

  // Cette methode determine le plan d'invalidation apres modification d'un programme local.
  public determinerInvalidationProgrammeNiveau(
    programmeNiveau: ProgrammeNiveau,
  ): PlanInvalidationCache {
    return {
      cles: [this.construireProfilProgrammeNiveau(programmeNiveau).cle],
      etiquettes: [
        'programme-niveau',
        `ecole:${programmeNiveau.obtenirEcoleId().obtenirValeur()}`,
        `annee:${programmeNiveau.obtenirAnneeScolaireId().obtenirValeur()}`,
        `classe:${programmeNiveau.obtenirClasseAcademiqueId().obtenirValeur()}`,
      ],
    };
  }

  // Cette methode determine le plan d'invalidation apres modification d'un calendrier.
  public determinerInvalidationCalendrier(
    calendrier: CalendrierAcademique,
  ): PlanInvalidationCache {
    return {
      cles: [this.construireProfilCalendrier(calendrier).cle],
      etiquettes: [
        'calendrier-academique',
        `ecole:${calendrier.obtenirEcoleId().obtenirValeur()}`,
        `annee:${calendrier.obtenirAnneeScolaireId().obtenirValeur()}`,
      ],
    };
  }

  // Cette methode determine le plan d'invalidation apres modification d'un cours.
  public determinerInvalidationCours(
    referentielCours: ReferentielCours,
  ): PlanInvalidationCache {
    return {
      cles: [this.construireProfilCours(referentielCours).cle],
      etiquettes: [
        'referentiel-cours',
        `code:${this.normaliserFragment(referentielCours.obtenirCode())}`,
      ],
    };
  }

  private construireCle(...fragments: string[]): string {
    return fragments.map((fragment) => this.normaliserFragment(fragment)).join(':');
  }

  private normaliserFragment(valeur: string): string {
    const valeurNettoyee = valeur.trim().toLowerCase();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        'Une cle de cache ne peut pas contenir de fragment vide.',
        'MOTEUR_CACHE_FRAGMENT_INVALIDE',
      );
    }

    return valeurNettoyee.replace(/\s+/g, '-');
  }
}
