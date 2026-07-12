import type {
  CreateSchoolPayload,
  SchoolAdministrationItem,
  SchoolInstitutionalInfoPayload,
  SchoolModeValue,
} from '../models/school-administration.model';

export interface FormEvaluation {
  readonly canSubmit: boolean;
  readonly isDirty: boolean;
  readonly disableReason: string | null;
}

function normalize(value: string | undefined | null): string {
  return (value ?? '').trim();
}

function sameValue(left: string | undefined | null, right: string | undefined | null): boolean {
  return normalize(left) === normalize(right);
}

export function evaluateCreateSchoolForm(
  form: CreateSchoolPayload,
  isSubmitting: boolean,
): FormEvaluation {
  if (isSubmitting) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "L'enregistrement est deja en cours.",
    };
  }

  if (!normalize(form.idOrganisation)) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Selectionnez d'abord une organisation.",
    };
  }

  if (!normalize(form.code)) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "Renseignez le code de l'ecole.",
    };
  }

  if (!normalize(form.nom)) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "Renseignez le nom de l'ecole.",
    };
  }

  return {
    canSubmit: true,
    isDirty: true,
    disableReason: null,
  };
}

export function evaluateRenameSchool(
  currentName: string | undefined,
  draftName: string,
  isSubmitting: boolean,
): FormEvaluation {
  if (isSubmitting) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "L'enregistrement est deja en cours.",
    };
  }

  if (!normalize(draftName)) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Saisissez le nouveau nom de l'ecole.",
    };
  }

  if (sameValue(currentName, draftName)) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Le nouveau nom doit etre different du nom actuel.",
    };
  }

  return {
    canSubmit: true,
    isDirty: true,
    disableReason: null,
  };
}

export function evaluateSchoolModeUpdate(
  currentMode: SchoolModeValue | undefined,
  draftMode: SchoolModeValue,
  isSubmitting: boolean,
): FormEvaluation {
  if (isSubmitting) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "L'enregistrement est deja en cours.",
    };
  }

  if (!currentMode || currentMode === draftMode) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Choisissez un mode d'exploitation different.",
    };
  }

  return {
    canSubmit: true,
    isDirty: true,
    disableReason: null,
  };
}

export function evaluateSchoolInstitutionalInfoUpdate(
  school: SchoolAdministrationItem | null,
  form: SchoolInstitutionalInfoPayload,
  isSubmitting: boolean,
): FormEvaluation {
  if (isSubmitting) {
    return {
      canSubmit: false,
      isDirty: true,
      disableReason: "L'enregistrement est deja en cours.",
    };
  }

  if (!school) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Aucune ecole n'est ouverte.",
    };
  }

  const isDirty =
    !sameValue(school.sigle, form.sigle) ||
    !sameValue(school.telephone, form.telephone) ||
    !sameValue(school.email, form.email) ||
    !sameValue(school.provinceEducationnelle, form.provinceEducationnelle) ||
    !sameValue(school.ville, form.ville) ||
    !sameValue(school.communeOuTerritoire, form.communeOuTerritoire) ||
    !sameValue(school.adresse, form.adresse);

  if (!isDirty) {
    return {
      canSubmit: false,
      isDirty: false,
      disableReason: "Modifiez au moins une information avant d'enregistrer.",
    };
  }

  return {
    canSubmit: true,
    isDirty: true,
    disableReason: null,
  };
}
