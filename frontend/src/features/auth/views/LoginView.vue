<template>
  <AuthPageShell title="Connectez-vous à votre espace">
    <form class="auth-form" novalidate @submit.prevent="onSubmit">
      <div v-if="viewModel.error.value" class="auth-alert" role="alert" aria-live="assertive">
        <CircleAlert aria-hidden="true" />
        <div>
          <strong>{{ viewModel.error.value.title }}</strong>
          <p>{{ viewModel.error.value.message }}</p>
        </div>
      </div>

      <label class="auth-field">
        <span>Adresse e-mail</span>
        <span class="auth-field__control">
          <Mail aria-hidden="true" />
          <input
            v-model="viewModel.form.email"
            type="email"
            name="email"
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            spellcheck="false"
            placeholder="nom@exemple.com"
            required
          />
        </span>
      </label>

      <label class="auth-field">
        <span>Mot de passe</span>
        <span class="auth-field__control">
          <LockKeyhole aria-hidden="true" />
          <input
            v-model="viewModel.form.password"
            :type="viewModel.showPassword.value ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            placeholder="Saisissez votre mot de passe"
            required
            @keydown="viewModel.updateCapsLock"
            @keyup="viewModel.updateCapsLock"
          />
          <button
            class="auth-field__reveal"
            type="button"
            :aria-label="viewModel.showPassword.value ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            :aria-pressed="viewModel.showPassword.value"
            @click="viewModel.showPassword.value = !viewModel.showPassword.value"
          >
            <EyeOff v-if="viewModel.showPassword.value" aria-hidden="true" />
            <Eye v-else aria-hidden="true" />
          </button>
        </span>
        <small v-if="viewModel.capsLock.value" class="auth-field__hint">La touche Verr. Maj est activée.</small>
      </label>

      <label class="auth-check">
        <input v-model="viewModel.form.rememberMe" type="checkbox" />
        <span>Se souvenir de moi sur cet appareil</span>
      </label>

      <button class="auth-submit" type="submit" :disabled="!viewModel.canSubmit.value">
        <LoaderCircle v-if="viewModel.submitting.value" class="auth-submit__spinner" aria-hidden="true" />
        <span>{{ viewModel.submitting.value ? 'Connexion en cours…' : 'Se connecter' }}</span>
        <ArrowRight v-if="!viewModel.submitting.value" aria-hidden="true" />
      </button>
    </form>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import AuthPageShell from '../components/AuthPageShell.vue';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

const router = useRouter();
const viewModel = useLoginViewModel();

async function onSubmit(): Promise<void> {
  if (await viewModel.submit()) await router.replace('/app');
}
</script>
