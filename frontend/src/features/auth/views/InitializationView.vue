<template>
  <AuthPageShell
    title="Initialisez votre plateforme"
    description="Créez le premier compte de gouvernance EduSync. Cette étape ne sera proposée qu’une seule fois."
    wide
  >
    <form class="auth-form auth-form--initialization" novalidate @submit.prevent="onSubmit">
      <div v-if="viewModel.error.value" class="auth-alert" role="alert" aria-live="assertive">
        <CircleAlert aria-hidden="true" />
        <div><strong>{{ viewModel.error.value.title }}</strong><p>{{ viewModel.error.value.message }}</p></div>
      </div>

      <div class="auth-form__grid">
        <label v-for="field in identityFields" :key="field.key" class="auth-field">
          <span>{{ field.label }}</span>
          <span class="auth-field__control">
            <UserRound aria-hidden="true" />
            <input v-model="viewModel.form[field.key]" type="text" :autocomplete="field.autocomplete" required />
          </span>
        </label>
      </div>

      <label class="auth-field">
        <span>Adresse e-mail</span>
        <span class="auth-field__control">
          <Mail aria-hidden="true" />
          <input v-model="viewModel.form.email" type="email" autocomplete="email" inputmode="email" required />
        </span>
      </label>

      <div class="auth-form__grid">
        <label class="auth-field">
          <span>Mot de passe</span>
          <span class="auth-field__control">
            <LockKeyhole aria-hidden="true" />
            <input v-model="viewModel.form.password" :type="viewModel.showPassword.value ? 'text' : 'password'" autocomplete="new-password" required />
          </span>
        </label>
        <label class="auth-field">
          <span>Confirmer le mot de passe</span>
          <span class="auth-field__control">
            <ShieldCheck aria-hidden="true" />
            <input v-model="viewModel.form.confirmation" :type="viewModel.showPassword.value ? 'text' : 'password'" autocomplete="new-password" required />
          </span>
        </label>
      </div>
      <p class="auth-password-hint">{{ viewModel.passwordHint.value }}</p>

      <div class="auth-form__options">
        <label class="auth-check">
          <input v-model="viewModel.form.rememberMe" type="checkbox" />
          <span>Conserver la connexion sur cet appareil</span>
        </label>
        <button class="auth-text-action" type="button" @click="viewModel.showPassword.value = !viewModel.showPassword.value">
          {{ viewModel.showPassword.value ? 'Masquer les mots de passe' : 'Afficher les mots de passe' }}
        </button>
      </div>

      <button class="auth-submit" type="submit" :disabled="!viewModel.canSubmit.value">
        <LoaderCircle v-if="viewModel.submitting.value" class="auth-submit__spinner" aria-hidden="true" />
        <span>{{ viewModel.submitting.value ? 'Initialisation en cours…' : 'Initialiser EduSync' }}</span>
        <ArrowRight v-if="!viewModel.submitting.value" aria-hidden="true" />
      </button>
    </form>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { ArrowRight, CircleAlert, LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import AuthPageShell from '../components/AuthPageShell.vue';
import { useInitializationViewModel } from '../viewmodels/useInitializationViewModel';

const router = useRouter();
const viewModel = useInitializationViewModel();
const identityFields = [
  { key: 'nom' as const, label: 'Nom', autocomplete: 'family-name' },
  { key: 'postnom' as const, label: 'Postnom', autocomplete: 'additional-name' },
  { key: 'prenom' as const, label: 'Prénom', autocomplete: 'given-name' },
];

async function onSubmit(): Promise<void> {
  if (await viewModel.submit()) await router.replace('/app');
}
</script>
