import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { BulletinAssetsResolverService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinAssetsResolverService';
import { BulletinDocumentContextLoaderService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinDocumentContextLoaderService';
import { BulletinDocumentDataBuilderService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinDocumentDataBuilderService';
import { BulletinMasterBackgroundManifestFileRepository } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinMasterBackgroundManifestFileRepository';
import { BulletinOverlayPlanBuilderService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinOverlayPlanBuilderService';
import { BulletinPdfOverlayRendererService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinPdfOverlayRendererService';
import { BulletinTemplateManifestFileRepository } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinTemplateManifestFileRepository';
import { BulletinTemplateLayoutRegistryService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinTemplateLayoutRegistryService';
import { BulletinTemplatePackageInspectorService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinTemplatePackageInspectorService';
import { BulletinTemplateResolverService } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinTemplateResolverService';
import { BulletinZoneCalibrationFileRepository } from 'contexts/bulletins-evaluations/infrastructure/services/BulletinZoneCalibrationFileRepository';
import { PdfBulletinService } from 'contexts/bulletins-evaluations/infrastructure/services/PdfBulletinService';

function creerReadModel(
  overrides: Partial<BulletinEleveReadModel> = {},
): BulletinEleveReadModel {
  return {
    idBulletinEleve: 'bulletin-1',
    idEcole: 'ecole-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idProgrammeNiveau: 'programme-1',
    versionReferentielProgramme: 'version-ref-1',
    typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
    templateDocumentaireSuggere: 'BULL-TPL-02',
    etatBulletin: EtatBulletin.GENERE,
    versionBulletin: 1,
    lignes: [{
      idReferentielCours: 'cours-1',
      libelleCours: 'Mathematiques',
      ordreAffichage: 1,
      estCalculable: true,
      aExamen: true,
      mentionRepechage: '14/20',
      cotesColonnes: {
        [CodeColonneBulletin.P1]: 8,
        [CodeColonneBulletin.P2]: 9,
        [CodeColonneBulletin.EX1]: 15,
        [CodeColonneBulletin.P3]: 10,
        [CodeColonneBulletin.P4]: 11,
        [CodeColonneBulletin.EX2]: 14,
        [CodeColonneBulletin.P5]: 12,
        [CodeColonneBulletin.P6]: 13,
        [CodeColonneBulletin.EX3]: 16,
      },
      totauxColonnes: {
        [CodeColonneBulletin.TOTAL_S1]: 32,
        [CodeColonneBulletin.TOTAL_S2]: 35,
        [CodeColonneBulletin.TOTAL_T1]: 32,
        [CodeColonneBulletin.TOTAL_T2]: 35,
        [CodeColonneBulletin.TOTAL_T3]: 41,
        [CodeColonneBulletin.TOTAL_GENERAL]: 67,
      },
      maximaColonnes: {
        [CodeColonneBulletin.P1]: 10,
        [CodeColonneBulletin.EX1]: 20,
        [CodeColonneBulletin.TOTAL_S1]: 40,
        [CodeColonneBulletin.TOTAL_T1]: 40,
        [CodeColonneBulletin.EX2]: 20,
        [CodeColonneBulletin.TOTAL_S2]: 40,
        [CodeColonneBulletin.TOTAL_T2]: 40,
        [CodeColonneBulletin.EX3]: 20,
        [CodeColonneBulletin.TOTAL_T3]: 40,
        [CodeColonneBulletin.TOTAL_GENERAL]: 80,
      },
      stylesColonnes: {},
    }],
    blocsApplicationConduite: [],
    ...overrides,
  };
}

test('le resolver de template distingue trimestriel et semestriel', () => {
  const resolver = new BulletinTemplateResolverService();

  assert.deepEqual(
    resolver.resoudre(creerReadModel({
      typeStructureEvaluation: TypeStructureEvaluation.TRIMESTRIEL,
      templateDocumentaireSuggere: 'BULL-TPL-01',
    })),
    { templateDocumentaire: 'BULL-TPL-01', familleDocumentaire: 'GENERAL' },
  );

  assert.deepEqual(
    resolver.resoudre(creerReadModel()),
    { templateDocumentaire: 'BULL-TPL-02', familleDocumentaire: 'BRANCHES' },
  );

  assert.deepEqual(
    resolver.resoudre(creerReadModel(), {
      libelleClasse: '4e Humanites Commerciale et Gestion',
    }),
    { templateDocumentaire: 'BULL-TPL-05', familleDocumentaire: 'BRANCHES' },
  );

  assert.deepEqual(
    resolver.resoudre(creerReadModel({
      templateDocumentaireSuggere: 'BULL-TPL-03',
    }), {
      libelleClasse: '4e Humanites Scientifiques',
    }),
    { templateDocumentaire: 'BULL-TPL-06', familleDocumentaire: 'DOMAINES' },
  );

  assert.deepEqual(
    resolver.resoudre(creerReadModel(), {
      estClasseFinaliste: true,
    }),
    { templateDocumentaire: 'BULL-TPL-05', familleDocumentaire: 'BRANCHES' },
  );
});

test('le builder documentaire assemble meta, colonnes et assets', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    new BulletinTemplateResolverService(),
    new BulletinAssetsResolverService({
      async telechargerLogo() {
        return { nomFichier: 'logo.png', mimeType: 'image/png', contenu: Buffer.from('logo') };
      },
      async telechargerCachet() {
        return { nomFichier: 'cachet.png', mimeType: 'image/png', contenu: Buffer.from('cachet') };
      },
    }),
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: TypeStructureEvaluation.TRIMESTRIEL as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
            nom: 'Kanku',
            postNom: 'Ilunga',
            prenom: 'Aime',
            dateNaissance: '2010-01-01',
            lieuNaissance: 'Lubumbashi',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '2e Commerciale',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() {
          return {
            id: 'ecole-1',
            code: 'ECOLE-001',
            nom: 'College Test',
            sigle: 'CT',
            adresse: 'Adresse Test',
            telephone: '+243000000000',
            email: 'contact@test.cd',
            provinceEducationnelle: 'Haut-Katanga 1',
            ville: 'Lubumbashi',
            communeOuTerritoire: 'Lubumbashi',
          };
        },
        async consulterAnneeScolaire() {
          return {
            id: 'annee-1',
            code: '2025-2026',
            libelle: '2025 - 2026',
          };
        },
      },
    ),
  );

  const document = await builder.construire(creerReadModel());
  assert.equal(document.meta.templateDocumentaire, 'BULL-TPL-02');
  assert.equal(document.meta.libelleAnneeScolaire, '2025 - 2026');
  assert.equal(document.meta.libelleNiveauDocumentaire, "BULLETIN DE L'ELEVE");
  assert.equal(document.meta.referenceDocumentaire, 'IGE/P.S/004');
  assert.match(document.meta.dateEditionDocument ?? '', /^\d{2}\/\d{2}\/\d{4}$/);
  assert.equal(document.structure.entetesColonnes[0], 'Branches');
  assert.equal(document.identiteInstitutionnelle.nomEcole, 'College Test');
  assert.equal(document.identiteEleve.nomComplet, 'Kanku Ilunga Aime');
  assert.equal(document.identiteEleve.libelleClasse, '2e Commerciale');
  assert.equal(document.identiteEleve.lieuNaissance, 'Lubumbashi');
  assert.equal(document.identiteEleve.dateNaissance, '01/01/2010');
  assert.equal(document.identiteEleve.numeroPermanent, 'MAT-001');
  assert.equal(document.identiteInstitutionnelle.provinceEducationnelle, 'Haut-Katanga 1');
  assert.equal(document.identiteInstitutionnelle.ville, 'Lubumbashi');
  assert.equal(document.identiteInstitutionnelle.communeOuTerritoire, 'Lubumbashi');
  assert.equal(document.identiteInstitutionnelle.villeSignature, 'Lubumbashi');
  assert.equal(document.assets.logo?.nomFichier, 'logo.png');
  assert.equal(document.assets.cachet?.nomFichier, 'cachet.png');
});

test('le builder documentaire groupe les lignes par domaines et sous-domaines pour BULL-TPL-03', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    new BulletinTemplateResolverService(),
    new BulletinAssetsResolverService(),
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '8e EB Sciences',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() {
          return [
            {
              idReferentielCours: 'cours-1',
              codeCours: 'MATH',
              libelleCours: 'Mathematiques',
              ordreAffichage: 1,
              estCalculable: true,
              aExamen: true,
              domaine: 'Sciences',
              sousDomaine: 'Mathematiques',
            },
            {
              idReferentielCours: 'cours-2',
              codeCours: 'PHYS',
              libelleCours: 'Physique',
              ordreAffichage: 2,
              estCalculable: true,
              aExamen: true,
              domaine: 'Sciences',
              sousDomaine: 'Sciences physiques',
            },
            {
              idReferentielCours: 'cours-3',
              codeCours: 'FR',
              libelleCours: 'Francais',
              ordreAffichage: 3,
              estCalculable: true,
              aExamen: true,
              domaine: 'Langues',
              sousDomaine: 'Francais',
            },
          ];
        },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() {
          return {
            id: 'ecole-1',
            code: 'ECOLE-001',
            nom: 'College Test',
          };
        },
        async consulterAnneeScolaire() {
          return {
            id: 'annee-1',
            code: '2025-2026',
            libelle: '2025 - 2026',
          };
        },
      },
    ),
  );

  const document = await builder.construire(creerReadModel({
    templateDocumentaireSuggere: 'BULL-TPL-03',
    lignes: [
      {
        ...creerReadModel().lignes[0],
        idReferentielCours: 'cours-1',
        libelleCours: 'Mathematiques',
        ordreAffichage: 1,
        totauxColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 30,
          [CodeColonneBulletin.TOTAL_S2]: 32,
          [CodeColonneBulletin.TOTAL_GENERAL]: 62,
        },
        maximaColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 40,
          [CodeColonneBulletin.TOTAL_S2]: 40,
          [CodeColonneBulletin.TOTAL_GENERAL]: 80,
        },
      },
      {
        ...creerReadModel().lignes[0],
        idReferentielCours: 'cours-2',
        libelleCours: 'Physique',
        ordreAffichage: 2,
        totauxColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 25,
          [CodeColonneBulletin.TOTAL_S2]: 28,
          [CodeColonneBulletin.TOTAL_GENERAL]: 53,
        },
        maximaColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 40,
          [CodeColonneBulletin.TOTAL_S2]: 40,
          [CodeColonneBulletin.TOTAL_GENERAL]: 80,
        },
      },
      {
        ...creerReadModel().lignes[0],
        idReferentielCours: 'cours-3',
        libelleCours: 'Francais',
        ordreAffichage: 3,
        totauxColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 29,
          [CodeColonneBulletin.TOTAL_S2]: 31,
          [CodeColonneBulletin.TOTAL_GENERAL]: 60,
        },
        maximaColonnes: {
          [CodeColonneBulletin.TOTAL_S1]: 40,
          [CodeColonneBulletin.TOTAL_S2]: 40,
          [CodeColonneBulletin.TOTAL_GENERAL]: 80,
        },
      },
    ],
  }));

  const types = document.structure.lignes.map((ligne) => ligne.typeLigneDocumentaire ?? 'COURS');
  const libelles = document.structure.lignes.map((ligne) => ligne.libelleAffichage ?? ligne.libelleCours);

  assert.deepEqual(types, [
    'DOMAINE',
    'SOUS_DOMAINE',
    'COURS',
    'SOUS_TOTAL',
    'SOUS_DOMAINE',
    'COURS',
    'SOUS_TOTAL',
    'TOTAL_DOMAINE',
    'DOMAINE',
    'SOUS_DOMAINE',
    'COURS',
    'SOUS_TOTAL',
    'TOTAL_DOMAINE',
  ]);
  assert.deepEqual(libelles, [
    'Sciences',
    '  Mathematiques',
    '  Mathematiques',
    'Sous-total Mathematiques',
    '  Sciences physiques',
    '  Physique',
    'Sous-total Sciences physiques',
    'Total Sciences',
    'Langues',
    '  Francais',
    '  Francais',
    'Sous-total Francais',
    'Total Langues',
  ]);
  const totalSciences = document.structure.lignes.find((ligne) => ligne.libelleAffichage === 'Total Sciences');
  assert.equal(totalSciences?.totauxColonnes[CodeColonneBulletin.TOTAL_GENERAL], 115);
  assert.equal(totalSciences?.maximaColonnes[CodeColonneBulletin.TOTAL_GENERAL], 160);
});

