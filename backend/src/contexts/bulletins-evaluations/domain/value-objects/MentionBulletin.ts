import { ErreurMentionBulletinInvalide } from '../exceptions/ErreurMentionBulletinInvalide';

// Ce fichier porte les mentions affichees sur les bulletins.
export enum MentionBulletin {
  E = 'E',
  TB = 'TB',
  B = 'B',
  AB = 'AB',
  ME = 'ME',
  MA = 'MA',
}

// Cette fonction convertit un pourcentage en mention de bulletin.
export function calculerMentionBulletin(valeur: number): MentionBulletin {
  if (!Number.isFinite(valeur) || valeur < 0 || valeur > 100) {
    throw new ErreurMentionBulletinInvalide();
  }

  if (valeur >= 80) {
    return MentionBulletin.E;
  }

  if (valeur >= 70) {
    return MentionBulletin.TB;
  }

  if (valeur >= 60) {
    return MentionBulletin.B;
  }

  if (valeur >= 50) {
    return MentionBulletin.AB;
  }

  if (valeur >= 40) {
    return MentionBulletin.ME;
  }

  return MentionBulletin.MA;
}
