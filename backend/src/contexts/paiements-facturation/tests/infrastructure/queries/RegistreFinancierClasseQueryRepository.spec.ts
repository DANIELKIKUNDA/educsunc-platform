import test from 'node:test';
import assert from 'node:assert/strict';
import { RegistreFinancierClasseQueryRepository } from '../../../infrastructure/persistence/postgres/queries/RegistreFinancierClasseQueryRepository';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

class SqlQueryClientMemoire implements SqlQueryClient {
  constructor(
    private readonly reponses: Record<string, readonly object[]>,
  ) {}

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
  ): Promise<{ lignes: readonly TLigne[]; nombreLignesAffectees: number }> {
    if (requeteSql.includes('FROM "affectations" "affectation"')) {
      return {
        lignes: (this.reponses.eleves ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }
    if (requeteSql.includes('FROM "classes_pedagogiques" "cp"')) {
      return {
        lignes: (this.reponses.regles ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }
    if (requeteSql.includes('FROM "grilles_tarification"')) {
      return {
        lignes: (this.reponses.grilles ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }
    if (requeteSql.includes('FROM "obligations_financieres"')) {
      return {
        lignes: (this.reponses.obligations ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }
    if (requeteSql.includes('FROM "qualifications_financieres_eleves"')) {
      return {
        lignes: (this.reponses.qualifications ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }
    if (requeteSql.includes('FROM "exonerations"')) {
      return {
        lignes: (this.reponses.exonerations ?? []) as readonly TLigne[],
        nombreLignesAffectees: 0,
      };
    }

    return { lignes: [], nombreLignesAffectees: 0 };
  }
}

test('RegistreFinancierClasseQueryRepository affiche AG quand le backend porte ENFANT_AGENT comme qualification autonome', async () => {
  const repository = new RegistreFinancierClasseQueryRepository(
    new SqlQueryClientMemoire({
      grilles: [{
        id: 'GRILLE-1',
        id_organisation: null,
        id_ecole: 'ECOLE-1',
        id_annee_scolaire: 'ANNEE-1',
        type_frais: 'FRAIS_INSCRIPTION',
        libelle: 'Frais inscription',
        montant: 10000,
        devise: 'CDF',
        section: null,
        categorie_frais_etat: null,
        categorie_technique: null,
        est_classe_tenasosp: null,
        est_classe_exetat: null,
        est_classe_finaliste: null,
        mois_scolaire: null,
        tranche_frais_etat: null,
        obligatoire: true,
        actif: true,
        date_debut_validite: null,
        date_fin_validite: null,
        cree_par: 'UTIL-1',
        cree_le: new Date(),
        modifie_par: null,
        modifie_le: null,
        version: 1,
      }],
      obligations: [{
        id: 'OBL-1',
        id_ecole: 'ECOLE-1',
        id_eleve: 'ELEVE-1',
        id_annee_scolaire: 'ANNEE-1',
        id_inscription_scolaire: null,
        type_frais: 'FRAIS_INSCRIPTION',
        reference_frais: 'INSC',
        libelle: 'Frais inscription',
        montant_initial: 10000,
        devise: 'CDF',
        montant_paye: 0,
        montant_exonere: 10000,
        solde: 0,
        statut: 'EXONERE',
        origine_creation: 'MANUELLE',
        origine_paiement: null,
        id_grille_tarification: 'GRILLE-1',
        cree_le: new Date(),
        cree_par: 'UTIL-1',
        version: 1,
      }],
      qualifications: [{
        id_eleve: 'ELEVE-1',
        code_qualification: 'ENFANT_AGENT',
      }],
      exonerations: [{
        id: 'EXO-1',
        id_ecole: 'ECOLE-1',
        id_eleve: 'ELEVE-1',
        id_obligation: 'OBL-1',
        type_exoneration: 'AUTRE',
        montant_exonere: 10000,
        devise: 'CDF',
        pourcentage: null,
        raison: 'Enfant agent',
        valide_par: 'UTIL-1',
        validee_le: new Date(),
        statut: 'ACCORDEE',
      }],
    }),
    new SqlQueryClientMemoire({
      eleves: [{
        id_eleve: 'ELEVE-1',
        matricule: 'MAT-1',
        nom: 'Mukeba',
        post_nom: 'Kasongo',
        prenom: 'Aime',
        sexe: 'M',
        statut_global: 'ACTIF',
        date_inscription: '2026-09-01',
      }],
    }),
    new SqlQueryClientMemoire({
      regles: [{
        code_section: 'SEC',
        libelle_section: 'Secondaire',
        cycle: 'HUMANITES',
        est_technique: false,
        categorie_technique: null,
        est_classe_tenasosp: false,
        est_classe_exetat: false,
        est_classe_finaliste: false,
      }],
    }),
  );

  const lecture = await repository.consulterRegistreClasse({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idAnneeScolaire: 'ANNEE-1',
    idClassePedagogique: 'CLASSE-1',
  });

  assert.equal(lecture.lignes[0]?.cellules[0]?.statutAffiche, 'AG');
});

test('RegistreFinancierClasseQueryRepository ne confond plus ENFANT_PROMOTEUR avec AG', async () => {
  const repository = new RegistreFinancierClasseQueryRepository(
    new SqlQueryClientMemoire({
      grilles: [{
        id: 'GRILLE-1',
        id_organisation: null,
        id_ecole: 'ECOLE-1',
        id_annee_scolaire: 'ANNEE-1',
        type_frais: 'FRAIS_INSCRIPTION',
        libelle: 'Frais inscription',
        montant: 10000,
        devise: 'CDF',
        section: null,
        categorie_frais_etat: null,
        categorie_technique: null,
        est_classe_tenasosp: null,
        est_classe_exetat: null,
        est_classe_finaliste: null,
        mois_scolaire: null,
        tranche_frais_etat: null,
        obligatoire: true,
        actif: true,
        date_debut_validite: null,
        date_fin_validite: null,
        cree_par: 'UTIL-1',
        cree_le: new Date(),
        modifie_par: null,
        modifie_le: null,
        version: 1,
      }],
      obligations: [{
        id: 'OBL-1',
        id_ecole: 'ECOLE-1',
        id_eleve: 'ELEVE-1',
        id_annee_scolaire: 'ANNEE-1',
        id_inscription_scolaire: null,
        type_frais: 'FRAIS_INSCRIPTION',
        reference_frais: 'INSC',
        libelle: 'Frais inscription',
        montant_initial: 10000,
        devise: 'CDF',
        montant_paye: 0,
        montant_exonere: 10000,
        solde: 0,
        statut: 'EXONERE',
        origine_creation: 'MANUELLE',
        origine_paiement: null,
        id_grille_tarification: 'GRILLE-1',
        cree_le: new Date(),
        cree_par: 'UTIL-1',
        version: 1,
      }],
      exonerations: [{
        id: 'EXO-1',
        id_ecole: 'ECOLE-1',
        id_eleve: 'ELEVE-1',
        id_obligation: 'OBL-1',
        type_exoneration: 'ENFANT_PROMOTEUR',
        montant_exonere: 10000,
        devise: 'CDF',
        pourcentage: null,
        raison: 'Enfant du promoteur',
        valide_par: 'UTIL-1',
        validee_le: new Date(),
        statut: 'ACCORDEE',
      }],
    }),
    new SqlQueryClientMemoire({
      eleves: [{
        id_eleve: 'ELEVE-1',
        matricule: 'MAT-1',
        nom: 'Mukeba',
        post_nom: 'Kasongo',
        prenom: 'Aime',
        sexe: 'M',
        statut_global: 'ACTIF',
        date_inscription: '2026-09-01',
      }],
    }),
    new SqlQueryClientMemoire({
      regles: [{
        code_section: 'SEC',
        libelle_section: 'Secondaire',
        cycle: 'HUMANITES',
        est_technique: false,
        categorie_technique: null,
        est_classe_tenasosp: false,
        est_classe_exetat: false,
        est_classe_finaliste: false,
      }],
    }),
  );

  const lecture = await repository.consulterRegistreClasse({
    idOrganisation: 'ORG-1',
    idEcole: 'ECOLE-1',
    idAnneeScolaire: 'ANNEE-1',
    idClassePedagogique: 'CLASSE-1',
  });

  assert.equal(lecture.lignes[0]?.cellules[0]?.statutAffiche, 'EX');
});
