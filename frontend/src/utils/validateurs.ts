// Regroupe les validateurs techniques generiques frontend.
export const estNonVide = (valeur: string): boolean => {
  return valeur.trim().length > 0;
};
