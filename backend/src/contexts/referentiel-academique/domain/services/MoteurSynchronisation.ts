import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { Ecole } from '../aggregates/Ecole';
import { ModeExploitation } from '../value-objects/ModeExploitation';

// Cette strategie decrit la priorite retenue lors d'un conflit de synchronisation.
export type StrategieResolutionSynchronisation =
  | 'PRIORITE_LOCALE'
  | 'PRIORITE_DISTANTE'
  | 'PLUS_RECENTE';

// Cette interface represente une donnee metier prete a etre comparee entre deux sources.
export interface DonneeSynchronisable {
  identifiant: string;
  version: number;
  dateMiseAJour: Date;
  contenu: Readonly<Record<string, unknown>>;
}

// Cette interface represente un conflit detecte entre une source locale et distante.
export interface ConflitSynchronisation {
  identifiant: string;
  raison: string;
  donneeLocale: DonneeSynchronisable;
  donneeDistante: DonneeSynchronisable;
}

// Cette interface represente un journal de synthese utilisable par la couche applicative.
export interface JournalSynchronisationMetier {
  modeExploitation: ModeExploitation;
  totalLocales: number;
  totalDistantes: number;
  totalAEnvoyer: number;
  totalARecevoir: number;
  totalConflits: number;
}

// Cette interface represente le resultat complet d'une orchestration de synchronisation.
export interface ResultatOrchestrationSynchronisation {
  aEnvoyer: DonneeSynchronisable[];
  aRecevoir: DonneeSynchronisable[];
  conflits: ConflitSynchronisation[];
  journal: JournalSynchronisationMetier;
}

// Ce moteur pilote les regles de comparaison et de resolution de la synchronisation metier.
export class MoteurSynchronisation {
  // Cette methode verifie qu'une ecole peut participer a un echange de synchronisation.
  public verifierCompatibiliteModeExploitation(ecole: Ecole): void {
    if (ecole.obtenirModeExploitation() === ModeExploitation.OFFLINE_ONLY) {
      throw new ValidationError(
        "Le mode OFFLINE_ONLY n'autorise aucun echange de synchronisation distant.",
        'MOTEUR_SYNCHRONISATION_MODE_INCOMPATIBLE',
      );
    }
  }

  // Cette methode prepare les donnees a envoyer et a recevoir avant l'orchestration technique.
  public preparerDonneesSynchronisation(
    ecole: Ecole,
    donneesLocales: readonly DonneeSynchronisable[],
    donneesDistantes: readonly DonneeSynchronisable[],
  ): ResultatOrchestrationSynchronisation {
    return this.orchestrerEchanges(ecole, donneesLocales, donneesDistantes);
  }

  // Cette methode detecte les conflits entre deux lots de donnees homologues.
  public detecterConflits(
    donneesLocales: readonly DonneeSynchronisable[],
    donneesDistantes: readonly DonneeSynchronisable[],
  ): ConflitSynchronisation[] {
    const indexLocal = this.indexerDonnees(donneesLocales);
    const indexDistant = this.indexerDonnees(donneesDistantes);
    const conflits: ConflitSynchronisation[] = [];

    for (const [identifiant, donneeLocale] of indexLocal) {
      const donneeDistante = indexDistant.get(identifiant);

      if (donneeDistante === undefined) {
        continue;
      }

      if (!this.detecterDifference(donneeLocale, donneeDistante)) {
        continue;
      }

      conflits.push({
        identifiant,
        raison: 'Les versions ou contenus des deux sources divergent.',
        donneeLocale,
        donneeDistante,
      });
    }

    return conflits;
  }

  // Cette methode resout un conflit selon une strategie explicite.
  public resoudreConflit(
    conflit: ConflitSynchronisation,
    strategie: StrategieResolutionSynchronisation = 'PLUS_RECENTE',
  ): DonneeSynchronisable {
    switch (strategie) {
      case 'PRIORITE_LOCALE':
        return conflit.donneeLocale;
      case 'PRIORITE_DISTANTE':
        return conflit.donneeDistante;
      case 'PLUS_RECENTE':
        return this.choisirDonneeLaPlusRecente(
          conflit.donneeLocale,
          conflit.donneeDistante,
        );
      default:
        throw new ValidationError(
          'La strategie de resolution de synchronisation est invalide.',
          'MOTEUR_SYNCHRONISATION_STRATEGIE_INVALIDE',
        );
    }
  }

