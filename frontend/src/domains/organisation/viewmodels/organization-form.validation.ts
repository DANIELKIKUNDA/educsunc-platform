import {
  requiredText,
  validEmail,
  validateForm,
  type FormFieldErrors,
} from '../../../shared/forms/form-validation';

export interface OrganizationFormDraft {
  code: string;
  nom: string;
  typeOrganisation: string;
  description: string;
}

export interface OrganizationOwnerDraft {
  nomComplet: string;
  telephone: string;
  email: string;
  identifiant: string;
  motDePasseInitial: string;
}

export interface OrganizationCreationEvaluation {
  readonly valid: boolean;
  readonly organizationErrors: FormFieldErrors<OrganizationFormDraft>;
  readonly ownerErrors: FormFieldErrors<OrganizationOwnerDraft>;
  readonly ownerStarted: boolean;
}

export function evaluateOrganizationCreation(
  organization: Readonly<OrganizationFormDraft>,
  owner: Readonly<OrganizationOwnerDraft>,
): OrganizationCreationEvaluation {
  const organizationValidation = validateForm(organization, {
    code: [requiredText("Le code de l'organisation est obligatoire.")],
    nom: [requiredText("Le nom de l'organisation est obligatoire.")],
    typeOrganisation: [requiredText("Le type d'organisation est obligatoire.")],
  });
  const ownerStarted = Object.values(owner).some((value) => value.trim().length > 0);
  const ownerValidation = validateForm(owner, {
    nomComplet: ownerStarted ? [requiredText('Le nom complet du responsable est obligatoire.')] : [],
    email: ownerStarted
      ? [
        requiredText("L'adresse e-mail du responsable est obligatoire."),
        validEmail("Saisissez une adresse e-mail valide."),
      ]
      : [],
    motDePasseInitial: ownerStarted
      ? [requiredText('Le mot de passe initial est obligatoire.')]
      : [],
  });

  return {
    valid: organizationValidation.valid && ownerValidation.valid,
    organizationErrors: organizationValidation.errors,
    ownerErrors: ownerValidation.errors,
    ownerStarted,
  };
}

export function evaluateOrganizationEdit(form: Readonly<{
  nom: string;
  typeOrganisation: string;
  responsableEmail: string;
}>): FormFieldErrors<typeof form> {
  return validateForm(form, {
    nom: [requiredText("Le nom de l'organisation est obligatoire.")],
    typeOrganisation: [requiredText("Le type d'organisation est obligatoire.")],
    responsableEmail: [validEmail("L'adresse e-mail du responsable est invalide.", true)],
  }).errors;
}
