<template>
  <ModalShell :open="open" @close="$emit('close')">
    <template #header>
      <div class="school-admin-modal__header">
        <div>
          <small>Administration ecole</small>
          <h2>Nouvelle ecole</h2>
          <p>Enregistrez un nouvel etablissement dans l'organisation selectionnee avec ses informations essentielles.</p>
        </div>
      </div>
    </template>

    <section class="school-admin-modal__section">
      <div v-if="errorMessage" class="school-admin-modal__alert">
        <strong>Action impossible</strong>
        <p>{{ errorMessage }}</p>
      </div>

      <header>
        <strong>Informations de l'ecole</strong>
        <small>Seuls les champs reellement disponibles dans le noyau actuel sont affiches ici.</small>
      </header>

      <div class="school-admin-modal__grid">
        <label class="school-admin-modal__field">
          <span>Organisation *</span>
          <select :value="form.idOrganisation" :disabled="organizationLocked" @change="updateField('idOrganisation', ($event.target as HTMLSelectElement).value)">
            <option value="">Selectionner une organisation</option>
            <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
              {{ organization.code }} - {{ organization.nom }}
            </option>
          </select>
        </label>

        <label class="school-admin-modal__field">
          <span>Code *</span>
          <input :value="form.code" type="text" placeholder="ECOLE-001" @input="updateField('code', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Nom officiel *</span>
          <input :value="form.nom" type="text" placeholder="College Saint Raphael" @input="updateField('nom', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Mode d'exploitation</span>
          <select :value="form.modeExploitation" @change="updateField('modeExploitation', ($event.target as HTMLSelectElement).value)">
            <option v-for="option in schoolModeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <small>{{ selectedModeDescription }}</small>
        </label>

        <label class="school-admin-modal__field">
          <span>Sigle</span>
          <input :value="form.sigle" type="text" placeholder="CSR" @input="updateField('sigle', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Telephone</span>
          <input :value="form.telephone" type="text" placeholder="+243..." @input="updateField('telephone', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Email</span>
          <input :value="form.email" type="email" placeholder="contact@ecole.cd" @input="updateField('email', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Province educationnelle</span>
          <input :value="form.provinceEducationnelle" type="text" placeholder="Haut-Katanga 1" @input="updateField('provinceEducationnelle', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Ville</span>
          <input :value="form.ville" type="text" placeholder="Lubumbashi" @input="updateField('ville', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field">
          <span>Commune ou territoire</span>
          <input :value="form.communeOuTerritoire" type="text" placeholder="Kampemba" @input="updateField('communeOuTerritoire', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="school-admin-modal__field school-admin-modal__field--wide">
          <span>Adresse</span>
          <input :value="form.adresse" type="text" placeholder="Adresse institutionnelle" @input="updateField('adresse', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
    </section>

    <template #footer>
      <div class="school-admin-modal__footer">
        <div class="school-admin-modal__footer-note">
          <small>{{ disableReason ?? "L'ecole sera ajoutee au registre apres confirmation." }}</small>
        </div>
        <div class="school-admin-modal__footer-actions">
          <button class="school-admin-modal__ghost" type="button" :disabled="busy" @click="$emit('close')">
            Annuler
          </button>
          <button class="school-admin-modal__primary" type="button" :disabled="!canSubmit || busy" @click="$emit('submit')">
            {{ busy ? "Creation en cours..." : "Creer l'ecole" }}
          </button>
        </div>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ModalShell from '../../../components/communs/ModalShell.vue';
import type {
  CreateSchoolPayload,
  SchoolAdministrationOrganizationItem,
  SchoolModeValue,
} from '../models/school-administration.model';
import { schoolModeOptions } from '../models/school-administration.model';

const props = defineProps<{
  open: boolean;
  form: CreateSchoolPayload;
  organizations: readonly SchoolAdministrationOrganizationItem[];
  organizationLocked: boolean;
  canSubmit: boolean;
  busy: boolean;
  disableReason: string | null;
  errorMessage: string | null;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'submit'): void;
  (event: 'update:form', value: CreateSchoolPayload): void;
}>();

const selectedModeDescription = computed(
  () => schoolModeOptions.find((option) => option.value === props.form.modeExploitation)?.description
    ?? "Choisissez le mode d'exploitation qui correspond a cette ecole.",
);

function updateField(field: keyof CreateSchoolPayload, value: string): void {
  emit('update:form', {
    ...props.form,
    [field]: value as SchoolModeValue,
  });
}
</script>

<style scoped>
.school-admin-modal__header{display:grid;gap:.35rem}
.school-admin-modal__header small{color:#61788a;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.school-admin-modal__header h2{margin:0;color:#10243b}
.school-admin-modal__header p{margin:0;color:#587083;line-height:1.6}
.school-admin-modal__section{display:grid;gap:1rem;padding:1rem 1.05rem;border-radius:24px;border:1px solid rgba(17,40,63,.08);background:#fff}
.school-admin-modal__section header{display:grid;gap:.25rem}
.school-admin-modal__section header small{color:#61788a;line-height:1.5}
.school-admin-modal__alert{padding:1rem 1.05rem;border-radius:18px;background:#fff3f3;border:1px solid rgba(185,28,28,.16);color:#8f1d1d}
.school-admin-modal__alert p{margin:.3rem 0 0;line-height:1.55}
.school-admin-modal__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.school-admin-modal__field{display:grid;gap:.45rem}
.school-admin-modal__field span{color:#4d6477;font-weight:700;font-size:.92rem}
.school-admin-modal__field input,.school-admin-modal__field select{width:100%;min-height:52px;border-radius:18px;border:1px solid rgba(17,40,63,.14);background:#fbfdff;padding:.85rem .95rem;color:#10243b}
.school-admin-modal__field small{color:#61788a;line-height:1.5}
.school-admin-modal__field--wide{grid-column:1 / -1}
.school-admin-modal__footer{display:flex;justify-content:space-between;gap:1rem;align-items:center}
.school-admin-modal__footer-note small{color:#61788a;line-height:1.5}
.school-admin-modal__footer-actions{display:flex;gap:.8rem;align-items:center}
.school-admin-modal__ghost,.school-admin-modal__primary{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.82rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12)}
.school-admin-modal__ghost{background:#fff;color:#11283f}
.school-admin-modal__primary{background:linear-gradient(135deg,#113f67,#1a6aa0);border-color:transparent;color:#fff;box-shadow:0 18px 32px rgba(17,63,103,.2)}
.school-admin-modal__primary:disabled,.school-admin-modal__ghost:disabled{opacity:.6;cursor:not-allowed;box-shadow:none}
@media (max-width: 720px){
  .school-admin-modal__footer,.school-admin-modal__footer-actions{flex-direction:column;align-items:stretch}
}
</style>
