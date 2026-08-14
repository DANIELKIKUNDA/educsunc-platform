<template>
  <ModalShell :open="open" aria-label="Détail de l’événement d’audit" :busy="loading" @close="emit('close')">
    <template #header>
      <div class="audit-modal-header">
        <div>
          <small>Événement d’audit</small>
          <h2>{{ event?.actionLabel ?? 'Chargement du détail…' }}</h2>
          <p v-if="event">{{ event.dateLabel }} à {{ event.timeLabel }} · {{ event.scopeLabel }}</p>
        </div>
        <button class="audit-icon-button" type="button" aria-label="Fermer le détail" :disabled="loading" @click="emit('close')">
          <X :size="20" aria-hidden="true" />
        </button>
      </div>
    </template>

    <LoadingState v-if="loading" title="Chargement du détail" message="L’événement est relu dans le périmètre autorisé." />
    <ErrorState v-else-if="errorMessage" title="Détail indisponible" :message="errorMessage" />
    <template v-else-if="event">
      <div class="audit-detail-status">
        <span class="ui-badge" :class="severityTone">{{ event.severityLabel }}</span>
        <span class="ui-badge" :class="resultTone">{{ event.resultLabel }}</span>
        <span v-for="category in event.categoryLabels" :key="category" class="ui-badge">{{ category }}</span>
      </div>

      <section class="audit-detail-section">
        <h3>Informations principales</h3>
        <dl class="audit-detail-grid">
          <div><dt>Identifiant</dt><dd>{{ event.id }}</dd></div>
          <div><dt>Type</dt><dd>{{ event.typeLabel }}</dd></div>
          <div><dt>Acteur</dt><dd>{{ event.actorLabel }}</dd></div>
          <div><dt>Rôle</dt><dd>{{ event.actorRole }}</dd></div>
          <div><dt>Ressource</dt><dd>{{ event.resourceLabel }}</dd></div>
          <div><dt>Type de ressource</dt><dd>{{ event.resourceType || 'Non renseigné' }}</dd></div>
          <div><dt>Organisation</dt><dd>{{ event.organizationId || 'Non applicable' }}</dd></div>
          <div><dt>École</dt><dd>{{ event.schoolId || 'Non applicable' }}</dd></div>
        </dl>
      </section>

      <section class="audit-detail-section">
        <h3>Traçabilité</h3>
        <dl class="audit-detail-grid">
          <div><dt>Source</dt><dd>{{ event.sourceLabel }}</dd></div>
          <div><dt>Mode hors connexion</dt><dd>{{ event.offline ? 'Oui' : 'Non' }}</dd></div>
          <div><dt>Identifiant de demande</dt><dd>{{ event.requestId || 'Non renseigné' }}</dd></div>
          <div><dt>Corrélation</dt><dd>{{ event.correlationId || 'Non renseignée' }}</dd></div>
          <div><dt>Session</dt><dd>{{ event.sessionId || 'Non renseignée' }}</dd></div>
        </dl>
      </section>

      <section v-if="event.metadata.length" class="audit-detail-section">
        <h3>Informations complémentaires</h3>
        <dl class="audit-detail-grid">
          <div v-for="field in event.metadata" :key="field.key"><dt>{{ field.label }}</dt><dd>{{ field.value }}</dd></div>
        </dl>
      </section>

      <section v-if="eventIntegrity" class="audit-integrity-result" aria-live="polite">
        <ShieldCheck :size="22" aria-hidden="true" />
        <div><strong>Intégrité: {{ integrityLabel }}</strong><p>{{ eventIntegrity.raison ?? 'Contrôle effectué par le serveur.' }}</p></div>
      </section>
    </template>

    <template #footer>
      <button v-if="canIntegrity && event" class="ui-button" type="button" :disabled="loading" @click="emit('verifyIntegrity')">
        <ShieldCheck :size="17" aria-hidden="true" /> Vérifier l’intégrité
      </button>
      <button class="ui-button ui-button--primary" type="button" :disabled="loading" @click="emit('close')">Fermer</button>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShieldCheck, X } from 'lucide-vue-next';
import ModalShell from '../../../components/communs/ModalShell.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import type { AuditEventViewModel, AuditIntegrityItemDto } from '../models/platform-audit.model';

const props = defineProps<{
  open: boolean;
  loading: boolean;
  event: AuditEventViewModel | null;
  eventIntegrity: AuditIntegrityItemDto | null;
  errorMessage: string | null;
  canIntegrity: boolean;
}>();
const emit = defineEmits<{ close: []; verifyIntegrity: [] }>();
const severityTone = computed(() => props.event?.severity === 'CRITIQUE' ? 'ui-badge--danger' : 'ui-badge--warning');
const resultTone = computed(() => ['SUCCESS', 'IGNORED_DUPLICATE'].includes(props.event?.result ?? '') ? 'ui-badge--success' : 'ui-badge--warning');
const integrityLabel = computed(() => ({ VALID: 'Valide', CORRUPTED: 'Anomalie détectée', MISSING: 'Empreinte absente', UNKNOWN: 'Non déterminée' })[props.eventIntegrity?.statut ?? 'UNKNOWN']);
</script>