test('le builder documentaire bascule les 4e humanites sur le bloc finaliste adapte', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    new BulletinTemplateResolverService(),
    new BulletinAssetsResolverService(),
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '4e Humanites Hotellerie et Restauration',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() {
          return {
            idProgrammeNiveau: 'programme-1',
            idClasseAcademique: 'classe-acad-4h',
            typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
            versionReferentielProgramme: 'version-ref-1',
            statutProgrammeNiveau: 'VALIDE' as const,
            estClasseEXETAT: true,
            estClasseFinaliste: true,
          };
        },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() {
          return {
            id: 'ecole-1',
            code: 'ECOLE-001',
            nom: 'College Test',
          };
        },
        async consulterAnneeScolaire() {
          return {
            id: 'annee-1',
            code: '2025-2026',
            libelle: '2025 - 2026',
          };
        },
      },
    ),
  );

  const document = await builder.construire(creerReadModel());

  assert.equal(document.meta.templateDocumentaire, 'BULL-TPL-05');
  assert.equal(document.meta.idClasseAcademique, 'classe-acad-4h');
  assert.equal(document.meta.estClasseEXETAT, true);
  assert.equal(document.meta.estClasseFinaliste, true);
  assert.equal(document.meta.libelleNiveauDocumentaire, 'BULLETIN DE LA 4EME ANNEE HUMANITES / HOTELLERIE ET RESTAURATION');
});

