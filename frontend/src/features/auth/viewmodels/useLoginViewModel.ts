import { computed, reactive, ref } from 'vue';
import { connecterUtilisateur } from '../../../shared/auth/session.bootstrap';
import {
  requiredText,
  validEmail,
  validateForm,
} from '../../../shared/forms/form-validation';
import { mapAuthError, type AuthUserError } from './auth-error.mapper';

export function useLoginViewModel() {
  const form = reactive({ email: '', password: '', rememberMe: true });
  const showPassword = ref(false);
  const capsLock = ref(false);
  const submitting = ref(false);
  const error = ref<AuthUserError | null>(null);
  const touched = reactive({ email: false, password: false });
  const validation = computed(() => validateForm(form, {
    email: [
      requiredText("L'adresse e-mail est obligatoire."),
      validEmail("Saisissez une adresse e-mail valide."),
    ],
    password: [requiredText('Le mot de passe est obligatoire.')],
  }));
  const fieldErrors = computed(() => ({
    email: touched.email ? validation.value.errors.email : undefined,
    password: touched.password ? validation.value.errors.password : undefined,
  }));
  const emailValid = computed(() => !validation.value.errors.email);
  const canSubmit = computed(() => validation.value.valid && !submitting.value);

  function touch(field: keyof typeof touched): void {
    touched[field] = true;
  }

  function updateCapsLock(event: KeyboardEvent): void {
    capsLock.value = event.getModifierState?.('CapsLock') ?? false;
  }

  async function submit(): Promise<boolean> {
    touched.email = true;
    touched.password = true;
    if (!canSubmit.value) return false;
    submitting.value = true;
    error.value = null;
    try {
      await connecterUtilisateur({
        email: form.email.trim().toLowerCase(),
        motDePasse: form.password,
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

  return {
    form,
    showPassword,
    capsLock,
    submitting,
    error,
    fieldErrors,
    emailValid,
    canSubmit,
    touch,
    updateCapsLock,
    submit,
  };
}
