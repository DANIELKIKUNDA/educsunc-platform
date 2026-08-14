<template>
  <ModalShell :open="replayOpen" aria-label="Préparer une reconstruction" :busy="busy" :close-on-backdrop="false" @close="emit('closeReplay')">
    <template #header><ModalHeader eyebrow="Action sensible" title="Préparer une reconstruction" description="Commencez par une vérification sans modification. L’exécution reconstruit uniquement les projections prises en charge." @close="emit('closeReplay')" /></template>
    <div class="audit-modal-form">
      <label><span>Cible</span><select v-model="replayTarget" class="ui-field-control"><option value="PROJECTIONS">Projections de consultation</option><option value="ANALYTICS">Projections analytiques</option></select></label>
      <label><span>Mode</span><select v-model="replayMode" class="ui-field-control"><option value="DRY_RUN">Vérifier sans modifier</option><option value="EXECUTE">Exécuter la reconstruction</option></select></label>
      <label><span>Nombre maximal d’événements</span><input v-model.number="replayLimit" class="ui-field-control" type="number" min="1" max="1000" /></label>
      <label class="audit-modal-form__wide"><span>Justification</span><textarea v-model.trim="replayReason" class="ui-field-control" rows="4" maxlength="500" placeholder="Expliquez la raison de cette opération (10 caractères minimum)."></textarea><small>{{ replayReason.length }} / 500</small></label>
      <div class="audit-warning"><TriangleAlert :size="20" aria-hidden="true" /><p>{{ replayMode === 'DRY_RUN' ? 'Cette vérification ne modifie aucune projection.' : 'Cette opération reconstruira les projections compatibles. Elle sera tracée dans le journal.' }}</p></div>
    </div>
    <template #footer><button class="ui-button" type="button" :disabled="busy" @click="emit('closeReplay')">Annuler</button><button class="ui-button ui-button--primary" type="button" :disabled="busy || !replayValid" @click="emit('submitReplay')">{{ replayMode === 'DRY_RUN' ? 'Vérifier l’impact' : 'Confirmer la reconstruction' }}</button></template>
  </ModalShell>

  <ModalShell :open="retentionOpen" aria-label="Gérer la conservation" :busy="busy" :close-on-backdrop="false" @close="emit('closeRetention')">
    <template #header><ModalHeader eyebrow="Conservation" title="Préparer une opération d’archivage" description="Les événements restent dans la source canonique. Aucune suppression physique n’est proposée par cet écran." @close="emit('closeRetention')" /></template>
    <div class="audit-modal-form">
      <label><span>Archiver les événements antérieurs au</span><input v-model="retentionDate" class="ui-field-control" type="date" :max="today" /></label>
      <label class="audit-modal-form__wide"><span>Justification</span><textarea v-model.trim="retentionReason" class="ui-field-control" rows="4" maxlength="500" placeholder="Expliquez la raison de cette opération (10 caractères minimum)."></textarea><small>{{ retentionReason.length }} / 500</small></label>
      <div class="audit-warning"><Archive :size="20" aria-hidden="true" /><p>L’aperçu évalue uniquement les candidats. L’archivage est logique et traité par lots bornés.</p></div>
    </div>
    <template #footer><button class="ui-button" type="button" :disabled="busy" @click="emit('closeRetention')">Annuler</button><button v-if="canPreviewRetention" class="ui-button" type="button" :disabled="busy || !retentionValid" @click="emit('previewRetention')">Prévisualiser</button><button v-if="canArchive" class="ui-button ui-button--primary" type="button" :disabled="busy || !retentionValid" @click="emit('archive')">Confirmer l’archivage</button></template>
  </ModalShell>

  <ModalShell :open="integrityOpen" aria-label="Contrôler une plage d’événements" :busy="busy" :close-on-backdrop="false" @close="emit('closeIntegrity')">
    <template #header><ModalHeader eyebrow="Intégrité" title="Contrôler une plage d’événements" description="Le serveur vérifie les empreintes existantes. Le navigateur ne calcule et ne remplace aucune preuve." @close="emit('closeIntegrity')" /></template>
    <div class="audit-modal-form">
      <label><span>Du</span><input v-model="integrityDateStart" class="ui-field-control" type="date" /></label>
      <label><span>Au</span><input v-model="integrityDateEnd" class="ui-field-control" type="date" /></label>
      <label><span>Nombre maximal</span><input v-model.number="integrityLimit" class="ui-field-control" type="number" min="1" max="1000" /></label>
      <div class="audit-warning audit-modal-form__wide"><ShieldCheck :size="20" aria-hidden="true" /><p>Le contrôle est volontairement borné à 1 000 événements pour préserver la stabilité du service.</p></div>
    </div>
    <template #footer><button class="ui-button" type="button" :disabled="busy" @click="emit('closeIntegrity')">Annuler</button><button class="ui-button ui-button--primary" type="button" :disabled="busy || integrityLimit < 1 || integrityLimit > 1000" @click="emit('verifyIntegrity')">Lancer le contrôle</button></template>
  </ModalShell>
</template>

<script setup lang="ts">
import { Archive, ShieldCheck, TriangleAlert } from 'lucide-vue-next';
import ModalShell from '../../../components/communs/ModalShell.vue';
import ModalHeader from './PlatformAuditModalHeader.vue';
import type { AuditReplayMode, AuditReplayTarget } from '../models/platform-audit.model';

defineProps<{ replayOpen: boolean; retentionOpen: boolean; integrityOpen: boolean; busy: boolean; replayValid: boolean; retentionValid: boolean; canPreviewRetention: boolean; canArchive: boolean }>();
const replayTarget = defineModel<AuditReplayTarget>('replayTarget', { required: true });
const replayMode = defineModel<AuditReplayMode>('replayMode', { required: true });
const replayReason = defineModel<string>('replayReason', { required: true });
const replayLimit = defineModel<number>('replayLimit', { required: true });
const retentionDate = defineModel<string>('retentionDate', { required: true });
const retentionReason = defineModel<string>('retentionReason', { required: true });
const integrityDateStart = defineModel<string>('integrityDateStart', { required: true });
const integrityDateEnd = defineModel<string>('integrityDateEnd', { required: true });
const integrityLimit = defineModel<number>('integrityLimit', { required: true });
const emit = defineEmits<{ closeReplay: []; closeRetention: []; closeIntegrity: []; submitReplay: []; previewRetention: []; archive: []; verifyIntegrity: [] }>();
const today = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

</script>
