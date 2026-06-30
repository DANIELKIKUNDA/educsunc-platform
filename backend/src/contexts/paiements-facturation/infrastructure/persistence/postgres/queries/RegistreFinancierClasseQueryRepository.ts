import type { SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../../domain/value-objects/Money';
import { MoisScolaire } from '../../../../domain/value-objects/MoisScolaire';
import { TrancheFraisEtat } from '../../../../domain/value-objects/TrancheFraisEtat';
import { TypeExoneration } from '../../../../domain/value-objects/TypeExoneration';
import { TypeFrais } from '../../../../domain/value-objects/TypeFrais';
import type {
  RegistreFinancierClasseCelluleReadModel,
  RegistreFinancierClasseColonneReadModel,
  RegistreFinancierClasseLigneEleveReadModel,
  RegistreFinancierClasseReadModel,
  RegistreFinancierClasseStatistiquesColonneReadModel,
  StatutAffichageRegistreFinancierClasse,
} from '../../../../application/read-models/RegistreFinancierClasseReadModel';
import type { RegistreFinancierClasseRepository } from '../../../../application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase';
import type {
  PersistanceExonerationPostgres,
  PersistanceGrilleTarificationPostgres,
  PersistanceObligationFinancierePostgres,
} from '../mappers/MappersPaiementsPostgres';

interface LigneEleveClasse {
  id_eleve: string;
  matricule: string | null;
  nom: string;
  post_nom: string | null;
  prenom: string | null;
  sexe: string | null;
  statut_global: string;
  date_inscription: string | null;
}

interface LigneReglesClasse {
  code_section: string;
  libelle_section: string;
  cycle: string;
  est_technique: boolean | null;
  categorie_technique: string | null;
  est_classe_tenasosp: boolean;
  est_classe_exetat: boolean;
  est_classe_finaliste: boolean;
}

interface LigneQualificationFinanciereEleve {
  id_eleve: string;
  code_qualification: string;
}

const ORDRE_MOIS: ReadonlyArray<MoisScolaire> = [
  MoisScolaire.SEPTEMBRE,
  MoisScolaire.OCTOBRE,
  MoisScolaire.NOVEMBRE,
  MoisScolaire.DECEMBRE,
  MoisScolaire.JANVIER,
  MoisScolaire.FEVRIER,
  MoisScolaire.MARS,
  MoisScolaire.AVRIL,
  MoisScolaire.MAI,
  MoisScolaire.JUIN,
];

const ORDRE_TRANCHES: ReadonlyArray<TrancheFraisEtat> = [
  TrancheFraisEtat.TRANCHE_1,
  TrancheFraisEtat.TRANCHE_2,
  TrancheFraisEtat.TRANCHE_3,
];

type ColonneTechnique = RegistreFinancierClasseColonneReadModel & {
  predicate: (obligation: PersistanceObligationFinancierePostgres) => boolean;
};

export class RegistreFinancierClasseQueryRepository
  implements RegistreFinancierClasseRepository
{
  constructor(
    private readonly clientPaiements: SqlQueryClient,
    private readonly clientScolarite: SqlQueryClient,
    private readonly clientReferentiel: SqlQueryClient,
  ) {}

  public async consulterRegistreClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
  }): Promise<RegistreFinancierClasseReadModel> {
    const eleves = await this.listerElevesClasse(params.idEcole, params.idAnneeScolaire, params.idClassePedagogique);
    const reglesClasse = await this.consulterReglesClasse(params.idClassePedagogique);
    const grillesActives = await this.listerGrillesApplicables(
      params.idEcole,
      params.idAnneeScolaire,
      reglesClasse,
    );
    const colonnes = this.construireColonnes(grillesActives, params.moisAnalyseJusqua);
    const idsEleves = eleves.map((eleve) => eleve.id_eleve);
    const obligations = await this.listerObligations(
      params.idEcole,
      params.idAnneeScolaire,
      idsEleves,
    );
    const qualificationsFinancieres = await this.listerQualificationsFinancieres(
      params.idEcole,
      idsEleves,
    );
    const exonerations = await this.listerExonerations(params.idEcole, idsEleves);
    const qualificationsFinancieresParEleve = this.indexerQualificationsFinancieres(
      qualificationsFinancieres,
    );
    const statutsExonerationParObligation = this.indexerStatutsExoneration(exonerations);

    const obligationsParEleve = new Map<string, PersistanceObligationFinancierePostgres[]>();
    for (const obligation of obligations) {
      const liste = obligationsParEleve.get(obligation.id_eleve) ?? [];
      liste.push(obligation);
      obligationsParEleve.set(obligation.id_eleve, liste);
    }

    const lignes = eleves.map((eleve, index) => {
      const obligationsEleve = obligationsParEleve.get(eleve.id_eleve) ?? [];
      const cellules = colonnes.map((colonne) =>
        this.construireCellule(
          colonne,
          obligationsEleve,
          eleve.id_eleve,
          eleve.statut_global,
          qualificationsFinancieresParEleve,
          statutsExonerationParObligation,
        ));
      return this.construireLigneEleve(index + 1, eleve, cellules);
    });

    const statistiquesParColonne = colonnes.map((colonne) =>
      this.calculerStatistiquesColonne(colonne.code, lignes));

    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      colonnes: colonnes.map(({ predicate: _predicate, ...colonne }) => colonne),
      lignes,
      statistiquesParColonne,
    };
  }

  private async listerElevesClasse(
    idEcole: string,
    idAnneeScolaire: string,
    idClassePedagogique: string,
  ): Promise<readonly LigneEleveClasse[]> {
    const resultat = await this.clientScolarite.executer<LigneEleveClasse>(
      [
        'SELECT',
        '"eleve"."id" AS "id_eleve",',
        '"eleve"."matricule",',
        '"eleve"."nom",',
        '"eleve"."post_nom",',
        '"eleve"."prenom",',
        '"eleve"."sexe",',
        '"eleve"."statut_global",',
        'TO_CHAR("inscription"."date_inscription", \'YYYY-MM-DD\') AS "date_inscription"',
        'FROM "affectations" "affectation"',
        'JOIN "inscriptions" "inscription" ON "inscription"."id" = "affectation"."id_inscription_scolaire"',
        'JOIN "eleves" "eleve" ON "eleve"."id" = "inscription"."id_eleve"',
        'WHERE "inscription"."id_ecole" = $1',
        'AND "inscription"."id_annee_scolaire" = $2',
        'AND "affectation"."id_classe_pedagogique" = $3',
        'AND "affectation"."active" = true',
        'AND COALESCE("inscription"."supprime_logiquement", false) = false',
        'AND COALESCE("affectation"."supprime_logiquement", false) = false',
        'AND COALESCE("eleve"."supprime_logiquement", false) = false',
        'ORDER BY "eleve"."nom" ASC, "eleve"."post_nom" ASC, "eleve"."prenom" ASC',
      ].join(' '),
      [idEcole, idAnneeScolaire, idClassePedagogique],
    );

    return resultat.lignes;
  }

  private async consulterReglesClasse(idClassePedagogique: string): Promise<LigneReglesClasse> {
    const resultat = await this.clientReferentiel.executer<LigneReglesClasse>(
      [
        'SELECT',
        '"ss"."code" AS "code_section",',
        '"ss"."libelle" AS "libelle_section",',
        '"ca"."cycle" AS "cycle",',
        '"oe"."est_technique" AS "est_technique",',
        '"oe"."categorie_technique" AS "categorie_technique",',
        '"ca"."est_classe_tenasosp" AS "est_classe_tenasosp",',
        '"ca"."est_classe_exetat" AS "est_classe_exetat",',
        '"ca"."est_classe_finaliste" AS "est_classe_finaliste"',
        'FROM "classes_pedagogiques" "cp"',
        'JOIN "classes_academiques" "ca" ON "ca"."id" = "cp"."id_classe_academique"',
        'JOIN "sections_scolaires" "ss" ON "ss"."id" = "ca"."id_section_scolaire"',
        'LEFT JOIN "options_etudes" "oe" ON "oe"."id" = "ca"."id_option_etude"',
        'WHERE "cp"."id" = $1',
        'AND "cp"."archive_le" IS NULL',
        'LIMIT 1',
      ].join(' '),
      [idClassePedagogique],
    );

    const ligne = resultat.lignes[0];
    if (ligne === undefined) {
      throw new Error('La classe pedagogique demandee est introuvable.');
    }

    return ligne;
  }

  private async listerGrillesApplicables(
    idEcole: string,
    idAnneeScolaire: string,
    reglesClasse: LigneReglesClasse,
  ): Promise<readonly PersistanceGrilleTarificationPostgres[]> {
    const resultat = await this.clientPaiements.executer<PersistanceGrilleTarificationPostgres>(
      [
        'SELECT *',
        'FROM "grilles_tarification"',
        'WHERE "id_ecole" = $1',
        'AND "id_annee_scolaire" = $2',
        'AND "actif" = true',
      ].join(' '),
      [idEcole, idAnneeScolaire],
    );

    return resultat.lignes.filter((grille) => this.estGrilleApplicable(grille, reglesClasse));
  }

  private estGrilleApplicable(
    grille: PersistanceGrilleTarificationPostgres,
    reglesClasse: LigneReglesClasse,
  ): boolean {
    const section = this.normaliserSection(reglesClasse.code_section, reglesClasse.libelle_section);
    const categorieFraisEtat = this.calculerCategorieFraisEtat(
      section,
      reglesClasse.cycle,
      reglesClasse.est_technique === true,
      reglesClasse.est_classe_tenasosp,
    );

    if (grille.section !== null && grille.section !== section) {
      return false;
    }

    if (
      grille.categorie_technique !== null
      && (
        reglesClasse.est_technique !== true
        || grille.categorie_technique !== reglesClasse.categorie_technique
      )
    ) {
      return false;
    }

    if (
      grille.categorie_frais_etat !== null
      && grille.categorie_frais_etat !== categorieFraisEtat
    ) {
      return false;
    }

    if (
      grille.est_classe_tenasosp !== null
      && grille.est_classe_tenasosp !== reglesClasse.est_classe_tenasosp
    ) {
      return false;
    }

    if (
      grille.est_classe_exetat !== null
      && grille.est_classe_exetat !== reglesClasse.est_classe_exetat
    ) {
      return false;
    }

    if (
      grille.est_classe_finaliste !== null
      && grille.est_classe_finaliste !== reglesClasse.est_classe_finaliste
    ) {
      return false;
    }

    return true;
  }

  private construireColonnes(
    grilles: readonly PersistanceGrilleTarificationPostgres[],
    moisAnalyseJusqua?: string,
  ): ColonneTechnique[] {
    const colonnes: ColonneTechnique[] = [];
    const dernierIndiceMois = moisAnalyseJusqua === undefined
      ? ORDRE_MOIS.length - 1
      : Math.max(ORDRE_MOIS.indexOf(moisAnalyseJusqua as MoisScolaire), 0);

    ORDRE_MOIS.forEach((mois, index) => {
      const grillesMois = grilles.filter((grille) => grille.mois_scolaire === mois);
      if (grillesMois.length === 0 || index > dernierIndiceMois) {
        return;
      }

      colonnes.push({
        code: `MOIS_${mois}`,
        type: 'MOIS',
        libelle: this.presenterLibelleMois(mois),
        ordre: index + 1,
        moisScolaire: mois,
        typeFrais: this.resoudreTypeFraisCommun(grillesMois),
        predicate: (obligation) => grillesMois.some((grille) => grille.id === obligation.id_grille_tarification),
      });
    });

    ORDRE_TRANCHES.forEach((tranche, index) => {
      const grillesTranche = grilles.filter((grille) => grille.tranche_frais_etat === tranche);
      if (grillesTranche.length === 0) {
        return;
      }

      colonnes.push({
        code: `TRANCHE_${index + 1}`,
        type: 'TRANCHE_ETAT',
        libelle: `Tranche ${index + 1}`,
        ordre: 100 + index,
        trancheFraisEtat: tranche,
        typeFrais: TypeFrais.FRAIS_ETAT,
        predicate: (obligation) => grillesTranche.some((grille) => grille.id === obligation.id_grille_tarification),
      });
    });

    const grillesInscription = grilles.filter((grille) => grille.type_frais === TypeFrais.FRAIS_INSCRIPTION);
    if (grillesInscription.length > 0) {
      colonnes.push({
        code: 'INSCRIPTION',
        type: 'INSCRIPTION',
        libelle: 'Inscription',
        ordre: 200,
        typeFrais: TypeFrais.FRAIS_INSCRIPTION,
        predicate: (obligation) => grillesInscription.some((grille) => grille.id === obligation.id_grille_tarification),
      });
    }

    return colonnes;
  }

  private async listerObligations(
    idEcole: string,
    idAnneeScolaire: string,
    idsEleves: readonly string[],
  ): Promise<readonly PersistanceObligationFinancierePostgres[]> {
    if (idsEleves.length === 0) {
      return [];
    }

    const resultat = await this.clientPaiements.executer<PersistanceObligationFinancierePostgres>(
      [
        'SELECT *',
        'FROM "obligations_financieres"',
        'WHERE "id_ecole" = $1',
        'AND "id_annee_scolaire" = $2',
        'AND "id_eleve" = ANY($3)',
        'AND "statut" <> $4',
      ].join(' '),
      [idEcole, idAnneeScolaire, idsEleves, 'ANNULE'],
    );

    return resultat.lignes;
  }

  private async listerExonerations(
    idEcole: string,
    idsEleves: readonly string[],
  ): Promise<readonly PersistanceExonerationPostgres[]> {
    if (idsEleves.length === 0) {
      return [];
    }

    const resultat = await this.clientPaiements.executer<PersistanceExonerationPostgres>(
      [
        'SELECT *',
        'FROM "exonerations"',
        'WHERE "id_ecole" = $1',
        'AND "id_eleve" = ANY($2)',
        'AND "statut" = $3',
        'ORDER BY "validee_le" DESC',
      ].join(' '),
      [idEcole, idsEleves, 'ACCORDEE'],
    );

    return resultat.lignes;
  }

  private async listerQualificationsFinancieres(
    idEcole: string,
    idsEleves: readonly string[],
  ): Promise<readonly LigneQualificationFinanciereEleve[]> {
    if (idsEleves.length === 0) {
      return [];
    }

    const resultat = await this.clientPaiements.executer<LigneQualificationFinanciereEleve>(
      [
        'SELECT',
        '"id_eleve",',
        '"code_qualification"',
        'FROM "qualifications_financieres_eleves"',
        'WHERE "id_ecole" = $1',
        'AND "id_eleve" = ANY($2)',
        'AND "actif" = true',
      ].join(' '),
      [idEcole, idsEleves],
    );

    return resultat.lignes;
  }

  private indexerQualificationsFinancieres(
    qualifications: readonly LigneQualificationFinanciereEleve[],
  ): Map<string, ReadonlySet<string>> {
    const index = new Map<string, Set<string>>();

    for (const qualification of qualifications) {
      const existantes = index.get(qualification.id_eleve) ?? new Set<string>();
      existantes.add(qualification.code_qualification);
      index.set(qualification.id_eleve, existantes);
    }

    return new Map(
      Array.from(index.entries()).map(([idEleve, codes]) => [idEleve, new Set(codes)]),
    );
  }

  private indexerStatutsExoneration(
    exonerations: readonly PersistanceExonerationPostgres[],
  ): Map<string, StatutAffichageRegistreFinancierClasse> {
    const index = new Map<string, StatutAffichageRegistreFinancierClasse>();

    for (const exoneration of exonerations) {
      if (index.has(exoneration.id_obligation)) {
        continue;
      }
      if (exoneration.type_exoneration === TypeExoneration.FAMILLE_NOMBREUSE) {
        index.set(exoneration.id_obligation, 'FN');
        continue;
      }
      if (
        exoneration.type_exoneration === TypeExoneration.PRISE_EN_CHARGE
      ) {
        index.set(exoneration.id_obligation, 'PC');
      }
    }

    return index;
  }

  private construireCellule(
    colonne: ColonneTechnique,
    obligations: readonly PersistanceObligationFinancierePostgres[],
    idEleve: string,
    statutScolaire: string,
    qualificationsFinancieresParEleve: ReadonlyMap<string, ReadonlySet<string>>,
    statutsExonerationParObligation: ReadonlyMap<string, StatutAffichageRegistreFinancierClasse>,
  ): RegistreFinancierClasseCelluleReadModel {
    const obligationsColonne = obligations.filter((obligation) => colonne.predicate(obligation));
    const montantInitial = obligationsColonne.reduce((total, obligation) => total + obligation.montant_initial, 0);
    const montantPaye = obligationsColonne.reduce((total, obligation) => total + obligation.montant_paye, 0);
    const montantExonere = obligationsColonne.reduce((total, obligation) => total + obligation.montant_exonere, 0);
    const solde = obligationsColonne.reduce((total, obligation) => total + obligation.solde, 0);
    const montantAttenduNet = Math.max(montantInitial - montantExonere, 0);

    return {
      colonneCode: colonne.code,
      montantAttendu: new Money(montantAttenduNet, 'CDF'),
      montantPaye: new Money(montantPaye, 'CDF'),
      montantExonere: new Money(montantExonere, 'CDF'),
      resteARecouvrer: new Money(Math.max(solde, 0), 'CDF'),
      estRedevable: montantAttenduNet > 0,
      estEnOrdre: montantAttenduNet > 0 && solde <= 0,
      statutAffiche: this.resoudreStatutAffichage(
        obligationsColonne,
        idEleve,
        statutScolaire,
        qualificationsFinancieresParEleve,
        statutsExonerationParObligation,
      ),
    };
  }

  private construireLigneEleve(
    numeroOrdre: number,
    eleve: LigneEleveClasse,
    cellules: readonly RegistreFinancierClasseCelluleReadModel[],
  ): RegistreFinancierClasseLigneEleveReadModel {
    const totalAttendu = cellules.reduce((total, cellule) => total + cellule.montantAttendu.obtenirMontant(), 0);
    const totalPaye = cellules.reduce((total, cellule) => total + cellule.montantPaye.obtenirMontant(), 0);
    const totalExonere = cellules.reduce((total, cellule) => total + cellule.montantExonere.obtenirMontant(), 0);
    const totalReste = cellules.reduce((total, cellule) => total + cellule.resteARecouvrer.obtenirMontant(), 0);

    return {
      numeroOrdre,
      idEleve: eleve.id_eleve,
      matricule: eleve.matricule ?? undefined,
      nom: eleve.nom,
      postNom: eleve.post_nom ?? undefined,
      prenom: eleve.prenom ?? undefined,
      sexe: eleve.sexe ?? undefined,
      dateInscription: eleve.date_inscription ?? undefined,
      statutScolaire: eleve.statut_global,
      cellules,
      situationFinanciere: {
        montantAttendu: new Money(totalAttendu, 'CDF'),
        montantPaye: new Money(totalPaye, 'CDF'),
        montantExonere: new Money(totalExonere, 'CDF'),
        resteARecouvrer: new Money(totalReste, 'CDF'),
        estEnOrdre: totalAttendu > 0 ? totalReste <= 0 : false,
      },
    };
  }

  private calculerStatistiquesColonne(
    colonneCode: string,
    lignes: readonly RegistreFinancierClasseLigneEleveReadModel[],
  ): RegistreFinancierClasseStatistiquesColonneReadModel {
    const cellules = lignes.map((ligne) => ligne.cellules.find((cellule) => cellule.colonneCode === colonneCode))
      .filter((cellule): cellule is RegistreFinancierClasseCelluleReadModel => cellule !== undefined);

    const elevesRedevables = cellules.filter((cellule) => cellule.estRedevable).length;
    const elevesEnOrdre = cellules.filter((cellule) => cellule.estRedevable && cellule.estEnOrdre).length;
    const elevesNonEnOrdre = cellules.filter((cellule) => cellule.estRedevable && !cellule.estEnOrdre).length;
    const montantAttendu = cellules.reduce((total, cellule) => total + cellule.montantAttendu.obtenirMontant(), 0);
    const montantPaye = cellules.reduce((total, cellule) => total + cellule.montantPaye.obtenirMontant(), 0);
    const resteARecouvrer = cellules.reduce((total, cellule) => total + cellule.resteARecouvrer.obtenirMontant(), 0);

    return {
      colonneCode,
      elevesRedevables,
      montantAttendu: new Money(montantAttendu, 'CDF'),
      montantPaye: new Money(montantPaye, 'CDF'),
      resteARecouvrer: new Money(resteARecouvrer, 'CDF'),
      elevesEnOrdre,
      elevesNonEnOrdre,
      tauxRecouvrement: montantAttendu === 0
        ? 0
        : Number(((montantPaye / montantAttendu) * 100).toFixed(2)),
    };
  }

  private resoudreStatutAffichage(
    obligations: readonly PersistanceObligationFinancierePostgres[],
    idEleve: string,
    statutScolaire: string,
    qualificationsFinancieresParEleve: ReadonlyMap<string, ReadonlySet<string>>,
    statutsExonerationParObligation: ReadonlyMap<string, StatutAffichageRegistreFinancierClasse>,
  ): StatutAffichageRegistreFinancierClasse | undefined {
    if (statutScolaire === 'ABANDONNE') {
      return 'AB';
    }
    if (statutScolaire === 'TRANSFERE') {
      return 'TR';
    }
    if (statutScolaire === 'DECEDE') {
      return 'DC';
    }

    const qualifications = qualificationsFinancieresParEleve.get(idEleve);
    if (qualifications?.has('ENFANT_AGENT') === true) {
      return 'AG';
    }

    const statutExoneration = obligations
      .map((obligation) => statutsExonerationParObligation.get(obligation.id))
      .find((statut) => statut !== undefined);
    if (statutExoneration !== undefined) {
      return statutExoneration;
    }

    const montantInitial = obligations.reduce((total, obligation) => total + obligation.montant_initial, 0);
    const montantExonere = obligations.reduce((total, obligation) => total + obligation.montant_exonere, 0);
    if (montantInitial > 0 && montantExonere >= montantInitial) {
      return 'EX';
    }
    if (montantInitial > 0 && montantExonere > 0) {
      return 'EX50';
    }

    return undefined;
  }

  private presenterLibelleMois(mois: MoisScolaire): string {
    return mois.charAt(0) + mois.slice(1).toLowerCase();
  }

  private resoudreTypeFraisCommun(
    grilles: readonly PersistanceGrilleTarificationPostgres[],
  ): TypeFrais | undefined {
    const types = [...new Set(grilles.map((grille) => grille.type_frais))];
    return types.length === 1 ? types[0] : undefined;
  }

  private normaliserSection(codeSection: string, libelleSection: string): string {
    const valeur = `${codeSection} ${libelleSection}`.toUpperCase();
    if (valeur.includes('MATERNEL')) {
      return 'MATERNELLE';
    }
    if (valeur.includes('PRIMAIR')) {
      return 'PRIMAIRE';
    }
    return 'SECONDAIRE';
  }

  private calculerCategorieFraisEtat(
    section: string,
    cycle: string,
    estTechnique: boolean,
    estClasseTENASOSP: boolean,
  ): string {
    if (section === 'MATERNELLE') {
      return 'MATERNELLE';
    }
    if (section === 'PRIMAIRE') {
      return 'PRIMAIRE';
    }
    if (estClasseTENASOSP || cycle.toUpperCase().includes('EB')) {
      return 'SECONDAIRE_EB';
    }
    return estTechnique ? 'SECONDAIRE_TECHNIQUE' : 'SECONDAIRE_GENERALE';
  }
}
