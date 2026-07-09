<template>
  <ModalShell :open="open" @close="$emit('close')">
    <template #header>
      <div class="org-modal__header">
        <div>
          <small>{{ mode === 'rename' ? 'Modification' : 'Creation d organisation' }}</small>
          <h2>{{ mode === 'rename' ? 'Modifier l organisation' : 'Nouvelle organisation' }}</h2>
          <p>
            {{ mode === 'rename'
              ? 'Mettez a jour le nom de l organisation selectionnee.'
              : 'Renseignez les informations essentielles pour enregistrer une nouvelle organisation.' }}
          </p>
        </div>
        <button class="org-icon-button" type="button" :disabled="busy" @click="$emit('close')">
          <X :size="16" />
        </button>
      </div>
    </template>

    <section class="org-modal-section">
      <div v-if="errorMessage" class="org-form-alert">
        <strong>Action impossible</strong>
        <p>{{ errorMessage }}</p>
      </div>

      <header>
        <strong>{{ mode === 'rename' ? 'Nouveau nom' : 'Informations de l organisation' }}</strong>
        <small>{{ mode === 'rename' ? 'Le nom est requis pour enregistrer la modification.' : 'Tous les champs marques par * sont obligatoires.' }}</small>
      </header>

      <div v-if="mode === 'rename'" class="org-form-grid">
        <label class="org-form-field org-form-field--wide">
          <span>Nom *</span>
          <input :value="organisationForm.nom" type="text" placeholder="Nom de l organisation" @input="mettreAJourOrganisation('nom', ($event.target as HTMLInputElement).value)" />
          <small v-if="organisationErrors.nom" class="org-field-error">{{ organisationErrors.nom }}</small>
        </label>
      </div>

      <div v-else class="org-form-grid">
        <label class="org-form-field">
          <span>Code *</span>
          <input :value="organisationForm.code" type="text" placeholder="ORG-001" @input="mettreAJourOrganisation('code', ($event.target as HTMLInputElement).value)" />
          <small v-if="organisationErrors.code" class="org-field-error">{{ organisationErrors.code }}</small>
        </label>
        <label class="org-form-field">
          <span>Nom *</span>
          <input :value="organisationForm.nom" type="text" placeholder="Organisation educative" @input="mettreAJourOrganisation('nom', ($event.target as HTMLInputElement).value)" />
          <small v-if="organisationErrors.nom" class="org-field-error">{{ organisationErrors.nom }}</small>
        </label>
        <label class="org-form-field">
          <span>Type *</span>
          <select :value="organisationForm.typeOrganisation" @change="mettreAJourOrganisation('typeOrganisation', ($event.target as HTMLSelectElement).value)">
            <option value="">Selectionner</option>
            <option value="PROMOTEUR">PROMOTEUR</option>
            <option value="COORDINATION">COORDINATION</option>
            <option value="RESEAU">RESEAU</option>
            <option value="ECOLE_SEULE">ECOLE_SEULE</option>
            <option value="AUTRE">AUTRE</option>
          </select>
          <small v-if="organisationErrors.typeOrganisation" class="org-field-error">{{ organisationErrors.typeOrganisation }}</small>
        </label>
        <label class="org-form-field org-form-field--wide">
          <span>Description</span>
          <textarea :value="organisationForm.description" rows="3" placeholder="Description optionnelle" @input="mettreAJourOrganisation('description', ($event.target as HTMLTextAreaElement).value)" />
        </label>
      </div>
    </section>

    <section v-if="mode !== 'rename'" class="org-modal-section">
      <header>
        <strong>Promoteur de l organisation</strong>
        <small>Ce bloc permet d associer le proprietaire principal de l organisation des sa creation.</small>
      </header>
      <div class="org-form-grid">
        <label class="org-form-field">
          <span>Nom complet</span>
          <input :value="promoteurForm.nomComplet" type="text" placeholder="Jean Mukendi" @input="mettreAJourPromoteur('nomComplet', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="org-form-field">
          <span>Telephone</span>
          <input :value="promoteurForm.telephone" type="tel" placeholder="+243..." @input="mettreAJourPromoteur('telephone', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="org-form-field">
          <span>Email</span>
          <input :value="promoteurForm.email" type="email" placeholder="promoteur@organisation.cd" @input="mettreAJourPromoteur('email', ($event.target as HTMLInputElement).value)" />
          <small v-if="promoteurErrors.email" class="org-field-error">{{ promoteurErrors.email }}</small>
        </label>
        <label class="org-form-field">
          <span>Identifiant</span>
          <input :value="promoteurForm.identifiant" type="text" placeholder="promoteur.org" @input="mettreAJourPromoteur('identifiant', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="org-form-field org-form-field--wide">
          <span>Mot de passe initial</span>
          <input :value="promoteurForm.motDePasseInitial" type="password" placeholder="********" @input="mettreAJourPromoteur('motDePasseInitial', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
    </section>

    <template #footer>
      <div class="org-modal__footer">
        <button class="org-ghost-button" type="button" :disabled="busy" @click="$emit('close')">Annuler</button>
        <button class="org-primary-button" type="button" :disabled="!canSubmit || busy" @click="$emit('submit')">
          <Save :size="16" />
          <span>{{ busy ? (mode === 'rename' ? 'Modification en cours...' : 'Creation en cours...') : (mode === 'rename' ? 'Enregistrer' : 'Creer l organisation') }}</span>
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Save, X } from 'lucide-vue-next';
import ModalShell from '../../../components/communs/ModalShell.vue';