test('le manifest repository relit un layout officiel depuis le repo', async () => {
  const repository = new BulletinTemplateManifestFileRepository();

  const layout = await repository.charger('BULL-TPL-01');

  assert.equal(layout?.template, 'BULL-TPL-01');
  assert.equal(layout?.pages[0]?.background.neutralise, true);
  assert.match(layout?.pages[0]?.background.id ?? '', /background-master-neutralise/);
});

test('le background manifest repository relit la source PDF officielle d un template', async () => {
  const repository = new BulletinMasterBackgroundManifestFileRepository();

  const manifest = await repository.charger('BULL-TPL-01');

  assert.equal(manifest?.template, 'BULL-TPL-01');
  assert.match(manifest?.sourcePdfRelativePath ?? '', /bulletins_sources/);
  assert.equal(manifest?.statutPreparation, 'NEUTRALISE_DISPONIBLE');
});

test('l inspecteur de package expose le niveau de preparation reel du template', async () => {
  const inspecteur = new BulletinTemplatePackageInspectorService();

  const paquet = await inspecteur.inspecter('BULL-TPL-01');

  assert.equal(paquet.template, 'BULL-TPL-01');
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
  assert.equal(paquet.statutBackground, 'NEUTRALISE_DISPONIBLE');
  assert.equal(paquet.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(paquet.nombreZonesCalibration, 30);
  assert.equal(paquet.niveauPreparation, 'PRET_POUR_RENDERER_GRAPHIQUE');
  assert.equal(paquet.anomalies.includes('background.master.pdf present mais non neutralise'), false);
});

test('l inspecteur de package expose le niveau de preparation reel du template semestriel branches', async () => {
  const inspecteur = new BulletinTemplatePackageInspectorService();

  const paquet = await inspecteur.inspecter('BULL-TPL-02');

  assert.equal(paquet.template, 'BULL-TPL-02');
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
  assert.equal(paquet.statutBackground, 'NEUTRALISE_DISPONIBLE');
  assert.equal(paquet.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(paquet.nombreZonesCalibration, 22);
  assert.equal(paquet.niveauPreparation, 'PRET_POUR_RENDERER_GRAPHIQUE');
  assert.equal(paquet.anomalies.length, 0);
});

test('l inspecteur de package expose le niveau de preparation reel du template semestriel domaines', async () => {
  const inspecteur = new BulletinTemplatePackageInspectorService();

  const paquet = await inspecteur.inspecter('BULL-TPL-03');

  assert.equal(paquet.template, 'BULL-TPL-03');
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
  assert.equal(paquet.statutBackground, 'NEUTRALISE_DISPONIBLE');
  assert.equal(paquet.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(paquet.nombreZonesCalibration, 22);
  assert.equal(paquet.niveauPreparation, 'PRET_POUR_RENDERER_GRAPHIQUE');
  assert.equal(paquet.anomalies.length, 0);
});

test('l inspecteur de package expose le niveau de preparation reel du template finaliste branches', async () => {
  const inspecteur = new BulletinTemplatePackageInspectorService();

  const paquet = await inspecteur.inspecter('BULL-TPL-05');

  assert.equal(paquet.template, 'BULL-TPL-05');
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
});

test('l inspecteur de package expose le niveau de preparation reel du template finaliste domaines', async () => {
  const inspecteur = new BulletinTemplatePackageInspectorService();

  const paquet = await inspecteur.inspecter('BULL-TPL-06');

  assert.equal(paquet.template, 'BULL-TPL-06');
  assert.equal(paquet.layoutManifestPresent, true);
  assert.equal(paquet.backgroundManifestPresent, true);
  assert.equal(paquet.backgroundMasterPresent, true);
  assert.equal(paquet.zoneCalibrationPresent, true);
});

test('le repository de calibration relit la structure de zones d un template', async () => {
  const repository = new BulletinZoneCalibrationFileRepository();

  const calibration = await repository.charger('BULL-TPL-01');

  assert.equal(calibration?.template, 'BULL-TPL-01');
  assert.equal(calibration?.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(calibration?.zones.length, 30);
  assert.equal(calibration?.tables.length, 1);
  assert.equal(calibration?.zones.find((zone) => zone.id === 'z_legal_reference')?.statut, 'CALIBRE');
});

test('le repository de calibration relit la structure semestrielle branches d un template', async () => {
  const repository = new BulletinZoneCalibrationFileRepository();

  const calibration = await repository.charger('BULL-TPL-02');

  assert.equal(calibration?.template, 'BULL-TPL-02');
  assert.equal(calibration?.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(calibration?.zones.length, 22);
  assert.equal(calibration?.tables.length, 1);
  assert.equal(calibration?.tables[0]?.colonnes.join('|'), 'branche|s1_total|s2_total|total_general|repechage');
});

test('le repository de calibration relit la structure semestrielle domaines d un template', async () => {
  const repository = new BulletinZoneCalibrationFileRepository();

  const calibration = await repository.charger('BULL-TPL-03');

  assert.equal(calibration?.template, 'BULL-TPL-03');
  assert.equal(calibration?.etatCalibration, 'PARTIELLEMENT_CALIBRE');
  assert.equal(calibration?.zones.length, 22);
  assert.equal(calibration?.tables.length, 1);
  assert.equal(calibration?.tables[0]?.colonnes.join('|'), 'branche|s1_total|s2_total|total_general|repechage');
});

test('le repository de calibration relit la structure finaliste branches d un template', async () => {
  const repository = new BulletinZoneCalibrationFileRepository();

  const calibration = await repository.charger('BULL-TPL-05');

  assert.equal(calibration?.template, 'BULL-TPL-05');
  assert.equal(calibration?.tables[0]?.colonnes.join('|'), 'branche|s1_total|s2_total|total_general|repechage');
});

test('le repository de calibration relit la structure finaliste domaines d un template', async () => {
  const repository = new BulletinZoneCalibrationFileRepository();

  const calibration = await repository.charger('BULL-TPL-06');

  assert.equal(calibration?.template, 'BULL-TPL-06');
  assert.equal(calibration?.tables[0]?.colonnes.join('|'), 'branche|s1_total|s2_total|total_general|repechage');
});

test('le registry de layout retourne un fond maitre neutralise et une table pour le template', async () => {
  const registry = new BulletinTemplateLayoutRegistryService();

  const layout = await registry.resoudre('BULL-TPL-01');

  assert.equal(layout.template, 'BULL-TPL-01');
  assert.equal(layout.pages[0]?.background.neutralise, true);
  assert.equal(layout.tables[0]?.id, 'z_table_rows_window');
  assert.match(layout.pages[0]?.background.id ?? '', /background-master-neutralise/);
});

test('le builder overlay transforme le document en plan de zones et de tableau', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    new BulletinTemplateResolverService(),
    new BulletinAssetsResolverService(),
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
            dateNaissance: '2010-01-01',
            lieuNaissance: 'Lubumbashi',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '2e Commerciale',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() {
          return {
            id: 'ecole-1',
            code: 'ECOLE-001',
            nom: 'College Test',
            provinceEducationnelle: 'Haut-Katanga 1',
            ville: 'Lubumbashi',
            communeOuTerritoire: 'Lubumbashi',
          };
        },
        async consulterAnneeScolaire() {
          return {
            id: 'annee-1',
            code: '2025-2026',
            libelle: '2025 - 2026',
          };
        },
      },
    ),
  );
  const document = await builder.construire(creerReadModel({
    typeStructureEvaluation: TypeStructureEvaluation.TRIMESTRIEL,
    templateDocumentaireSuggere: 'BULL-TPL-01',
    blocsApplicationConduite: [{
      codePeriode: 'P6' as never,
      application: 'TB' as never,
      conduite: 'B' as never,
      pointsConduite: 80,
    }],
  }));
  const layout = await new BulletinTemplateLayoutRegistryService().resoudre(document.meta.templateDocumentaire);
  const plan = new BulletinOverlayPlanBuilderService().construire(document, layout);

  assert.equal(plan.template, 'BULL-TPL-01');
  assert.equal(plan.tables[0]?.nombreLignes, 1);
  assert.match(plan.backgroundId, /bull-tpl-01/);
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_eleve_nom_complet' && element.valeur === 'Kanku Ilunga Aime'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_titre_niveau' && element.valeur === "BULLETIN DE L'ELEVE DEGRE ELEMENTAIRE"));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_admin_province' && element.valeur === 'Haut-Katanga 1'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_admin_ville' && element.valeur === 'Lubumbashi'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_admin_commune_territoire' && element.valeur === 'Lubumbashi'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_eleve_lieu_naissance' && element.valeur === 'Lubumbashi'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_eleve_numero_permanent' && element.valeur === 'MAT-001'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_signature_ville' && element.valeur === 'Lubumbashi'));
  assert.ok(plan.elements.some((element) => element.zoneId === 'z_legal_reference' && element.valeur === 'IGE/P.S/004'));
});

