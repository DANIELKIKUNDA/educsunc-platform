export function afficherValeurOuAttente(valeur: string | number | null | undefined): string {
  if (valeur === null || valeur === undefined || valeur === '') {
    return 'A renseigner';
  }

  return String(valeur);
}
