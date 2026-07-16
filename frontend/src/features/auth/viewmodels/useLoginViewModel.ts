import { computed, reactive, ref } from 'vue';
import { connecterUtilisateur } from '../../../shared/auth/session.bootstrap';
import { mapAuthError, type AuthUserError } from './auth-error.mapper';

export function useLoginViewModel() {
  const form = reactive({ email: '', password: '', rememberMe: true });
  const showPassword = ref(false);
  const capsLock = ref(false);
  const submitting = ref(false);
  const error = ref<AuthUserError | null>(null);
  const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
  const canSubmit = computed(() => emailValid.value && form.password.length > 0 && !submitting.value);

  function updateCapsLock(event: KeyboardEvent): void {
    capsLock.value = event.getModifierState?.('CapsLock') ?? false;
  }

  async function submit(): Promise<boolean> {
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

  return { form, showPassword, capsLock, submitting, error, emailValid, canSubmit, updateCapsLock, submit };
}
