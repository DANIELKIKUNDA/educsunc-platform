import type { ClassementClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ClassementClasseOutput';

// Ce presenter transforme un classement en reponse HTTP exploitable.
export class ClassementPresenter {
  // Cette methode enveloppe le classement dans une charge utile uniforme.
  public static presenter(classement: ClassementClasseOutput): { donnee: ClassementClasseOutput } {
    return { donnee: classement };
  }
}