test('le renderer overlay produit un PDF technique structure autour du fond maitre', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    undefined,
    undefined,
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '2e Commerciale',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() { return { id: 'ecole-1', code: 'ECOLE-001', nom: 'College Test' }; },
        async consulterAnneeScolaire() { return { id: 'annee-1', code: '2025-2026', libelle: '2025 - 2026' }; },
      },
    ),
  );
  const document = await builder.construire(creerReadModel({
    typeStructureEvaluation: TypeStructureEvaluation.TRIMESTRIEL,
    templateDocumentaireSuggere: 'BULL-TPL-01',
  }));
  const layout = await new BulletinTemplateLayoutRegistryService().resoudre('BULL-TPL-01');
  const plan = new BulletinOverlayPlanBuilderService().construire(document, layout);
  const background = await new BulletinMasterBackgroundManifestFileRepository().charger('BULL-TPL-01');
  const paquet = await new BulletinTemplatePackageInspectorService().inspecter('BULL-TPL-01');
  const calibration = await new BulletinZoneCalibrationFileRepository().charger('BULL-TPL-01');
  const pdf = await new BulletinPdfOverlayRendererService().rendre(document, layout, plan, background, paquet, calibration);
  const documentPdf = await PDFDocument.load(pdf.contenu);
  const page = documentPdf.getPage(0);

  assert.equal(pdf.mimeType, 'application/pdf');
  assert.ok(Buffer.from(pdf.contenu).subarray(0, 5).toString('utf-8').startsWith('%PDF-'));
  assert.ok(Buffer.from(pdf.contenu).length > 200000);
  assert.equal(documentPdf.getPageCount(), 1);
  assert.equal(Math.round(page.getWidth() * 10) / 10, 595.3);
  assert.equal(Math.round(page.getHeight() * 10) / 10, 841.9);
});

