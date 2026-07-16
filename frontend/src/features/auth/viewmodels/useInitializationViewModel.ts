import { computed, reactive, ref } from 'vue';
import { initialiserPremierManager } from '../../../shared/auth/session.bootstrap';
import { mapAuthError, type AuthUserError } from './auth-error.mapper';

export function useInitializationViewModel() {
  const form = reactive({
    nom: '', postnom: '', prenom: '', email: '', password: '', confirmation: '', rememberMe: true,
  });
  const showPassword = ref(false);
  const submitting = ref(false);
  const error = ref<AuthUserError | null>(null);
  const passwordHint = computed(() => {
    if (!form.password) return '12 caractères minimum, avec majuscule, minuscule et chiffre.';
    if (form.password.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères.';
    if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return 'Ajoutez une majuscule, une minuscule et un chiffre.';
    }
    return form.password === form.confirmation ? 'Le mot de passe est prêt.' : 'Les deux mots de passe doivent correspondre.';
  });
  const canSubmit = computed(() =>
    [form.nom, form.postnom, form.prenom].every((value) => value.trim().length > 0)
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    && form.password.length >= 12
    && /[a-z]/.test(form.password)
    && /[A-Z]/.test(form.password)
    && /[0-9]/.test(form.password)
    && form.password === form.confirmation
    && !submitting.value,
  );

  async function submit(): Promise<boolean> {
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

  return { form, showPassword, submitting, error, passwordHint, canSubmit, submit };
}
