import type { BulletinDocumentDataReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { LigneBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/LigneBulletinReadModel';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { BulletinAssetsResolverService } from './BulletinAssetsResolverService';
import type { BulletinDocumentContextLoaderService } from './BulletinDocumentContextLoaderService';
import { BulletinTemplateResolverService } from './BulletinTemplateResolverService';

// Ce service assemble la representation documentaire complete consommee par le renderer PDF.
export class BulletinDocumentDataBuilderService {
  constructor(
    private readonly templateResolver = new BulletinTemplateResolverService(),
    private readonly assetsResolver = new BulletinAssetsResolverService(),
    private readonly contextLoader?: BulletinDocumentContextLoaderService,
  ) {}

  public async construire(bulletin: BulletinEleveReadModel): Promise<BulletinDocumentDataReadModel> {
    const assets = await this.assetsResolver.resoudre(bulletin);
    const contexte = await this.contextLoader?.charger(bulletin);
    const resolution = this.templateResolver.resoudre(bulletin, {
      libelleClasse: contexte?.identiteEleve?.libelleClasse,
      estClasseEXETAT: contexte?.meta?.estClasseEXETAT,
      estClasseFinaliste: contexte?.meta?.estClasseFinaliste,
    });
    const dernierBloc = bulletin.blocsApplicationConduite.at(-1);

    return {
      meta: {
        idBulletinEleve: bulletin.idBulletinEleve,
        idEcole: bulletin.idEcole,
        idEleve: bulletin.idEleve,
        idClassePedagogique: bulletin.idClassePedagogique,
        idClasseAcademique: contexte?.meta?.idClasseAcademique,
        idAnneeScolaire: bulletin.idAnneeScolaire,
        idProgrammeNiveau: bulletin.idProgrammeNiveau,
        versionReferentielProgramme: bulletin.versionReferentielProgramme,
        typeStructureEvaluation: bulletin.typeStructureEvaluation,
        familleDocumentaire: resolution.familleDocumentaire,
        templateDocumentaire: resolution.templateDocumentaire,
        estClasseEXETAT: contexte?.meta?.estClasseEXETAT,
        estClasseFinaliste: contexte?.meta?.estClasseFinaliste,
        dateGeneration: new Date().toISOString(),
        libelleAnneeScolaire: contexte?.meta?.libelleAnneeScolaire,
        libelleNiveauDocumentaire: this.determinerLibelleNiveauDocumentaire(
          bulletin.typeStructureEvaluation,
          resolution.templateDocumentaire,
          contexte?.identiteEleve?.libelleClasse,
        ),
        dateEditionDocument: contexte?.meta?.dateEditionDocument,
        referenceDocumentaire: 'IGE/P.S/004',
      },
      identiteInstitutionnelle: {
        pays: 'Republique Democratique du Congo',
        ministere: "Ministere de l'Education Nationale",
        sousTitre: 'Et Nouvelle Citoyennete',
        nomEcole: contexte?.identiteInstitutionnelle?.nomEcole ?? bulletin.idEcole,
        codeEcole: contexte?.identiteInstitutionnelle?.codeEcole ?? bulletin.idEcole,
        sigleEcole: contexte?.identiteInstitutionnelle?.sigleEcole,
        adresseEcole: contexte?.identiteInstitutionnelle?.adresseEcole,
        telephoneEcole: contexte?.identiteInstitutionnelle?.telephoneEcole,
        emailEcole: contexte?.identiteInstitutionnelle?.emailEcole,
        provinceEducationnelle: contexte?.identiteInstitutionnelle?.provinceEducationnelle,
        ville: contexte?.identiteInstitutionnelle?.ville,
        communeOuTerritoire: contexte?.identiteInstitutionnelle?.communeOuTerritoire,
        villeSignature: contexte?.identiteInstitutionnelle?.villeSignature,
      },
      identiteEleve: {
        idEleve: bulletin.idEleve,
        idClassePedagogique: bulletin.idClassePedagogique,
        idAnneeScolaire: bulletin.idAnneeScolaire,
        matricule: contexte?.identiteEleve?.matricule,
        nom: contexte?.identiteEleve?.nom,
        postNom: contexte?.identiteEleve?.postNom,
        prenom: contexte?.identiteEleve?.prenom,
        nomComplet: contexte?.identiteEleve?.nomComplet,
        sexe: contexte?.identiteEleve?.sexe,
        dateNaissance: contexte?.identiteEleve?.dateNaissance,
        lieuNaissance: contexte?.identiteEleve?.lieuNaissance,
        libelleClasse: contexte?.identiteEleve?.libelleClasse,
        numeroPermanent: contexte?.identiteEleve?.numeroPermanent,
      },
      structure: {
        entetesColonnes: this.determinerEntetesColonnes(bulletin.typeStructureEvaluation, resolution.templateDocumentaire),
        lignes: this.structurerLignesDocumentaires(
          resolution.templateDocumentaire,
          bulletin.lignes,
          contexte?.programmeDocumentaire?.coursProgramme ?? [],
        ),
        blocsApplicationConduite: bulletin.blocsApplicationConduite,
        resumeGlobal: dernierBloc === undefined
          ? undefined
          : {
            application: dernierBloc.application,
            conduite: dernierBloc.conduite,
            pointsConduite: dernierBloc.pointsConduite,
          },
      },
      assets,
    };
  }

  private determinerEntetesColonnes(
    typeStructureEvaluation: TypeStructureEvaluation,
    templateDocumentaire: BulletinDocumentDataReadModel['meta']['templateDocumentaire'],
  ): string[] {
    if (templateDocumentaire === 'BULL-TPL-03') {
      return ['Branches', 'Premier semestre', 'Second semestre', 'Total general', 'Repechage'];
    }

    if (typeStructureEvaluation === TypeStructureEvaluation.TRIMESTRIEL) {
      return ['Branches', 'Premier trimestre', 'Deuxieme trimestre', 'Troisieme trimestre', 'Total'];
    }

    return ['Branches', 'Premier semestre', 'Second semestre', 'Total general', 'Repechage'];
  }

  private determinerLibelleNiveauDocumentaire(
    typeStructureEvaluation: TypeStructureEvaluation,
    templateDocumentaire: BulletinDocumentDataReadModel['meta']['templateDocumentaire'],
    libelleClasse?: string,
  ): string {
    if (templateDocumentaire === 'BULL-TPL-01' && typeStructureEvaluation === TypeStructureEvaluation.TRIMESTRIEL) {
      return "BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE";
    }

    if (templateDocumentaire === 'BULL-TPL-05' || templateDocumentaire === 'BULL-TPL-06') {
      return this.construireLibelleFinaliste(libelleClasse);
    }

    if (templateDocumentaire === 'BULL-TPL-03') {
      return "BULLETIN DE L'ELEVE PAR DOMAINES";
    }

    if (templateDocumentaire === 'BULL-TPL-04') {
      return "BULLETIN DE L'ELEVE ENSEIGNEMENT SPECIAL";
    }

    return "BULLETIN DE L'ELEVE";
  }

  private construireLibelleFinaliste(libelleClasse?: string): string {
    if (!libelleClasse) {
      return 'BULLETIN DE LA 4EME ANNEE HUMANITES';
    }

    const compact = libelleClasse.trim().replace(/\s+/g, ' ');
    const reste = compact
      .replace(/^\s*4(?:e|eme|ème)?\s*/i, '')
      .replace(/^annee\s*/i, '')
      .replace(/^des?\s+humanites?\s*/i, '')
      .replace(/^humanites?\s*/i, '')
      .trim();

    if (reste.length === 0) {
      return 'BULLETIN DE LA 4EME ANNEE HUMANITES';
    }

    return `BULLETIN DE LA 4EME ANNEE HUMANITES / ${reste.toUpperCase()}`;
  }

  private structurerLignesDocumentaires(
    templateDocumentaire: BulletinDocumentDataReadModel['meta']['templateDocumentaire'],
    lignes: LigneBulletinReadModel[],
    coursProgramme: Array<{
      idReferentielCours: string;
      ordreAffichage: number;
      domaine?: string;
      sousDomaine?: string;
    }>,
  ): LigneBulletinReadModel[] {
    const lignesTriees = [...lignes].sort((a, b) => a.ordreAffichage - b.ordreAffichage);

    if (templateDocumentaire !== 'BULL-TPL-03') {
      return lignesTriees;
    }

    const classificationParCours = new Map(
      coursProgramme.map((cours) => [cours.idReferentielCours, cours]),
    );
    const lignesEnrichies = lignesTriees.map((ligne) => ({
      ...ligne,
      typeLigneDocumentaire: 'COURS' as const,
      libelleAffichage: ligne.libelleCours,
      domaine: classificationParCours.get(ligne.idReferentielCours)?.domaine,
      sousDomaine: classificationParCours.get(ligne.idReferentielCours)?.sousDomaine,
    }));

    const resultat: LigneBulletinReadModel[] = [];
    let domaineCourant: string | undefined;
    let sousDomaineCourant: string | undefined;
    let bufferDomaine: LigneBulletinReadModel[] = [];
    let bufferSousDomaine: LigneBulletinReadModel[] = [];

    const pousserSousTotalSousDomaine = (): void => {
      if (sousDomaineCourant === undefined || bufferSousDomaine.length === 0) {
        return;
      }

      resultat.push(this.creerLigneSynthese(`__sous-total__${sousDomaineCourant}`, `Sous-total ${sousDomaineCourant}`, 'SOUS_TOTAL', bufferSousDomaine));
      bufferSousDomaine = [];
    };

    const pousserTotalDomaine = (): void => {
      if (domaineCourant === undefined || bufferDomaine.length === 0) {
        return;
      }

      resultat.push(this.creerLigneSynthese(`__total-domaine__${domaineCourant}`, `Total ${domaineCourant}`, 'TOTAL_DOMAINE', bufferDomaine));
      bufferDomaine = [];
    };

    for (const ligne of lignesEnrichies) {
      if (ligne.domaine !== domaineCourant) {
        pousserSousTotalSousDomaine();
        pousserTotalDomaine();
        domaineCourant = ligne.domaine;
        sousDomaineCourant = undefined;

        if (domaineCourant) {
          resultat.push(this.creerLigneEntete(`__domaine__${domaineCourant}`, domaineCourant, 'DOMAINE'));
        }
      }

      if (ligne.sousDomaine && ligne.sousDomaine !== sousDomaineCourant) {
        pousserSousTotalSousDomaine();
        sousDomaineCourant = ligne.sousDomaine;
        resultat.push(this.creerLigneEntete(`__sous-domaine__${domaineCourant ?? 'none'}__${sousDomaineCourant}`, sousDomaineCourant, 'SOUS_DOMAINE'));
      }

      resultat.push({
        ...ligne,
        libelleAffichage: ligne.sousDomaine ? `  ${ligne.libelleCours}` : ligne.libelleCours,
      });
      bufferDomaine.push(ligne);
      if (ligne.sousDomaine) {
        bufferSousDomaine.push(ligne);
      }
    }

    pousserSousTotalSousDomaine();
    pousserTotalDomaine();

    return resultat;
  }

  private creerLigneEntete(
    id: string,
    libelle: string,
    typeLigneDocumentaire: 'DOMAINE' | 'SOUS_DOMAINE',
  ): LigneBulletinReadModel {
    return {
      idReferentielCours: id,
      libelleCours: libelle,
      libelleAffichage: typeLigneDocumentaire === 'SOUS_DOMAINE' ? `  ${libelle}` : libelle,
      ordreAffichage: Number.MAX_SAFE_INTEGER,
      estCalculable: false,
      aExamen: false,
      typeLigneDocumentaire,
      cotesColonnes: {},
      totauxColonnes: {},
      maximaColonnes: {},
      stylesColonnes: {},
    };
  }

  private creerLigneSynthese(
    id: string,
    libelle: string,
    typeLigneDocumentaire: 'SOUS_TOTAL' | 'TOTAL_DOMAINE',
    lignes: LigneBulletinReadModel[],
  ): LigneBulletinReadModel {
    return {
      idReferentielCours: id,
      libelleCours: libelle,
      libelleAffichage: libelle,
      ordreAffichage: Number.MAX_SAFE_INTEGER,
      estCalculable: false,
      aExamen: false,
      typeLigneDocumentaire,
      cotesColonnes: this.fusionnerValeursNumeriques(lignes.map((ligne) => ligne.cotesColonnes)),
      totauxColonnes: this.fusionnerValeursNumeriques(lignes.map((ligne) => ligne.totauxColonnes)),
      maximaColonnes: this.fusionnerValeursNumeriques(lignes.map((ligne) => ligne.maximaColonnes)),
      stylesColonnes: {},
    };
  }

  private fusionnerValeursNumeriques(
    collections: Array<Record<string, number | null | undefined>>,
  ): Record<string, number | null> {
    const resultat = new Map<string, number>();

    for (const collection of collections) {
      for (const [cle, valeur] of Object.entries(collection)) {
        if (valeur === null || valeur === undefined) {
          continue;
        }

        resultat.set(cle, (resultat.get(cle) ?? 0) + valeur);
      }
    }

    return Object.fromEntries(resultat.entries());
  }
}