test('le renderer overlay produit un PDF technique structure autour du fond maitre semestriel branches', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    undefined,
    undefined,
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '2e Commerciale',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() { return { id: 'ecole-1', code: 'ECOLE-001', nom: 'College Test' }; },
        async consulterAnneeScolaire() { return { id: 'annee-1', code: '2025-2026', libelle: '2025 - 2026' }; },
      },
    ),
  );
  const document = await builder.construire(creerReadModel());
  const layout = await new BulletinTemplateLayoutRegistryService().resoudre('BULL-TPL-02');
  const plan = new BulletinOverlayPlanBuilderService().construire(document, layout);
  const background = await new BulletinMasterBackgroundManifestFileRepository().charger('BULL-TPL-02');
  const paquet = await new BulletinTemplatePackageInspectorService().inspecter('BULL-TPL-02');
  const calibration = await new BulletinZoneCalibrationFileRepository().charger('BULL-TPL-02');
  const pdf = await new BulletinPdfOverlayRendererService().rendre(document, layout, plan, background, paquet, calibration);
  const documentPdf = await PDFDocument.load(pdf.contenu);
  const page = documentPdf.getPage(0);

  assert.equal(pdf.mimeType, 'application/pdf');
  assert.ok(Buffer.from(pdf.contenu).subarray(0, 5).toString('utf-8').startsWith('%PDF-'));
  assert.ok(Buffer.from(pdf.contenu).length > 50000);
  assert.equal(documentPdf.getPageCount(), 1);
  assert.equal(Math.round(page.getWidth() * 10) / 10, 595.3);
  assert.equal(Math.round(page.getHeight() * 10) / 10, 841.9);
});

