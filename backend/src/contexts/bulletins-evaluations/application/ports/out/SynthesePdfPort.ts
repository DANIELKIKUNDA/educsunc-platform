import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';

// Ce port prepare ou genere une representation PDF officielle d'une synthese de resultats.
export interface SynthesePdfPort {
  genererSynthesePdf(synthese: SyntheseEcoleOutput): Promise<SynthesePdfGenere>;
}

export interface SynthesePdfGenere {
  nomFichier: string;
  contenu: Uint8Array | Buffer;
  mimeType: string;
}
