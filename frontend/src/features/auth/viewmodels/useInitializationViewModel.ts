import { computed, reactive, ref } from 'vue';
import { initialiserPremierManager } from '../../../shared/auth/session.bootstrap';
import {
  matchesField,
  matchesPattern,
  minimumLength,
  requiredText,
  validEmail,
  validateForm,
} from '../../../shared/forms/form-validation';
import { mapAuthError, type AuthUserError } from './auth-error.mapper';

export function useInitializationViewModel() {
  const form = reactive({
    nom: '', postnom: '', prenom: '', email: '', password: '', confirmation: '', rememberMe: true,
  });
  const showPassword = ref(false);
  const submitting = ref(false);
  const error = ref<AuthUserError | null>(null);
  const touched = reactive({
    nom: false,
    postnom: false,
    prenom: false,
    email: false,
    password: false,
    confirmation: false,
  });
  const validation = computed(() => validateForm(form, {
    nom: [requiredText('Le nom est obligatoire.')],
    postnom: [requiredText('Le postnom est obligatoire.')],
    prenom: [requiredText('Le prénom est obligatoire.')],
    email: [
      requiredText("L'adresse e-mail est obligatoire."),
      validEmail("Saisissez une adresse e-mail valide."),
    ],
    password: [
      requiredText('Le mot de passe est obligatoire.'),
      minimumLength(12, 'Le mot de passe doit contenir au moins 12 caractères.'),
      matchesPattern(/[a-z]/, 'Ajoutez au moins une lettre minuscule.'),
      matchesPattern(/[A-Z]/, 'Ajoutez au moins une lettre majuscule.'),
      matchesPattern(/[0-9]/, 'Ajoutez au moins un chiffre.'),
    ],
    confirmation: [
      requiredText('Confirmez le mot de passe.'),
      matchesField('password', 'Les deux mots de passe doivent correspondre.'),
    ],
  }));
  const fieldErrors = computed(() => Object.fromEntries(
    Object.entries(validation.value.errors).filter(([field]) => touched[field as keyof typeof touched]),
  ) as Partial<Record<keyof typeof touched, string>>);
  const passwordHint = computed(() => {
    if (!form.password) return '12 caractères minimum, avec majuscule, minuscule et chiffre.';
    if (form.password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères.';
    if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return 'Ajoutez une majuscule, une minuscule et un chiffre.';
    }
    return form.password === form.confirmation ? 'Le mot de passe est prêt.' : 'Les deux mots de passe doivent correspondre.';
  });
  const canSubmit = computed(() => validation.value.valid && !submitting.value);

  function touch(field: keyof typeof touched): void {
    touched[field] = true;
  }

  async function submit(): Promise<boolean> {
    Object.keys(touched).forEach((field) => {
      touched[field as keyof typeof touched] = true;
    });
    if (!canSubmit.value) return false;
    submitting.value = true;
    error.value = null;
    try {
      await initialiserPremierManager({
        nom: form.nom.trim(),
        postnom: form.postnom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim().toLowerCase(),
        motDePasse: form.password,
        confirmationMotDePasse: form.confirmation,
        seSouvenirDeMoi: form.rememberMe,
      });
      return true;
    } catch (cause) {
      error.value = mapAuthError(cause);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return { form, showPassword, submitting, error, fieldErrors, passwordHint, canSubmit, touch, submit };
}