test('le renderer overlay produit un PDF technique structure autour du fond maitre semestriel domaines', async () => {
  const builder = new BulletinDocumentDataBuilderService(
    undefined,
    undefined,
    new BulletinDocumentContextLoaderService(
      {
        async consulterEleve() {
          return {
            idEleve: 'eleve-1',
            nomComplet: 'Kanku Ilunga Aime',
            sexe: 'F' as never,
            idEcole: 'ecole-1',
            matricule: 'MAT-001',
          };
        },
        async consulterInscription() { return null; },
        async consulterClassePedagogique() {
          return {
            idClassePedagogique: 'classe-1',
            libelleClasse: '8e EB Sciences',
            idEcole: 'ecole-1',
          };
        },
        async verifierAbandon() { return null; },
      },
      {
        async consulterCours() { return null; },
        async consulterProgrammeNiveau() { return null; },
        async listerCoursProgramme() { return []; },
        async listerColonnesAutorisees() { return []; },
        async consulterEcole() { return { id: 'ecole-1', code: 'ECOLE-001', nom: 'College Test' }; },
        async consulterAnneeScolaire() { return { id: 'annee-1', code: '2025-2026', libelle: '2025 - 2026' }; },
      },
    ),
  );
  const document = await builder.construire(creerReadModel({
    templateDocumentaireSuggere: 'BULL-TPL-03',
  }));
  const layout = await new BulletinTemplateLayoutRegistryService().resoudre('BULL-TPL-03');
  const plan = new BulletinOverlayPlanBuilderService().construire(document, layout);
  const background = await new BulletinMasterBackgroundManifestFileRepository().charger('BULL-TPL-03');
  const paquet = await new BulletinTemplatePackageInspectorService().inspecter('BULL-TPL-03');
  const calibration = await new BulletinZoneCalibrationFileRepository().charger('BULL-TPL-03');
  const pdf = await new BulletinPdfOverlayRendererService().rendre(document, layout, plan, background, paquet, calibration);
  const documentPdf = await PDFDocument.load(pdf.contenu);
  const page = documentPdf.getPage(0);

  assert.equal(pdf.mimeType, 'application/pdf');
  assert.ok(Buffer.from(pdf.contenu).subarray(0, 5).toString('utf-8').startsWith('%PDF-'));
  assert.ok(Buffer.from(pdf.contenu).length > 50000);
  assert.equal(documentPdf.getPageCount(), 1);
  assert.equal(Math.round(page.getWidth() * 10) / 10, 595.3);
  assert.equal(Math.round(page.getHeight() * 10) / 10, 841.9);
});

