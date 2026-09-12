<template>
  <div class="notif-data" role="status">
    <p v-if="!entries.length" class="notif-data__empty">Aucune donnée disponible.</p>
    <dl v-else class="notif-data__grid">
      <template v-for="entry in entries" :key="entry.key">
        <dt>{{ label(entry.key) }}</dt>
        <dd>{{ value(entry.value) }}</dd>
      </template>
    </dl>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: unknown }>();
const entries = computed(() => {
  const source = props.data;
  if (!source || typeof source !== 'object') return source == null ? [] : [{ key: 'résultat', value: source }];
  if (Array.isArray(source)) return source.slice(0, 12).map((value, index) => ({ key: `élément ${index + 1}`, value }));
  return Object.entries(source as Record<string, unknown>).slice(0, 16).map(([key, value]) => ({ key, value }));
});
function label(key: string): string { return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase()); }
function value(input: unknown): string {
  if (input == null) return '—';
  if (typeof input === 'boolean') return input ? 'Oui' : 'Non';
  if (typeof input === 'string' || typeof input === 'number') return String(input);
  if (Array.isArray(input)) return input.length ? input.map((item) => typeof item === 'object' ? 'Détail' : String(item)).join(' · ') : 'Aucun';
  if (typeof input === 'object') return Object.entries(input as Record<string, unknown>).slice(0, 6).map(([k,v]) => `${label(k)}: ${typeof v === 'object' ? 'Détail' : String(v ?? '—')}`).join(' · ');
  return String(input);
}
</script>
<style scoped>
.notif-data{border:1px solid rgba(17,40,63,.1);border-radius:18px;background:#fff;padding:1rem}.notif-data__grid{display:grid;grid-template-columns:minmax(9rem,.8fr) minmax(0,2fr);gap:.65rem 1rem;margin:0}.notif-data dt{font-size:.78rem;font-weight:800;letter-spacing:.02em;color:#607083}.notif-data dd{margin:0;overflow-wrap:anywhere;color:#17283b}.notif-data__empty{margin:0;color:#66788a}@media(max-width:680px){.notif-data__grid{grid-template-columns:1fr}.notif-data dd{padding-bottom:.55rem;border-bottom:1px solid rgba(17,40,63,.07)}}
</style>
