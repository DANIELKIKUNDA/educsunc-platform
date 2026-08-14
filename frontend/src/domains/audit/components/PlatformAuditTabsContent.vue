<template>
  <section class="audit-tab-content ui-surface">
    <header class="audit-panel-header">
      <div><small>{{ eyebrow }}</small><h2>{{ title }}</h2><p>{{ description }}</p></div>
    </header>

    <template v-if="tab === 'timeline'">
      <EmptyState v-if="timeline.length === 0" title="Aucune chronologie" message="Renseignez une corrélation, un acteur ou une ressource, puis relancez cette lecture." />
      <ol v-else class="audit-timeline">
        <li v-for="event in timeline" :key="event.id"><span></span><div><small>{{ event.dateLabel }} · {{ event.timeLabel }}</small><strong>{{ event.actionLabel }}</strong><p>{{ event.actorLabel }} · {{ event.resourceLabel }}</p><button type="button" @click="emit('openEvent', event.id)">Voir le détail</button></div></li>
      </ol>
    </template>

    <template v-else-if="tab === 'history'">
      <EmptyState v-if="history.length === 0" title="Aucun historique ciblé" message="Renseignez un acteur ou une ressource dans les filtres pour consulter son historique." />
      <div v-else class="audit-compact-list">
        <button v-for="event in history" :key="event.id" type="button" @click="emit('openEvent', event.id)"><span>{{ event.dateLabel }} · {{ event.timeLabel }}</span><strong>{{ event.actionLabel }}</strong><small>{{ event.actorLabel }} · {{ event.resourceLabel }}</small></button>
      </div>
    </template>

    <template v-else-if="tab === 'exports'">
      <EmptyState v-if="exports.length === 0" title="Aucun export dans cette session" message="Demandez un export depuis les opérations contrôlées. Aucun historique global n’est simulé par le navigateur." />
      <div v-else class="audit-job-list">
        <article v-for="job in exports" :key="job.id" class="audit-job-card">
          <div><span class="ui-badge" :class="job.status === 'COMPLETED' ? 'ui-badge--success' : 'ui-badge--info'">{{ job.statusLabel }}</span><h3>{{ job.format }}</h3><p>{{ job.itemCount ?? 'Nombre en attente' }} éléments · demandé {{ formatDate(job.requestedAt) }}</p><small v-if="job.error">{{ job.error }}</small></div>
          <div class="audit-job-actions"><button v-if="canReadExport" class="ui-button" type="button" @click="emit('refreshExport', job.id)">Actualiser</button><button v-if="canDownloadExport && job.status === 'COMPLETED'" class="ui-button ui-button--primary" type="button" @click="emit('downloadExport', job.id)">Télécharger</button><button v-if="canDeleteExport" class="ui-button ui-button--ghost" type="button" @click="emit('deleteExport', job.id)">Supprimer le fichier</button></div>
        </article>
      </div>
    </template>

    <template v-else-if="tab === 'retention'">
      <div v-if="retentionResult" class="audit-result-banner"><Archive :size="22" /><div><strong>Dernière opération de conservation</strong><p>Période limite: {{ formatDate(retentionResult.periode) }}</p></div></div>
      <EmptyState v-if="archives.length === 0" title="Aucune archive visible" message="Aucun événement archivé ne correspond au périmètre et aux filtres actuels." />
      <div v-else class="audit-compact-list"><button v-for="event in archives" :key="event.id" type="button" @click="emit('openEvent', event.id)"><span>{{ event.dateLabel }}</span><strong>{{ event.actionLabel }}</strong><small>{{ event.resourceLabel }}</small></button></div>
    </template>

    <template v-else-if="tab === 'integrity'">
      <EmptyState v-if="!integrity" title="Aucun contrôle lancé" message="Préparez un contrôle borné depuis les opérations contrôlées." />
      <div v-else class="audit-integrity-summary">
        <div><small>Événements contrôlés</small><strong>{{ integrity.totalVerifie }}</strong></div><div><small>Valides</small><strong>{{ integrity.compteurs.VALID }}</strong></div><div><small>Anomalies</small><strong>{{ integrity.compteurs.CORRUPTED + integrity.compteurs.MISSING }}</strong></div><div><small>Lecture tronquée</small><strong>{{ integrity.tronque ? 'Oui' : 'Non' }}</strong></div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Archive } from 'lucide-vue-next';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import type { AuditEventViewModel, AuditExportJobViewModel, AuditIntegrityRangeDto, AuditRetentionActionDto } from '../models/platform-audit.model';
import type { PlatformAuditTab } from '../viewmodels/usePlatformAuditCenterViewModel';

const props = defineProps<{ tab: PlatformAuditTab; timeline: readonly AuditEventViewModel[]; history: readonly AuditEventViewModel[]; exports: readonly AuditExportJobViewModel[]; archives: readonly AuditEventViewModel[]; retentionResult: AuditRetentionActionDto | null; integrity: AuditIntegrityRangeDto | null; canReadExport: boolean; canDownloadExport: boolean; canDeleteExport: boolean }>();
const emit = defineEmits<{ openEvent: [id: string]; refreshExport: [id: string]; downloadExport: [id: string]; deleteExport: [id: string] }>();
const title = computed(() => ({ timeline: 'Chronologie corrélée', history: 'Historique ciblé', exports: 'Exports de cette session', retention: 'Archives logiques', integrity: 'Contrôles d’intégrité', journal: 'Journal' })[props.tab]);
const eyebrow = computed(() => ({ timeline: 'Investigation', history: 'Traçabilité', exports: 'Fichiers privés', retention: 'Conservation', integrity: 'Confiance', journal: 'Journal' })[props.tab]);
const description = computed(() => ({ timeline: 'Suivez les événements associés sans transformer le centre en outil décisionnel.', history: 'Retrouvez les actions d’un acteur ou les changements d’une ressource dans votre périmètre autorisé.', exports: 'Suivez uniquement les exports demandés dans cette session sécurisée.', retention: 'Consultez les événements archivés sans suppression de la source canonique.', integrity: 'Consultez les résultats calculés par le serveur, sans cryptographie dans le navigateur.', journal: '' })[props.tab]);
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'date indisponible' : new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
</script>