interface OrganisationForm {
  code: string;
  nom: string;
  typeOrganisation: string;
  description: string;
}

interface PromoteurForm {
  nomComplet: string;
  telephone: string;
  email: string;
  identifiant: string;
  motDePasseInitial: string;
}

const props = withDefaults(defineProps<{
  open: boolean;
  organisationForm: OrganisationForm;
  promoteurForm: PromoteurForm;
  canSubmit: boolean;
  busy: boolean;
  errorMessage?: string;
  mode?: 'create' | 'rename';
}>(), {
  mode: 'create',
  errorMessage: '',
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'submit'): void;
  (event: 'update:organisationForm', value: OrganisationForm): void;
  (event: 'update:promoteurForm', value: PromoteurForm): void;
}>();

const organisationErrors = computed(() => ({
  code: props.mode === 'create' && props.organisationForm.code.trim().length === 0 ? 'Le code est obligatoire.' : '',
  nom: props.organisationForm.nom.trim().length === 0 ? 'Le nom est obligatoire.' : '',
  typeOrganisation: props.mode === 'create' && props.organisationForm.typeOrganisation.trim().length === 0 ? 'Le type est obligatoire.' : '',
}));

const promoteurErrors = computed(() => ({
  email: props.promoteurForm.email.trim().length > 0 && !props.promoteurForm.email.includes('@') ? 'Le format de l email est invalide.' : '',
}));

function mettreAJourOrganisation(cle: keyof OrganisationForm, valeur: string): void {
  emit('update:organisationForm', {
    ...props.organisationForm,
    [cle]: valeur,
  });
}

function mettreAJourPromoteur(cle: keyof PromoteurForm, valeur: string): void {
  emit('update:promoteurForm', {
    ...props.promoteurForm,
    [cle]: valeur,
  });
}
</script>

<style scoped>
.org-modal__header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.org-modal__header small{display:block;color:#587083;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.org-modal__header h2{margin:.2rem 0 .3rem;font-size:1.6rem}
.org-modal__header p{margin:0;color:#587083;line-height:1.55}
.org-icon-button{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:14px;border:1px solid rgba(17,40,63,.12);background:#fff;color:#17324a}
.org-modal-section{background:#fff;border:1px solid rgba(17,40,63,.08);border-radius:24px;padding:1.1rem}
.org-form-alert{margin:0 0 1rem;padding:1rem 1.05rem;border-radius:18px;background:#fff3f3;border:1px solid rgba(185,28,28,.16);color:#8f1d1d}
.org-form-alert p{margin:.25rem 0 0;line-height:1.55}
.org-modal-section header{display:grid;gap:.25rem;margin-bottom:1rem}
.org-modal-section header small{color:#587083;line-height:1.5}
.org-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.org-form-field{display:grid;gap:.45rem}
.org-form-field span{font-size:.85rem;font-weight:700;color:#4b6475}
.org-form-field input,.org-form-field select,.org-form-field textarea{border-radius:18px;border:1px solid rgba(17,40,63,.12);padding:.9rem 1rem;background:#fbfdff;font:inherit;color:#11283f}
.org-form-field--wide{grid-column:1/-1}
.org-field-error{color:#b91c1c;font-size:.82rem;font-weight:600}
.org-modal__footer{display:flex;justify-content:flex-end;gap:.8rem}
.org-primary-button,.org-ghost-button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-weight:600;border-radius:999px;padding:.82rem 1.15rem;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f}
.org-primary-button{background:linear-gradient(135deg,#1147d8,#2563eb);border-color:transparent;color:#fff;box-shadow:0 16px 32px rgba(37,99,235,.24)}
.org-primary-button:disabled,.org-ghost-button:disabled,.org-icon-button:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}
.org-ghost-button{background:#f8fbff}
@media (max-width: 720px){
  .org-modal__footer{flex-direction:column}
}
</style>