  // Cette methode orchestre la vue metier d'un echange bidirectionnel.
  public orchestrerEchanges(
    ecole: Ecole,
    donneesLocales: readonly DonneeSynchronisable[],
    donneesDistantes: readonly DonneeSynchronisable[],
    strategie: StrategieResolutionSynchronisation = 'PLUS_RECENTE',
  ): ResultatOrchestrationSynchronisation {
    this.verifierCompatibiliteModeExploitation(ecole);

    const localesValidees = this.validerDonnees(donneesLocales, 'locales');
    const distantesValidees = this.validerDonnees(donneesDistantes, 'distantes');
    const indexLocal = this.indexerDonnees(localesValidees);
    const indexDistant = this.indexerDonnees(distantesValidees);
    const conflits = this.detecterConflits(localesValidees, distantesValidees);
    const identifiantsEnConflit = new Set(conflits.map((conflit) => conflit.identifiant));
    const aEnvoyer: DonneeSynchronisable[] = [];
    const aRecevoir: DonneeSynchronisable[] = [];

    for (const [identifiant, donneeLocale] of indexLocal) {
      const donneeDistante = indexDistant.get(identifiant);

      if (donneeDistante === undefined) {
        aEnvoyer.push(donneeLocale);
        continue;
      }

      if (identifiantsEnConflit.has(identifiant)) {
        const conflit = conflits.find(
          (conflitCourant) => conflitCourant.identifiant === identifiant,
        );

        if (conflit !== undefined) {
          const resolution = this.resoudreConflit(conflit, strategie);

          if (resolution === conflit.donneeLocale) {
            aEnvoyer.push(conflit.donneeLocale);
          } else {
            aRecevoir.push(conflit.donneeDistante);
          }
        }

        continue;
      }

      if (donneeLocale.version > donneeDistante.version) {
        aEnvoyer.push(donneeLocale);
      } else if (donneeLocale.version < donneeDistante.version) {
        aRecevoir.push(donneeDistante);
      } else if (
        donneeLocale.dateMiseAJour.getTime() > donneeDistante.dateMiseAJour.getTime()
      ) {
        aEnvoyer.push(donneeLocale);
      } else if (
        donneeLocale.dateMiseAJour.getTime() < donneeDistante.dateMiseAJour.getTime()
      ) {
        aRecevoir.push(donneeDistante);
      }
    }

    for (const [identifiant, donneeDistante] of indexDistant) {
      if (!indexLocal.has(identifiant)) {
        aRecevoir.push(donneeDistante);
      }
    }

    return {
      aEnvoyer,
      aRecevoir,
      conflits,
      journal: this.journaliserOperation(
        ecole.obtenirModeExploitation(),
        localesValidees.length,
        distantesValidees.length,
        aEnvoyer.length,
        aRecevoir.length,
        conflits.length,
      ),
    };
  }

  // Cette methode produit un journal metier simple et stable pour la couche applicative.
  public journaliserOperation(
    modeExploitation: ModeExploitation,
    totalLocales: number,
    totalDistantes: number,
    totalAEnvoyer: number,
    totalARecevoir: number,
    totalConflits: number,
  ): JournalSynchronisationMetier {
    return {
      modeExploitation,
      totalLocales,
      totalDistantes,
      totalAEnvoyer,
      totalARecevoir,
      totalConflits,
    };
  }

  private validerDonnees(
    donnees: readonly DonneeSynchronisable[],
    provenance: 'locales' | 'distantes',
  ): DonneeSynchronisable[] {
    if (!Array.isArray(donnees)) {
      throw new ValidationError(
        `Les donnees ${provenance} doivent etre fournies sous forme de tableau.`,
        'MOTEUR_SYNCHRONISATION_DONNEES_INVALIDES',
      );
    }

    return donnees.map((donnee, index) => this.validerDonnee(donnee, provenance, index));
  }

  private validerDonnee(
    donnee: DonneeSynchronisable,
    provenance: 'locales' | 'distantes',
    index: number,
  ): DonneeSynchronisable {
    const identifiant = donnee.identifiant.trim();

    if (identifiant.length === 0) {
      throw new ValidationError(
        `La donnee ${provenance} en position ${index} doit avoir un identifiant.`,
        'MOTEUR_SYNCHRONISATION_IDENTIFIANT_INVALIDE',
      );
    }

    if (!Number.isInteger(donnee.version) || donnee.version <= 0) {
      throw new ValidationError(
        `La donnee ${provenance} ${identifiant} doit avoir une version entiere positive.`,
        'MOTEUR_SYNCHRONISATION_VERSION_INVALIDE',
      );
    }

    if (
      !(donnee.dateMiseAJour instanceof Date)
      || Number.isNaN(donnee.dateMiseAJour.getTime())
    ) {
      throw new ValidationError(
        `La donnee ${provenance} ${identifiant} doit avoir une date de mise a jour valide.`,
        'MOTEUR_SYNCHRONISATION_DATE_INVALIDE',
      );
    }

    if (donnee.contenu === null || typeof donnee.contenu !== 'object') {
      throw new ValidationError(
        `La donnee ${provenance} ${identifiant} doit porter un contenu objet.`,
        'MOTEUR_SYNCHRONISATION_CONTENU_INVALIDE',
      );
    }

    return {
      identifiant,
      version: donnee.version,
      dateMiseAJour: new Date(donnee.dateMiseAJour.getTime()),
      contenu: { ...donnee.contenu },
    };
  }

  private indexerDonnees(
    donnees: readonly DonneeSynchronisable[],
  ): Map<string, DonneeSynchronisable> {
    const index = new Map<string, DonneeSynchronisable>();

    for (const donnee of donnees) {
      if (index.has(donnee.identifiant)) {
        throw new ValidationError(
          `L'identifiant ${donnee.identifiant} apparait plusieurs fois dans le meme lot.`,
          'MOTEUR_SYNCHRONISATION_DOUBLON',
        );
      }

      index.set(donnee.identifiant, donnee);
    }

    return index;
  }

  private detecterDifference(
    donneeLocale: DonneeSynchronisable,
    donneeDistante: DonneeSynchronisable,
  ): boolean {
    return donneeLocale.version !== donneeDistante.version
      || donneeLocale.dateMiseAJour.getTime() !== donneeDistante.dateMiseAJour.getTime()
      || JSON.stringify(donneeLocale.contenu) !== JSON.stringify(donneeDistante.contenu);
  }

  private choisirDonneeLaPlusRecente(
    donneeLocale: DonneeSynchronisable,
    donneeDistante: DonneeSynchronisable,
  ): DonneeSynchronisable {
    if (donneeLocale.version > donneeDistante.version) {
      return donneeLocale;
    }

    if (donneeLocale.version < donneeDistante.version) {
      return donneeDistante;
    }

    if (donneeLocale.dateMiseAJour.getTime() >= donneeDistante.dateMiseAJour.getTime()) {
      return donneeLocale;
    }

    return donneeDistante;
  }
}
