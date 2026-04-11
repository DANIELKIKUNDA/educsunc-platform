// Ce service definit une abstraction transverse du stockage de fichiers afin de decoupler l'application de la technologie sous-jacente.
export interface ServiceStockageFichier {
  // Cette methode televerse un contenu dans un chemin logique et retourne le chemin cible resolu.
  televerser(chemin: string, contenu: Buffer | string): Promise<string>;

  // Cette methode telecharge un contenu stocke ou retourne null si le fichier est absent.
  telecharger(chemin: string): Promise<Buffer | string | null>;

  // Cette methode supprime un fichier stocke s'il existe.
  supprimer(chemin: string): Promise<void>;
}
