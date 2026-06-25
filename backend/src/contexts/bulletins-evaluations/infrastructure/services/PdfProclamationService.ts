import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ProclamationClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput';
import type { ProclamationPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort';
import type { ProclamationDocumentDataReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationZoneCalibrationReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationZoneCalibrationReadModel';
import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';
import { ProclamationDocumentDataBuilderService } from './ProclamationDocumentDataBuilderService';
import { ProclamationMasterBackgroundManifestFileRepository } from './ProclamationMasterBackgroundManifestFileRepository';
import { ProclamationTemplateLayoutRegistryService } from './ProclamationTemplateLayoutRegistryService';
import { ProclamationTemplatePackageInspectorService } from './ProclamationTemplatePackageInspectorService';
import { ProclamationZoneCalibrationFileRepository } from './ProclamationZoneCalibrationFileRepository';

type PDFFontLike = Awaited<ReturnType<typeof PDFDocument.create>> extends PDFDocument ? Awaited<ReturnType<PDFDocument['embedFont']>> : never;
type PDFPageLike = PDFDocument['addPage'] extends (...args: never[]) => infer T ? T : never;

// Ce service produit un export PDF concret et stable de la proclamation.
export class PdfProclamationService {
  constructor(
    private readonly stockage?: ServiceStockageFichier,
    private readonly documentDataBuilder = new ProclamationDocumentDataBuilderService(),
    private readonly templateLayoutRegistry = new ProclamationTemplateLayoutRegistryService(),
    private readonly backgroundManifestRepository = new ProclamationMasterBackgroundManifestFileRepository(),
    private readonly zoneCalibrationRepository = new ProclamationZoneCalibrationFileRepository(),
    private readonly templatePackageInspector = new ProclamationTemplatePackageInspectorService(),
  ) {}

  public async genererDepuisSortie(proclamation: ProclamationClasseOutput): Promise<ProclamationPdfGenere> {
    const documentData = await this.documentDataBuilder.construire(proclamation);
    const contenu = Buffer.from(await this.rendre(documentData));
    const nomFichier = `proclamation-${proclamation.idClassePedagogique}-${proclamation.idAnneeScolaire}-${proclamation.codeColonne}.pdf`;

    if (this.stockage !== undefined) {
      await this.stockage.televerser(`proclamations/${nomFichier}`, contenu);
    }

    return {
      nomFichier,
      contenu,
      mimeType: 'application/pdf',
    };
  }

  private async rendre(documentData: ProclamationDocumentDataReadModel): Promise<Uint8Array> {
    const packageTemplate = await this.templatePackageInspector.inspecter(documentData.meta.templateDocumentaire);
    const backgroundManifest = await this.backgroundManifestRepository.charger(documentData.meta.templateDocumentaire);
    const layout = await this.templateLayoutRegistry.resoudre(documentData.meta.templateDocumentaire);
    const calibration = await this.zoneCalibrationRepository.charger(documentData.meta.templateDocumentaire);

    if (packageTemplate.backgroundMasterPresent && backgroundManifest !== null && calibration !== null) {
      return await this.rendreDepuisTemplate(documentData, layout, calibration);
    }

    return await this.rendreFallback(documentData);
  }

  private async rendreDepuisTemplate(
    documentData: ProclamationDocumentDataReadModel,
    layout: Awaited<ReturnType<ProclamationTemplateLayoutRegistryService['resoudre']>>,
    calibration: ProclamationZoneCalibrationReadModel,
  ): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const backgroundPath = path.resolve(
      process.cwd(),
      '..',
      'docs',
      'assets',
      'proclamations_templates',
      documentData.meta.templateDocumentaire,
      'background.master.pdf',
    );
    const backgroundSource = await readFile(backgroundPath);
    const backgroundPdf = await PDFDocument.load(backgroundSource);
    const addTemplatePage = async (role: 'PAGE_1_CLASSEMENT' | 'PAGE_2_CLASSEMENT_ET_NON_CLASSES'): Promise<PDFPageLike> => {
      const templatePage = layout.pages.find((page) => page.role === role) ?? layout.pages[0];
      const [importedPage] = await pdf.copyPages(backgroundPdf, [Math.max(0, templatePage.numeroPage - 1)]);
      return pdf.addPage(importedPage);
    };

    const tablePage1 = this.trouverTable(calibration, 't_classement_page_1');
    const tablePage2 = this.trouverTable(calibration, 't_classement_page_2');
    const statsTable = this.trouverTable(calibration, 't_statistiques_page_1');
    const nonClassesTable = this.trouverTable(calibration, 't_non_classes_page_2');

    const lignes = documentData.structure.lignesClassees;
    const page1 = await addTemplatePage('PAGE_1_CLASSEMENT');
    this.dessinerHeaderTemplate(page1, documentData, calibration, fontRegular, fontBold);
    await this.dessinerLogoInstitutionnelTemplate(pdf, page1, documentData, calibration);

    this.dessinerLignesTableSansCadre(page1, lignes.slice(0, 14).map((ligne) => [
      String(ligne.rang ?? '-'),
      ligne.nomComplet,
      String(ligne.sexe ?? ''),
      this.formaterNombre(ligne.maximumGeneral),
      this.formaterNombre(ligne.totalObtenu),
      this.formaterPourcentage(ligne.pourcentage),
      ligne.observation ?? ligne.statutProclamation,
    ]), tablePage1, fontRegular, [49, 176, 35, 51, 69, 62, 76], 8, true);

    this.dessinerStatistiquesTemplate(page1, documentData, statsTable, fontRegular, fontBold);

    let reste = lignes.slice(14);
    let pageNonClasses = await addTemplatePage('PAGE_2_CLASSEMENT_ET_NON_CLASSES');
    while (reste.length > 0) {
      const chunk = reste.slice(0, 6);
      this.dessinerLignesTableSansCadre(pageNonClasses, chunk.map((ligne) => [
        String(ligne.rang ?? '-'),
        ligne.nomComplet,
        String(ligne.sexe ?? ''),
        this.formaterNombre(ligne.maximumGeneral),
        this.formaterNombre(ligne.totalObtenu),
        this.formaterPourcentage(ligne.pourcentage),
        ligne.observation ?? ligne.statutProclamation,
      ]), tablePage2, fontRegular, [49, 176, 35, 51, 69, 62, 76], 8, true);
      reste = reste.slice(6);
      if (reste.length > 0) {
        pageNonClasses = await addTemplatePage('PAGE_2_CLASSEMENT_ET_NON_CLASSES');
      }
    }

    let pageCouranteNonClasses = pageNonClasses;
    let nonClassesIndex = 0;
    while (nonClassesIndex < documentData.structure.nonClasses.length) {
      const chunk = documentData.structure.nonClasses.slice(nonClassesIndex, nonClassesIndex + 6);
      this.dessinerTableNonClassesTemplate(
        pageCouranteNonClasses,
        nonClassesTable,
        chunk.map((eleve, index) => ([
          String(nonClassesIndex + index + 1),
          eleve.nomComplet,
          this.formaterSexeCourt(eleve.sexe),
          this.formaterMotifsNonClasse(eleve),
        ])),
        fontRegular,
        fontBold,
      );
      nonClassesIndex += chunk.length;
      if (nonClassesIndex < documentData.structure.nonClasses.length) {
        pageCouranteNonClasses = await addTemplatePage('PAGE_2_CLASSEMENT_ET_NON_CLASSES');
      }
    }

    return await pdf.save();
  }

  private async rendreFallback(documentData: ProclamationDocumentDataReadModel): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 32;
    const rowHeight = 20;
    const tableColumns = [
      { key: 'rang', label: 'Place', width: 40 },
      { key: 'nom', label: 'Nom et post-nom', width: 210 },
      { key: 'sexe', label: 'Sexe', width: 40 },
      { key: 'maxima', label: 'Maxima', width: 55 },
      { key: 'total', label: 'Points', width: 60 },
      { key: 'pourcentage', label: '%', width: 48 },
      { key: 'observation', label: 'Observation', width: 78 },
    ] as const;

    let page = pdf.addPage([pageWidth, pageHeight]);
    let cursorY = this.dessinerEntete(page, documentData, {
      fontRegular,
      fontBold,
      pageWidth,
      pageHeight,
      margin,
      tableColumns,
    });

    const recommencerTableau = (): void => {
      page = pdf.addPage([pageWidth, pageHeight]);
      cursorY = this.dessinerEntete(page, documentData, {
        fontRegular,
        fontBold,
        pageWidth,
        pageHeight,
        margin,
        tableColumns,
        tableOnly: true,
      });
    };

    for (const ligne of documentData.structure.lignesClassees) {
      if (cursorY < 220) {
        recommencerTableau();
      }

      this.dessinerLigneTableau(page, cursorY, tableColumns.map((column) => {
        switch (column.key) {
          case 'rang':
            return String(ligne.rang ?? '-');
          case 'nom':
            return ligne.nomComplet;
          case 'sexe':
            return String(ligne.sexe ?? '');
          case 'maxima':
            return this.formaterNombre(ligne.maximumGeneral);
          case 'total':
            return this.formaterNombre(ligne.totalObtenu);
          case 'pourcentage':
            return this.formaterPourcentage(ligne.pourcentage);
          case 'observation':
            return ligne.observation ?? ligne.statutProclamation;
        }
      }), {
        page,
        margin,
        rowHeight,
        fontRegular,
        fontBold,
        widths: tableColumns.map((column) => column.width),
      });
      cursorY -= rowHeight;
    }

    cursorY -= 14;
    cursorY = this.dessinerStatistiques(page, cursorY, documentData, {
      margin,
      fontRegular,
      fontBold,
      pageWidth,
    });

    if (documentData.structure.nonClasses.length > 0) {
      if (cursorY < 170) {
        page = pdf.addPage([pageWidth, pageHeight]);
        cursorY = pageHeight - margin;
      }

      cursorY = this.dessinerNonClasses(page, cursorY, documentData, {
        margin,
        rowHeight,
        fontRegular,
        fontBold,
        pageWidth,
        pageHeight,
        createPage: () => {
          page = pdf.addPage([pageWidth, pageHeight]);
          return page;
        },
      });
    }

    return await pdf.save();
  }

  private dessinerHeaderTemplate(
    page: PDFPageLike,
    documentData: ProclamationDocumentDataReadModel,
    calibration: ProclamationZoneCalibrationReadModel,
    fontRegular: PDFFontLike,
    fontBold: PDFFontLike,
  ): void {
    this.dessinerZoneTexte(page, calibration, 'z_institution_nom_ecole', (documentData.identiteInstitutionnelle.nomEcole || 'ECOLE').toUpperCase(), fontBold, 14);
    this.dessinerZoneTexte(page, calibration, 'z_institution_contacts', [
      documentData.identiteInstitutionnelle.adresseEcole,
      documentData.identiteInstitutionnelle.ville,
      documentData.identiteInstitutionnelle.telephoneEcole,
      documentData.identiteInstitutionnelle.emailEcole,
    ].filter(Boolean).join(' | '), fontRegular, 8.5);
    this.dessinerZoneTexte(page, calibration, 'z_titre_document', 'LISTE DE PROCLAMATION DES RESULTATS', fontBold, 12);
    this.dessinerZoneTexte(page, calibration, 'z_titre_periode', documentData.meta.libellePeriode ?? documentData.meta.typeProclamation, fontRegular, 9);
    this.dessinerZoneTexte(page, calibration, 'z_contexte_classe', documentData.contexteClasse.libelleClasse ?? documentData.contexteClasse.idClassePedagogique, fontRegular, 9);
    this.dessinerZoneTexte(page, calibration, 'z_contexte_section', documentData.contexteClasse.libelleSection ?? '-', fontRegular, 9);
    this.dessinerZoneTexte(page, calibration, 'z_contexte_titulaire', documentData.contexteClasse.nomTitulaire ?? '-', fontRegular, 9);
  }

  private dessinerZoneTexte(
    page: PDFPageLike,
    calibration: ProclamationZoneCalibrationReadModel,
    zoneId: string,
    texte: string,
    font: PDFFontLike,
    size: number,
  ): void {
    const zone = calibration.zones.find((element) => element.id === zoneId);
    if (!zone || zone.x === null || zone.y === null || zone.largeur === null || zone.hauteur === null) {
      return;
    }

    page.drawRectangle({
      x: zone.x,
      y: zone.y - 2,
      width: zone.largeur,
      height: zone.hauteur,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    const texteFinal = this.couperTexte(texte, zone.largeur, 7);
    const largeurTexte = font.widthOfTextAtSize(texteFinal, size);
    const x = zone.alignement === 'center'
      ? zone.x + (zone.largeur - largeurTexte) / 2
      : zone.alignement === 'right'
        ? zone.x + zone.largeur - largeurTexte
        : zone.x + 2;

    page.drawText(texteFinal, {
      x,
      y: zone.y + Math.max(0, (zone.hauteur - size) / 2),
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  private dessinerLignesTableSansCadre(
    page: PDFPageLike,
    rows: string[][],
    table: ProclamationZoneCalibrationReadModel['tables'][number],
    font: PDFFontLike,
    widths: number[],
    size: number,
    neutraliserFond = false,
  ): void {
    if (table.x === null || table.y === null || table.hauteurLigne === null) {
      return;
    }

    const tableX = table.x;
    const tableY = table.y;
    const hauteurLigne = table.hauteurLigne;
    const startY = tableY - hauteurLigne - 6;
    rows.forEach((row, rowIndex) => {
      let x = tableX + 4;
      const y = startY - (rowIndex * hauteurLigne);
      row.forEach((cell, columnIndex) => {
        const width = widths[columnIndex] ?? 50;
        if (neutraliserFond) {
          page.drawRectangle({
            x: x - 2,
            y: y - 2,
            width: Math.max(0, width - 4),
            height: Math.max(0, hauteurLigne - 4),
            color: rgb(1, 1, 1),
            borderWidth: 0,
          });
        }
        page.drawText(this.couperTexte(cell, width, 9), {
          x,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        x += width;
      });
    });
  }

  private dessinerTableNonClassesTemplate(
    page: PDFPageLike,
    table: ProclamationZoneCalibrationReadModel['tables'][number],
    rows: string[][],
    fontRegular: PDFFontLike,
    fontBold: PDFFontLike,
  ): void {
    if (table.x === null || table.y === null || table.hauteurLigne === null) {
      return;
    }

    const widths = [45, 230, 40, 195];
    const labels = ['N°', 'NOMS, POST-NOMS ET PRENOMS', 'SEXE', 'MOTIFS'];
    const tableX = table.x;
    const y = table.y;
    const hauteurLigne = table.hauteurLigne;
    const largeurTotale = widths.reduce((sum, width) => sum + width, 0);
    const nombreLignes = 7;

    page.drawRectangle({
      x: table.x,
      y: y - (hauteurLigne * nombreLignes),
      width: largeurTotale,
      height: hauteurLigne * nombreLignes,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    page.drawRectangle({
      x: table.x,
      y: y - (hauteurLigne * nombreLignes),
      width: largeurTotale,
      height: hauteurLigne * nombreLignes,
      borderWidth: 0.6,
      borderColor: rgb(0.2, 0.2, 0.2),
    });

    for (let index = 1; index < nombreLignes; index += 1) {
      const ligneY = y - (hauteurLigne * index);
      page.drawLine({
        start: { x: table.x, y: ligneY },
        end: { x: table.x + largeurTotale, y: ligneY },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    let cursorColonnes = table.x;
    widths.slice(0, -1).forEach((width) => {
      cursorColonnes += width;
      page.drawLine({
        start: { x: cursorColonnes, y: y - (hauteurLigne * nombreLignes) },
        end: { x: cursorColonnes, y },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    let x = table.x;
    labels.forEach((label, index) => {
      const width = widths[index] ?? 50;
      const texte = this.couperTexte(label, width, 7);
      const largeurTexte = (index === 0 ? fontRegular : fontBold).widthOfTextAtSize(texte, 7);
      const xOffset = index === 0 ? 4 : Math.max(2, (width - largeurTexte) / 2);

      page.drawText(texte, {
        x: x + xOffset,
        y: y - 14,
        size: 7,
        font: index === 0 ? fontRegular : fontBold,
        color: rgb(0, 0, 0),
      });
      x += width;
    });

    rows.forEach((row, rowIndex) => {
      let cursorX = tableX + 4;
      const rowY = y - ((rowIndex + 1) * hauteurLigne) - 14;
      row.forEach((cell, columnIndex) => {
        const width = widths[columnIndex] ?? 50;
        const alignCenter = columnIndex === 0 || columnIndex === 2;
        const texte = this.couperTexte(cell, width - 6, 9);
        const largeurTexte = fontRegular.widthOfTextAtSize(texte, 8);
        const textX = alignCenter
          ? cursorX + Math.max(0, ((width - 8) - largeurTexte) / 2)
          : cursorX;

        page.drawText(texte, {
          x: textX,
          y: rowY,
          size: 8,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        cursorX += width;
      });
    });
  }

  private async dessinerLogoInstitutionnelTemplate(
    pdf: PDFDocument,
    page: PDFPageLike,
    documentData: ProclamationDocumentDataReadModel,
    calibration: ProclamationZoneCalibrationReadModel,
  ): Promise<void> {
    const zone = calibration.zones.find((element) => element.id === 'z_institution_logo');
    if (!zone || zone.x === null || zone.y === null || zone.largeur === null || zone.hauteur === null) {
      return;
    }

    page.drawRectangle({
      x: zone.x,
      y: zone.y,
      width: zone.largeur,
      height: zone.hauteur,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    const asset = documentData.assets.logo;
    if (!asset) {
      const fallback = documentData.identiteInstitutionnelle.sigleEcole
        ?? documentData.identiteInstitutionnelle.codeEcole
        ?? '';
      if (fallback.length > 0) {
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const size = Math.min(14, Math.max(8, zone.largeur / Math.max(2, fallback.length)));
        const texte = this.couperTexte(fallback.toUpperCase(), zone.largeur - 4, 6);
        const largeur = font.widthOfTextAtSize(texte, size);
        page.drawText(texte, {
          x: zone.x + Math.max(0, (zone.largeur - largeur) / 2),
          y: zone.y + Math.max(0, (zone.hauteur - size) / 2),
          size,
          font,
          color: rgb(0, 0, 0),
        });
      }
      return;
    }

    const image = await this.embedDocumentImage(pdf, asset.mimeType, asset.contenu);
    if (image === null) {
      return;
    }

    const dimensions = image.scale(1);
    const ratio = Math.min(zone.largeur / dimensions.width, zone.hauteur / dimensions.height);
    const width = dimensions.width * ratio;
    const height = dimensions.height * ratio;

    page.drawImage(image, {
      x: zone.x + ((zone.largeur - width) / 2),
      y: zone.y + ((zone.hauteur - height) / 2),
      width,
      height,
    });
  }

  private async embedDocumentImage(
    pdf: PDFDocument,
    mimeType: string,
    contenu: Uint8Array | Buffer,
  ): Promise<Awaited<ReturnType<PDFDocument['embedPng']>> | Awaited<ReturnType<PDFDocument['embedJpg']>> | null> {
    const mime = mimeType.toLowerCase();
    const data = contenu instanceof Uint8Array ? contenu : new Uint8Array(contenu);

    if (mime === 'image/png') {
      return await pdf.embedPng(data);
    }

    if (mime === 'image/jpeg' || mime === 'image/jpg') {
      return await pdf.embedJpg(data);
    }

    return null;
  }

  private dessinerStatistiquesTemplate(
    page: PDFPageLike,
    documentData: ProclamationDocumentDataReadModel,
    table: ProclamationZoneCalibrationReadModel['tables'][number],
    fontRegular: PDFFontLike,
    fontBold: PDFFontLike,
  ): void {
    const statistiques = documentData.structure.statistiques;
    if (statistiques === undefined || table.x === null || table.y === null || table.hauteurLigne === null) {
      return;
    }

    const rows = [
      ['Inscrits', String(statistiques.inscritsFilles), String(statistiques.inscritsGarcons), String(statistiques.inscritsTotal), ''],
      ['Abandons', String(statistiques.abandonsFilles), String(statistiques.abandonsGarcons), String(statistiques.abandonsTotal), this.formaterPourcentage(statistiques.tauxAbandon)],
      ['Participants', String(statistiques.participantsFilles), String(statistiques.participantsGarcons), String(statistiques.participantsTotal), this.formaterPourcentage(statistiques.tauxParticipation)],
      ['Non classes', String(statistiques.nonClassesFilles), String(statistiques.nonClassesGarcons), String(statistiques.nonClassesTotal), ''],
      ['Reussite', String(statistiques.reussitesFilles), String(statistiques.reussitesGarcons), String(statistiques.reussitesTotal), this.formaterPourcentage(statistiques.tauxReussite)],
      ['Echec', String(statistiques.echecsFilles), String(statistiques.echecsGarcons), String(statistiques.echecsTotal), this.formaterPourcentage(statistiques.tauxEchec)],
    ];

    const largeurTotale = table.largeur ?? 489;
    const largeurLibelle = Math.round(largeurTotale * 0.20);
    const largeurFilles = Math.round(largeurTotale * 0.18);
    const largeurGarcons = Math.round(largeurTotale * 0.18);
    const largeurTotal = Math.round(largeurTotale * 0.18);
    const largeurPourcentage = largeurTotale - largeurLibelle - largeurFilles - largeurGarcons - largeurTotal;
    const widths = [
      largeurLibelle,
      largeurFilles,
      largeurGarcons,
      largeurTotal,
      largeurPourcentage,
    ];
    const hauteurLigne = table.hauteurLigne;
    const nombreLignes = rows.length;
    const topY = table.y;

    page.drawRectangle({
      x: table.x,
      y: topY - (hauteurLigne * nombreLignes),
      width: largeurTotale,
      height: hauteurLigne * nombreLignes,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    page.drawRectangle({
      x: table.x,
      y: topY - (hauteurLigne * nombreLignes),
      width: largeurTotale,
      height: hauteurLigne * nombreLignes,
      borderWidth: 0.6,
      borderColor: rgb(0.2, 0.2, 0.2),
    });

    for (let index = 1; index < nombreLignes; index += 1) {
      const ligneY = topY - (hauteurLigne * index);
      page.drawLine({
        start: { x: table.x, y: ligneY },
        end: { x: table.x + largeurTotale, y: ligneY },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    let cursorColonnes = table.x;
    widths.slice(0, -1).forEach((width) => {
      cursorColonnes += width;
      page.drawLine({
        start: { x: cursorColonnes, y: topY - (hauteurLigne * nombreLignes) },
        end: { x: cursorColonnes, y: topY },
        thickness: 0.5,
        color: rgb(0.2, 0.2, 0.2),
      });
    });

    const tableX = table.x;
    rows.forEach((row, index) => {
      this.dessinerLigneStatistiqueTemplate(
        page,
        tableX,
        topY - (hauteurLigne * index),
        row,
        widths,
        fontRegular,
        7.5,
      );
    });
  }

  private dessinerLigneStatistiqueTemplate(
    page: PDFPageLike,
    startX: number,
    topY: number,
    values: string[],
    widths: number[],
    font: PDFFontLike,
    size: number,
  ): void {
    let x = startX;
    values.forEach((value, index) => {
      const width = widths[index] ?? 50;
      const texte = this.couperTexte(value, width - 6, 9);
      const largeurTexte = font.widthOfTextAtSize(texte, size);
      const alignLeft = index === 0;
      const textX = alignLeft ? x + 4 : x + Math.max(2, (width - largeurTexte) / 2);
      page.drawText(texte, {
        x: textX,
        y: topY - 14,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      x += width;
    });
  }

  private trouverTable(
    calibration: ProclamationZoneCalibrationReadModel,
    tableId: string,
  ): ProclamationZoneCalibrationReadModel['tables'][number] {
    return calibration.tables.find((table) => table.id === tableId) ?? {
      id: tableId,
      page: 1,
      x: null,
      y: null,
      largeur: null,
      hauteur: null,
      hauteurLigne: null,
      colonnes: [],
      statut: 'A_CALIBRER',
    };
  }

  private dessinerEntete(
    page: PDFPageLike,
    documentData: ProclamationDocumentDataReadModel,
    options: {
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      pageWidth: number;
      pageHeight: number;
      margin: number;
      tableColumns: ReadonlyArray<{ label: string; width: number }>;
      tableOnly?: boolean;
    },
  ): number {
    let cursorY = options.pageHeight - options.margin;

    if (!options.tableOnly) {
      page.drawText((documentData.identiteInstitutionnelle.nomEcole || 'ECOLE').toUpperCase(), {
        x: options.margin,
        y: cursorY,
        size: 15,
        font: options.fontBold,
        color: rgb(0, 0, 0),
      });
      cursorY -= 18;

      const ligneInstitution = [
        documentData.identiteInstitutionnelle.adresseEcole,
        documentData.identiteInstitutionnelle.ville,
        documentData.identiteInstitutionnelle.telephoneEcole,
        documentData.identiteInstitutionnelle.emailEcole,
      ].filter(Boolean).join(' | ');
      if (ligneInstitution.length > 0) {
        page.drawText(ligneInstitution, {
          x: options.margin,
          y: cursorY,
          size: 9,
          font: options.fontRegular,
        });
        cursorY -= 16;
      }

      page.drawText('LISTE DE PROCLAMATION DES RESULTATS', {
        x: options.margin,
        y: cursorY,
        size: 13,
        font: options.fontBold,
      });
      cursorY -= 18;

      page.drawText(`Periode: ${documentData.meta.libellePeriode ?? documentData.meta.typeProclamation}`, {
        x: options.margin,
        y: cursorY,
        size: 10,
        font: options.fontRegular,
      });
      cursorY -= 14;

      const contexte = [
        `Annee scolaire: ${documentData.meta.libelleAnneeScolaire ?? documentData.meta.idAnneeScolaire}`,
        `Classe: ${documentData.contexteClasse.libelleClasse ?? documentData.contexteClasse.idClassePedagogique}`,
        `Section: ${documentData.contexteClasse.libelleSection ?? '-'}`,
        `Titulaire: ${documentData.contexteClasse.nomTitulaire ?? '-'}`,
      ];
      for (const ligne of contexte) {
        page.drawText(ligne, {
          x: options.margin,
          y: cursorY,
          size: 9,
          font: options.fontRegular,
        });
        cursorY -= 12;
      }

      cursorY -= 8;
    }

    this.dessinerLigneTableau(page, cursorY, options.tableColumns.map((column) => column.label), {
      page,
      margin: options.margin,
      rowHeight: 20,
      fontRegular: options.fontRegular,
      fontBold: options.fontBold,
      widths: options.tableColumns.map((column) => column.width),
      header: true,
    });
    return cursorY - 20;
  }

  private dessinerLigneTableau(
    page: PDFPageLike,
    y: number,
    values: string[],
    options: {
      page: PDFPageLike;
      margin: number;
      rowHeight: number;
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      widths: number[];
      header?: boolean;
    },
  ): void {
    let x = options.margin;
    page.drawRectangle({
      x: options.margin,
      y: y - options.rowHeight + 2,
      width: options.widths.reduce((sum, width) => sum + width, 0),
      height: options.rowHeight,
      borderWidth: 0.5,
      borderColor: rgb(0.2, 0.2, 0.2),
      color: options.header ? rgb(0.94, 0.94, 0.94) : undefined,
    });

    values.forEach((value, index) => {
      const width = options.widths[index] ?? 60;
      if (index > 0) {
        page.drawLine({
          start: { x, y: y - options.rowHeight + 2 },
          end: { x, y: y + 2 },
          thickness: 0.5,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
      page.drawText(this.couperTexte(value, width, options.header ? 11 : 16), {
        x: x + 3,
        y: y - 13,
        size: options.header ? 8 : 7.8,
        font: options.header ? options.fontBold : options.fontRegular,
      });
      x += width;
    });
  }

  private dessinerStatistiques(
    page: PDFPageLike,
    cursorY: number,
    documentData: ProclamationDocumentDataReadModel,
    options: {
      margin: number;
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      pageWidth: number;
    },
  ): number {
    const statistiques = documentData.structure.statistiques;
    if (statistiques === undefined) {
      return cursorY;
    }

    page.drawText('STATISTIQUES', {
      x: options.margin,
      y: cursorY,
      size: 11,
      font: options.fontBold,
    });
    cursorY -= 16;

    const lignes = [
      ['Libelle', 'Filles', 'Garcons', 'Total', '%'],
      ['Inscrits', statistiques.inscritsFilles, statistiques.inscritsGarcons, statistiques.inscritsTotal, ''],
      ['Abandons', statistiques.abandonsFilles, statistiques.abandonsGarcons, statistiques.abandonsTotal, this.formaterPourcentage(statistiques.tauxAbandon)],
      ['Participants', statistiques.participantsFilles, statistiques.participantsGarcons, statistiques.participantsTotal, this.formaterPourcentage(statistiques.tauxParticipation)],
      ['Non classes', statistiques.nonClassesFilles, statistiques.nonClassesGarcons, statistiques.nonClassesTotal, ''],
      ['Reussite', statistiques.reussitesFilles, statistiques.reussitesGarcons, statistiques.reussitesTotal, this.formaterPourcentage(statistiques.tauxReussite)],
      ['Echec', statistiques.echecsFilles, statistiques.echecsGarcons, statistiques.echecsTotal, this.formaterPourcentage(statistiques.tauxEchec)],
    ];
    const widths = [140, 70, 70, 70, 60];
    for (const [index, ligne] of lignes.entries()) {
      this.dessinerLigneTableau(page, cursorY, ligne.map((value) => String(value)), {
        page,
        margin: options.margin,
        rowHeight: 18,
        fontRegular: options.fontRegular,
        fontBold: options.fontBold,
        widths,
        header: index === 0,
      });
      cursorY -= 18;
    }

    return cursorY - 12;
  }

  private dessinerNonClasses(
    page: PDFPageLike,
    startY: number,
    documentData: ProclamationDocumentDataReadModel,
    options: {
      margin: number;
      rowHeight: number;
      fontRegular: PDFFontLike;
      fontBold: PDFFontLike;
      pageWidth: number;
      pageHeight: number;
      createPage: () => PDFPageLike;
    },
  ): number {
    let currentPage = page;
    let cursorY = startY;

    currentPage.drawText('NON CLASSES', {
      x: options.margin,
      y: cursorY,
      size: 11,
      font: options.fontBold,
    });
    cursorY -= 16;

    const widths = [36, 215, 38, 242];
    this.dessinerLigneTableau(currentPage, cursorY, ['N°', 'Noms, post-noms et prenoms', 'Sexe', 'Motifs'], {
      page: currentPage,
      margin: options.margin,
      rowHeight: 18,
      fontRegular: options.fontRegular,
      fontBold: options.fontBold,
      widths,
      header: true,
    });
    cursorY -= 18;

    for (const [index, eleve] of documentData.structure.nonClasses.entries()) {
      if (cursorY < 70) {
        currentPage = options.createPage();
        cursorY = options.pageHeight - options.margin;
        currentPage.drawText('NON CLASSES', {
          x: options.margin,
          y: cursorY,
          size: 11,
          font: options.fontBold,
        });
        cursorY -= 16;
        this.dessinerLigneTableau(currentPage, cursorY, ['N°', 'Noms, post-noms et prenoms', 'Sexe', 'Motifs'], {
          page: currentPage,
          margin: options.margin,
          rowHeight: 18,
          fontRegular: options.fontRegular,
          fontBold: options.fontBold,
          widths,
          header: true,
        });
        cursorY -= 18;
      }

      this.dessinerLigneTableau(currentPage, cursorY, [
        String(index + 1),
        eleve.nomComplet,
        this.formaterSexeCourt(eleve.sexe),
        this.formaterMotifsNonClasse(eleve),
      ], {
        page: currentPage,
        margin: options.margin,
        rowHeight: 18,
        fontRegular: options.fontRegular,
        fontBold: options.fontBold,
        widths,
      });
      cursorY -= 18;
    }

    return cursorY;
  }

  private formaterMotifsNonClasse(
    eleve: ProclamationDocumentDataReadModel['structure']['nonClasses'][number],
  ): string {
    const morceaux = [
      ...eleve.motifs,
      ...eleve.coursManquants.map((cours) => `cours manquant: ${cours}`),
      ...eleve.colonnesManquantes.map((colonne) => `colonne manquante: ${colonne}`),
    ].filter((valeur) => String(valeur).trim().length > 0);

    return morceaux.length > 0 ? morceaux.join(', ') : 'Aucun motif detaille';
  }

  private formaterNombre(valeur?: number): string {
    return valeur === undefined ? '-' : String(Math.round(valeur * 100) / 100);
  }

  private formaterPourcentage(valeur?: number): string {
    return valeur === undefined ? '-' : `${Math.round(valeur * 100) / 100}%`;
  }

  private formaterSexeCourt(valeur?: string): string {
    if (valeur === undefined) {
      return '-';
    }

    const sexe = String(valeur).trim().toUpperCase();
    if (sexe === 'M' || sexe === 'F') {
      return sexe;
    }

    return sexe.slice(0, 1) || '-';
  }

  private couperTexte(texte: string, largeurApprox: number, ratio = 14): string {
    const limite = Math.max(4, Math.floor(largeurApprox / ratio));
    return texte.length <= limite ? texte : `${texte.slice(0, Math.max(1, limite - 3))}...`;
  }
}