test('le service PDF produit un contenu documente a partir du socle documentaire', async () => {
  const service = new PdfBulletinService(
    undefined,
    new BulletinDocumentDataBuilderService(
      undefined,
      undefined,
      new BulletinDocumentContextLoaderService(
        {
          async consulterEleve() {
            return {
              idEleve: 'eleve-1',
              nomComplet: 'Kanku Ilunga Aime',
              sexe: 'F',
              idEcole: 'ecole-1',
              matricule: 'MAT-001',
            } as never;
          },
          async consulterInscription() { return null; },
          async consulterClassePedagogique() {
            return {
              idClassePedagogique: 'classe-1',
              libelleClasse: '2e Commerciale',
              idEcole: 'ecole-1',
            };
          },
          async verifierAbandon() { return null; },
        },
        {
          async consulterCours() { return null; },
          async consulterProgrammeNiveau() { return null; },
          async listerCoursProgramme() { return []; },
          async listerColonnesAutorisees() { return []; },
          async consulterEcole() {
            return {
              id: 'ecole-1',
              code: 'ECOLE-001',
              nom: 'College Test',
            };
          },
          async consulterAnneeScolaire() {
            return {
              id: 'annee-1',
              code: '2025-2026',
              libelle: '2025 - 2026',
            };
          },
        },
      ),
    ),
  );
  const pdf = await service.genererDepuisReadModel(creerReadModel());
  const documentPdf = await PDFDocument.load(pdf.contenu);
  const page = documentPdf.getPage(0);

  assert.equal(pdf.nomFichier, 'bulletin-bulletin-1.pdf');
  assert.equal(pdf.mimeType, 'application/pdf');
  assert.ok(Buffer.from(pdf.contenu).subarray(0, 5).toString('utf-8').startsWith('%PDF-'));
  assert.equal(documentPdf.getPageCount(), 1);
  assert.equal(Math.round(page.getWidth() * 10) / 10, 595.3);
  assert.equal(Math.round(page.getHeight() * 10) / 10, 841.9);
});
