import type {
  RecuPaiementOfficielOutput,
  RecuPaiementPdfOutput,
} from '../../application/dto/output/PaiementsSortieDTO';

function formaterMontant(montant: number): string {
  return montant.toLocaleString('fr-FR');
}

function nettoyerTextePdf(valeur: string): string {
  return valeur
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

interface LigneTextePdf {
  x: number;
  y: number;
  texte: string;
  taille?: number;
}

interface LigneTraitPdf {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Ce service produit un PDF natif simple, suffisant pour le recu officiel de paiement.
export class ServicePdfRecuPaiement {
  public async genererDepuisSortie(
    recu: RecuPaiementOfficielOutput,
  ): Promise<RecuPaiementPdfOutput> {
    const largeurPage = 595;
    const hauteurPage = 842;
    const lignesTexte: LigneTextePdf[] = [];
    const traits: LigneTraitPdf[] = [];
    const margeX = 36;
    const largeurUtile = largeurPage - margeX * 2;
    const sigle = recu.ecole.sigle ?? recu.ecole.nom;
    const dateIso = recu.dateEmission.toISOString();
    const dateCourte = dateIso.slice(0, 10).split('-').reverse().join('/');
    const heureCourte = dateIso.slice(11, 19);
    const totalFormate = `${formaterMontant(recu.totalPaye.obtenirMontant())} ${recu.totalPaye.obtenirDevise()}`;
    let y = 805;

    lignesTexte.push(
      { x: 210, y, texte: recu.ecole.nom.toUpperCase(), taille: 11 },
      { x: 195, y: y - 22, texte: 'RECU DE PAIEMENT', taille: 16 },
      { x: 420, y: 800, texte: 'RECU No', taille: 12 },
      { x: 420, y: 778, texte: recu.numeroRecu, taille: 18 },
    );
    if (recu.ecole.sigle) {
      lignesTexte.push({ x: 48, y: 800, texte: recu.ecole.sigle.toUpperCase(), taille: 12 });
    }
    if (recu.ecole.adresse) {
      lignesTexte.push({ x: 150, y: 785, texte: recu.ecole.adresse, taille: 10 });
    }
    if (recu.ecole.telephone) {
      lignesTexte.push({ x: 150, y: 770, texte: `Tel. ${recu.ecole.telephone}`, taille: 10 });
    }
    if (recu.ecole.email) {
      lignesTexte.push({ x: 150, y: 755, texte: `E-mail: ${recu.ecole.email}`, taille: 10 });
    }

    traits.push(
      { x1: margeX, y1: 730, x2: largeurPage - margeX, y2: 730 },
      { x1: margeX, y1: 690, x2: largeurPage - margeX, y2: 690 },
      { x1: margeX, y1: 560, x2: largeurPage - margeX, y2: 560 },
      { x1: margeX, y1: 380, x2: largeurPage - margeX, y2: 380 },
      { x1: margeX, y1: 310, x2: largeurPage - margeX, y2: 310 },
      { x1: margeX, y1: 220, x2: largeurPage - margeX, y2: 220 },
    );

    lignesTexte.push(
      { x: 44, y: 707, texte: 'ANNEE SCOLAIRE', taille: 10 },
      { x: 54, y: 688, texte: recu.contexteScolaire.anneeScolaire ?? '-', taille: 12 },
      { x: 190, y: 707, texte: 'CLASSE', taille: 10 },
      { x: 190, y: 688, texte: recu.contexteScolaire.classe ?? '-', taille: 12 },
      { x: 380, y: 707, texte: 'DATE', taille: 10 },
      { x: 372, y: 688, texte: dateCourte, taille: 12 },
      { x: 490, y: 707, texte: 'HEURE', taille: 10 },
      { x: 486, y: 688, texte: heureCourte, taille: 12 },
    );

    y = 660;
    const lignesEleve = [
      ['CODE ELEVE', recu.eleve.code],
      ['NOM', recu.eleve.nom],
      ['POSTNOM', recu.eleve.postnom],
      ['PRENOM', recu.eleve.prenom ?? '-'],
      ['SEXE', recu.eleve.sexe],
    ];
    for (const [libelle, valeur] of lignesEleve) {
      lignesTexte.push(
        { x: 44, y, texte: libelle, taille: 11 },
        { x: 150, y, texte: ':', taille: 11 },
        { x: 170, y, texte: valeur, taille: 11 },
      );
      y -= 22;
    }

    lignesTexte.push({ x: 220, y: 535, texte: 'DETAIL DES PAIEMENTS', taille: 12 });

    const xCol = [44, 82, 220, 430, 559];
    const yHeaderTop = 505;
    const yHeaderBottom = 478;
    const yTableBottom = 400;
    for (const x of xCol) {
      traits.push({ x1: x, y1: yHeaderTop, x2: x, y2: yTableBottom });
    }
    traits.push(
      { x1: 44, y1: yHeaderTop, x2: 559, y2: yHeaderTop },
      { x1: 44, y1: yHeaderBottom, x2: 559, y2: yHeaderBottom },
      { x1: 44, y1: yTableBottom, x2: 559, y2: yTableBottom },
    );
    lignesTexte.push(
      { x: 57, y: 487, texte: 'No', taille: 10 },
      { x: 130, y: 487, texte: 'TYPE DE FRAIS', taille: 10 },
      { x: 305, y: 487, texte: 'LIBELLE / MOIS', taille: 10 },
      { x: 458, y: 487, texte: 'MONTANT (FC)', taille: 10 },
    );

    let yLigne = 458;
    for (const ligne of recu.lignes.slice(0, 6)) {
      traits.push({ x1: 44, y1: yLigne - 10, x2: 559, y2: yLigne - 10 });
      lignesTexte.push(
        { x: 57, y: yLigne, texte: String(ligne.numeroLigne), taille: 10 },
        { x: 90, y: yLigne, texte: ligne.typeFrais.replaceAll('_', ' '), taille: 10 },
        { x: 224, y: yLigne, texte: ligne.libelle, taille: 10 },
        { x: 470, y: yLigne, texte: formaterMontant(ligne.montant.obtenirMontant()), taille: 10 },
      );
      yLigne -= 28;
    }

    lignesTexte.push(
      { x: 330, y: 392, texte: 'TOTAL PAYE', taille: 11 },
      { x: 454, y: 392, texte: totalFormate, taille: 11 },
      { x: 44, y: 355, texte: 'MONTANT EN LETTRES :', taille: 11 },
      { x: 44, y: 336, texte: recu.montantEnLettres, taille: 10 },
      { x: 44, y: 285, texte: 'MODE DE PAIEMENT :', taille: 11 },
      { x: 190, y: 285, texte: String(recu.modePaiement), taille: 11 },
      { x: 100, y: 165, texte: 'CAISSIER', taille: 12 },
      { x: 88, y: 145, texte: recu.caissier.nomComplet, taille: 10 },
      { x: 385, y: 165, texte: "CACHET DE L'ECOLE", taille: 12 },
      { x: 210, y: 78, texte: `* ${sigle} vous remercie *`, taille: 12 },
    );
    if (recu.caissier.signatureUrl) {
      lignesTexte.push({ x: 88, y: 120, texte: 'Signature disponible dans le profil caissier', taille: 8 });
    }
    if (recu.ecole.cachetUrl) {
      lignesTexte.push({ x: 368, y: 145, texte: 'Cachet numerique disponible', taille: 8 });
    }

    const contenuFlux = [
      'BT',
      '/F1 11 Tf',
      ...lignesTexte.map((ligne) =>
        `1 0 0 1 ${ligne.x} ${ligne.y} Tm /F1 ${ligne.taille ?? 11} Tf (${nettoyerTextePdf(ligne.texte)}) Tj`),
      'ET',
      '0.5 w',
      ...traits.map((trait) => `${trait.x1} ${trait.y1} m ${trait.x2} ${trait.y2} l S`),
    ].join('\n');

    const pdf = this.construirePdfMinimal(largeurPage, hauteurPage, contenuFlux);

    return {
      nomFichier: `recu-${recu.numeroRecu}.pdf`,
      mimeType: 'application/pdf',
      contenu: pdf,
    };
  }

  private construirePdfMinimal(
    largeurPage: number,
    hauteurPage: number,
    contenuFlux: string,
  ): Buffer {
    const objets = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
      `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${largeurPage} ${hauteurPage}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(contenuFlux, 'utf8')} >> stream\n${contenuFlux}\nendstream endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const objet of objets) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${objet}\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objets.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }
}
