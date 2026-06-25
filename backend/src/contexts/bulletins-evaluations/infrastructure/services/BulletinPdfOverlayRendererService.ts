import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { BulletinPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { BulletinDocumentDataReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinMasterBackgroundManifestReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinMasterBackgroundManifestReadModel';
import type { BulletinOverlayPlanReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinOverlayPlanReadModel';
import type { BulletinTemplatePackageReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplatePackageReadModel';
import type { BulletinTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';
import type { BulletinZoneCalibrationReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinZoneCalibrationReadModel';
import type { LigneBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/LigneBulletinReadModel';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce renderer formalise la chaine overlay meme avant l'arrivee du moteur PDF graphique final.
export class BulletinPdfOverlayRendererService {
  public async rendre(
    documentData: BulletinDocumentDataReadModel,
    layout: BulletinTemplateLayoutReadModel,
    overlayPlan: BulletinOverlayPlanReadModel,
    backgroundManifest: BulletinMasterBackgroundManifestReadModel | null,
    packageTemplate: BulletinTemplatePackageReadModel | null,
    calibration: BulletinZoneCalibrationReadModel | null,
  ): Promise<BulletinPdfGenere> {
    const contenu =
      packageTemplate?.backgroundMasterPresent === true && packageTemplate?.dossierTemplate
        ? await this.rendreAvecFondOfficiel(documentData, overlayPlan, packageTemplate, calibration)
        : await this.rendrePdfTechnique(documentData, layout, overlayPlan, backgroundManifest, packageTemplate, calibration);

    return {
      nomFichier: `bulletin-${documentData.meta.idBulletinEleve}.pdf`,
      contenu,
      mimeType: 'application/pdf',
    };
  }

  private async rendreAvecFondOfficiel(
    documentData: BulletinDocumentDataReadModel,
    overlayPlan: BulletinOverlayPlanReadModel,
    packageTemplate: BulletinTemplatePackageReadModel,
    calibration: BulletinZoneCalibrationReadModel | null,
  ): Promise<Uint8Array> {
    const cheminBackground = path.join(packageTemplate.dossierTemplate, 'background.master.pdf');
    const backgroundBytes = await readFile(cheminBackground);
    const backgroundPdf = await PDFDocument.load(backgroundBytes);
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pages = await pdf.copyPages(backgroundPdf, backgroundPdf.getPageIndices());

    for (const page of pages) {
      pdf.addPage(page);
    }

    const zonesParId = new Map(
      (calibration?.zones ?? [])
        .filter((zone) => zone.x !== null && zone.y !== null && zone.largeur !== null && zone.hauteur !== null)
        .map((zone) => [zone.id, zone]),
    );

    for (const element of overlayPlan.elements) {
      const zone = zonesParId.get(element.zoneId);
      if (!zone) {
        continue;
      }

      const page = pdf.getPage(zone.page - 1);
      if (!page) {
        continue;
      }

      const taillePolice = Math.max(8, Math.min(12, (zone.hauteur ?? 12) * 0.72));
      const texte = this.normaliserTexte(element.valeur);
      const largeurTexte = font.widthOfTextAtSize(texte, taillePolice);
      const x = this.resoudreX(zone.alignement, zone.x ?? 0, zone.largeur ?? 0, largeurTexte);
      const y = page.getHeight() - (zone.y ?? 0) - (zone.hauteur ?? 0) + Math.max(1, ((zone.hauteur ?? 0) - taillePolice) / 2);

      page.drawText(texte, {
        x,
        y,
        size: taillePolice,
        font: zone.id.startsWith('z_titre_') ? fontBold : font,
        color: rgb(0, 0, 0),
        maxWidth: zone.largeur ?? undefined,
      });
    }

    this.dessinerTableauSiCalibre(
      pdf,
      documentData.meta.templateDocumentaire,
      documentData.structure.lignes,
      calibration,
      font,
      fontBold,
    );

    pdf.setTitle(`Bulletin ${documentData.identiteEleve.nomComplet ?? documentData.meta.idBulletinEleve}`);
    pdf.setSubject(`Template ${documentData.meta.templateDocumentaire}`);
    pdf.setProducer('EduSync Bulletin Overlay Renderer');
    pdf.setCreator('EduSync');
    pdf.setKeywords([
      'EduSync',
      'bulletin',
      documentData.meta.templateDocumentaire,
      calibration?.etatCalibration ?? 'SANS_CALIBRATION',
    ]);

    return await pdf.save();
  }

  private async rendrePdfTechnique(
    documentData: BulletinDocumentDataReadModel,
    layout: BulletinTemplateLayoutReadModel,
    overlayPlan: BulletinOverlayPlanReadModel,
    backgroundManifest: BulletinMasterBackgroundManifestReadModel | null,
    packageTemplate: BulletinTemplatePackageReadModel | null,
    calibration: BulletinZoneCalibrationReadModel | null,
  ): Promise<Uint8Array> {
    const contenuTexte = [
      'Bulletin scolaire officiel',
      'Renderer mode: FALLBACK_TECHNIQUE',
      `Template: ${documentData.meta.templateDocumentaire}`,
      `Layout version: ${overlayPlan.versionLayout}`,
      `Background: ${overlayPlan.backgroundId}`,
      `Background source: ${backgroundManifest?.sourcePdfRelativePath ?? 'indisponible'}`,
      `Background status: ${backgroundManifest?.statutPreparation ?? 'indisponible'}`,
      `Package preparation: ${packageTemplate?.niveauPreparation ?? 'indisponible'}`,
      `Calibration status: ${calibration?.etatCalibration ?? packageTemplate?.etatCalibration ?? 'indisponible'}`,
      `Calibration zones: ${calibration?.zones.length ?? packageTemplate?.nombreZonesCalibration ?? 0}`,
      `Structure: ${documentData.meta.typeStructureEvaluation}`,
      `Ecole: ${documentData.identiteInstitutionnelle.nomEcole}`,
      `Code ecole: ${documentData.identiteInstitutionnelle.codeEcole}`,
      `Eleve: ${documentData.identiteEleve.nomComplet ?? documentData.identiteEleve.idEleve}`,
      `Classe: ${documentData.identiteEleve.libelleClasse ?? documentData.identiteEleve.idClassePedagogique}`,
      `Annee: ${documentData.meta.libelleAnneeScolaire ?? documentData.identiteEleve.idAnneeScolaire}`,
      `Programme: ${documentData.meta.idProgrammeNiveau}`,
      `Version referentiel: ${documentData.meta.versionReferentielProgramme}`,
      `Matricule: ${documentData.identiteEleve.matricule ?? 'n/a'}`,
      `Sexe: ${documentData.identiteEleve.sexe ?? 'n/a'}`,
      `Colonnes: ${documentData.structure.entetesColonnes.join(' | ')}`,
      `Nombre de lignes: ${documentData.structure.lignes.length}`,
      `Zones overlay: ${overlayPlan.elements.length}`,
      `Tables overlay: ${overlayPlan.tables.length}`,
      `Pages layout: ${layout.pages.length}`,
      `Application finale: ${documentData.structure.resumeGlobal?.application ?? 'n/a'}`,
      `Conduite finale: ${documentData.structure.resumeGlobal?.conduite ?? 'n/a'}`,
      `Assets: logo=${documentData.assets.logo ? 'oui' : 'non'}, cachet=${documentData.assets.cachet ? 'oui' : 'non'}, signature=${documentData.assets.signatureChefEtablissement ? 'oui' : 'non'}`,
      `Package anomalies: ${packageTemplate?.anomalies.join(' | ') || 'aucune'}`,
    ].join('\n');

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const lignes = contenuTexte.split('\n');
    let y = page.getHeight() - 48;

    page.drawText('Bulletin scolaire officiel', {
      x: 48,
      y,
      size: 15,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    y -= 26;

    for (const ligne of lignes.slice(1)) {
      page.drawText(ligne, {
        x: 48,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.15, 0.15),
        maxWidth: page.getWidth() - 96,
      });
      y -= 14;
      if (y < 48) {
        break;
      }
    }

    pdf.setTitle(`Bulletin ${documentData.identiteEleve.nomComplet ?? documentData.meta.idBulletinEleve}`);
    pdf.setSubject(`Template ${documentData.meta.templateDocumentaire}`);
    pdf.setProducer('EduSync Bulletin Overlay Renderer');
    pdf.setCreator('EduSync');

    return await pdf.save();
  }

  private resoudreX(alignement: 'left' | 'center' | 'right', x: number, largeur: number, largeurTexte: number): number {
    if (alignement === 'center') {
      return x + Math.max(0, (largeur - largeurTexte) / 2);
    }

    if (alignement === 'right') {
      return x + Math.max(0, largeur - largeurTexte);
    }

    return x;
  }

  private normaliserTexte(valeur: string): string {
    return valeur.replace(/\s+/g, ' ').trim();
  }

  private dessinerTableauSiCalibre(
    pdf: PDFDocument,
    template: BulletinDocumentDataReadModel['meta']['templateDocumentaire'],
    lignes: LigneBulletinReadModel[],
    calibration: BulletinZoneCalibrationReadModel | null,
    font: Awaited<ReturnType<PDFDocument['embedFont']>>,
    fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  ): void {
    const table = calibration?.tables.find((entree) => (
      entree.id === 'z_table_rows_window'
      && entree.x !== null
      && entree.y !== null
      && entree.largeur !== null
      && entree.hauteur !== null
      && entree.hauteurLigne !== null
    ));

    if (!table) {
      return;
    }

    if (
      table.x === null
      || table.y === null
      || table.largeur === null
      || table.hauteur === null
      || table.hauteurLigne === null
    ) {
      return;
    }

    const tableX: number = table.x;
    const tableY: number = table.y;
    const tableLargeur: number = table.largeur;
    const tableHauteur: number = table.hauteur;
    const tableHauteurLigne: number = table.hauteurLigne;
    const page = pdf.getPage(table.page - 1);
    if (!page) {
      return;
    }

    const largeursColonnes = this.calculerLargeursColonnes(template, table.colonnes, tableLargeur);
    const xColonnes = this.calculerPositionsColonnes(tableX, largeursColonnes);
    const taillePolice = 7.2;
    const margeInterne = 2;
    const nombreLignes = Math.min(lignes.length, Math.floor(tableHauteur / tableHauteurLigne));

    for (let index = 0; index < nombreLignes; index += 1) {
      const ligne = lignes[index];
      const baseline = page.getHeight() - tableY - ((index + 1) * tableHauteurLigne) + ((tableHauteurLigne - taillePolice) / 2);

      const libelle = this.normaliserTexte(ligne.libelleAffichage ?? ligne.libelleCours);
      const fontLigne = ligne.typeLigneDocumentaire && ligne.typeLigneDocumentaire !== 'COURS' ? fontBold : font;
      page.drawText(libelle, {
        x: xColonnes[0] + margeInterne,
        y: baseline,
        size: taillePolice,
        font: fontLigne,
        color: rgb(0, 0, 0),
        maxWidth: Math.max(0, largeursColonnes[0] - (margeInterne * 2)),
      });

      for (let colonneIndex = 1; colonneIndex < table.colonnes.length; colonneIndex += 1) {
        const cleColonne = table.colonnes[colonneIndex];
        const valeur = this.resoudreValeurTableau(ligne, cleColonne);

        if (valeur.length === 0) {
          continue;
        }

        const largeurDisponible = largeursColonnes[colonneIndex];
        const largeurTexte = font.widthOfTextAtSize(valeur, taillePolice);
        const x = xColonnes[colonneIndex] + Math.max(margeInterne, largeurDisponible - largeurTexte - margeInterne);

        page.drawText(valeur, {
          x,
          y: baseline,
          size: taillePolice,
          font: fontLigne,
          color: rgb(0, 0, 0),
          maxWidth: Math.max(0, largeurDisponible - (margeInterne * 2)),
        });
      }
    }
  }

  private calculerLargeursColonnes(
    template: BulletinDocumentDataReadModel['meta']['templateDocumentaire'],
    colonnes: string[],
    largeurTotale: number,
  ): number[] {
    if (colonnes.length === 0) {
      return [];
    }

    if (template === 'BULL-TPL-01') {
      const poidsParColonne = new Map<string, number>([
        ['branche', 11.5],
        ['t1_max_per', 1.7],
        ['t1_p1', 1.55],
        ['t1_p2', 1.55],
        ['t1_max_ex', 1.7],
        ['t1_pts_obt_ex', 1.7],
        ['t1_max_trim', 1.95],
        ['t1_pts_obt_trim', 1.95],
        ['t2_p3', 1.55],
        ['t2_p4', 1.55],
        ['t2_max_ex', 1.7],
        ['t2_pts_obt_ex', 1.7],
        ['t2_max_trim', 1.95],
        ['t2_pts_obt_trim', 1.95],
        ['t3_p5', 1.55],
        ['t3_p6', 1.55],
        ['t3_max_ex', 1.7],
        ['t3_pts_obt_ex', 1.7],
        ['t3_max_trim', 1.95],
        ['t3_pts_obt_trim', 1.95],
        ['total_max_pts', 2.2],
        ['total_pts_obt', 2.2],
      ]);

      const poids = colonnes.map((colonne) => poidsParColonne.get(colonne) ?? 1.5);
      const sommePoids = poids.reduce((total, valeur) => total + valeur, 0);

      return poids.map((valeur) => (valeur / sommePoids) * largeurTotale);
    }

    if (colonnes.includes('s1_total') && colonnes.includes('s2_total')) {
      const poidsParColonne = new Map<string, number>([
        ['branche', 8.8],
        ['s1_total', 2.1],
        ['s2_total', 2.1],
        ['total_general', 2.4],
        ['repechage', 1.9],
      ]);
      const poids = colonnes.map((colonne) => poidsParColonne.get(colonne) ?? 2);
      const sommePoids = poids.reduce((total, valeur) => total + valeur, 0);

      return poids.map((valeur) => (valeur / sommePoids) * largeurTotale);
    }

    const largeurLibelle = 150;
    const nombreColonnesNumeriques = Math.max(1, colonnes.length - 1);
    const largeurNumerique = Math.max(12, (largeurTotale - largeurLibelle) / nombreColonnesNumeriques);

    return colonnes.map((_, index) => (index === 0 ? largeurLibelle : largeurNumerique));
  }

  private calculerPositionsColonnes(xDepart: number, largeurs: number[]): number[] {
    const positions: number[] = [];
    let xCourant = xDepart;

    for (const largeur of largeurs) {
      positions.push(xCourant);
      xCourant += largeur;
    }

    return positions;
  }

  private resoudreValeurTableau(ligne: LigneBulletinReadModel, cleColonne: string): string {
    if (cleColonne === 'repechage') {
      return this.normaliserTexte(ligne.mentionRepechage ?? '');
    }

    const code = this.mapperCleTableVersCodeColonne(cleColonne);

    if (!code) {
      return '';
    }

    const valeur = cleColonne.includes('_max_') || cleColonne === 'total_max_pts'
      ? ligne.maximaColonnes[code]
      : (ligne.cotesColonnes[code] ?? ligne.totauxColonnes[code]);
    if (valeur === null || valeur === undefined) {
      return '';
    }

    return Number.isInteger(valeur) ? String(valeur) : String(valeur).replace('.', ',');
  }

  private mapperCleTableVersCodeColonne(cleColonne: string): CodeColonneBulletin | null {
    switch (cleColonne) {
      case 't1_max_per':
        return CodeColonneBulletin.P1;
      case 't1_p1':
        return CodeColonneBulletin.P1;
      case 't1_p2':
        return CodeColonneBulletin.P2;
      case 't1_max_ex':
        return CodeColonneBulletin.EX1;
      case 't1_pts_obt_ex':
        return CodeColonneBulletin.EX1;
      case 't1_max_trim':
        return CodeColonneBulletin.TOTAL_T1;
      case 't1_pts_obt_trim':
        return CodeColonneBulletin.TOTAL_T1;
      case 't2_p3':
        return CodeColonneBulletin.P3;
      case 't2_p4':
        return CodeColonneBulletin.P4;
      case 't2_max_ex':
        return CodeColonneBulletin.EX2;
      case 't2_pts_obt_ex':
        return CodeColonneBulletin.EX2;
      case 't2_max_trim':
        return CodeColonneBulletin.TOTAL_T2;
      case 't2_pts_obt_trim':
        return CodeColonneBulletin.TOTAL_T2;
      case 't3_p5':
        return CodeColonneBulletin.P5;
      case 't3_p6':
        return CodeColonneBulletin.P6;
      case 't3_max_ex':
        return CodeColonneBulletin.EX3;
      case 't3_pts_obt_ex':
        return CodeColonneBulletin.EX3;
      case 't3_max_trim':
        return CodeColonneBulletin.TOTAL_T3;
      case 't3_pts_obt_trim':
        return CodeColonneBulletin.TOTAL_T3;
      case 's1_total':
        return CodeColonneBulletin.TOTAL_S1;
      case 's2_total':
        return CodeColonneBulletin.TOTAL_S2;
      case 'total_general':
      case 'total_max_pts':
        return CodeColonneBulletin.TOTAL_GENERAL;
      case 'total_pts_obt':
        return CodeColonneBulletin.TOTAL_GENERAL;
      default:
        return null;
    }
  }
}
