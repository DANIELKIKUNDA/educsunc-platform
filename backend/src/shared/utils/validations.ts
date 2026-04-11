// Regroupe les helpers generiques de validation.
export const estDefini = <TValeur>(valeur: TValeur | null | undefined): valeur is TValeur => {
  return valeur !== null && valeur !== undefined;
};
