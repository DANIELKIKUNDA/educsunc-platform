<template>
  <section class="audit-operations ui-surface">
    <header class="audit-panel-header">
      <div><small>Fonctions avancées</small><h2>Opérations contrôlées</h2><p>Chaque action respecte les permissions actives et reste confirmée par le serveur.</p></div>
    </header>
    <div class="audit-operation-grid">
      <article v-if="canExport || canForensicExport" class="audit-operation-card">
        <div class="audit-operation-card__icon"><FileDown aria-hidden="true" /></div>
        <h3>Exporter le journal</h3>
        <p>Préparez un fichier privé à partir des filtres actuellement appliqués.</p>
        <label><span>Format</span><select v-model="format" class="ui-field-control"><option value="CSV">Excel / CSV</option><option value="PDF">PDF</option><option value="JSON">JSON</option></select></label>
        <button v-if="canExport" class="ui-button ui-button--primary" type="button" :disabled="busy" @click="emit('export')">Demander l’export</button>
        <button v-if="canForensicExport" class="ui-button ui-button--ghost" type="button" :disabled="busy" @click="emit('forensicExport')">Exporter l’investigation</button>
      </article>
      <article v-if="canReplay" class="audit-operation-card">
        <div class="audit-operation-card__icon"><RefreshCcw aria-hidden="true" /></div>
        <h3>Reconstruire une projection</h3>
        <p>Vérifiez d’abord l’impact, puis exécutez uniquement lorsque cela est nécessaire.</p>
        <button class="ui-button" type="button" :disabled="busy" @click="emit('openReplay')">Préparer la reconstruction</button>
        <div v-if="replayResult" class="audit-operation-result" role="status">
          <strong>{{ replayResult.mode === 'DRY_RUN' ? 'Simulation terminée' : 'Reconstruction terminée' }}</strong>
          <span>{{ replayResult.reconstruites ?? replayResult.evenementsCompatibles ?? 0 }} événement(s) traité(s) · {{ replayResult.statut }}</span>
        </div>
      </article>
      <article v-if="canRetention" class="audit-operation-card">
        <div class="audit-operation-card__icon"><Archive aria-hidden="true" /></div>
        <h3>Conservation et archives</h3>
        <p>Archivez logiquement les événements anciens, sans suppression physique automatique.</p>
        <button class="ui-button" type="button" :disabled="busy" @click="emit('openRetention')">Gérer la conservation</button>
      </article>
      <article v-if="canIntegrity" class="audit-operation-card">
        <div class="audit-operation-card__icon"><ShieldCheck aria-hidden="true" /></div>
        <h3>Contrôler l’intégrité</h3>
        <p>Demandez au serveur de vérifier une plage bornée d’événements.</p>
        <button class="ui-button" type="button" :disabled="busy" @click="emit('openIntegrity')">Préparer le contrôle</button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Archive, FileDown, RefreshCcw, ShieldCheck } from 'lucide-vue-next';
import type { AuditExportFormat, AuditReplayDto } from '../models/platform-audit.model';

defineProps<{ busy: boolean; canExport: boolean; canForensicExport: boolean; canReplay: boolean; canRetention: boolean; canIntegrity: boolean; replayResult: AuditReplayDto | null }>();
const format = defineModel<AuditExportFormat>('format', { required: true });
const emit = defineEmits<{ export: []; forensicExport: []; openReplay: []; openRetention: []; openIntegrity: [] }>();
</script>
