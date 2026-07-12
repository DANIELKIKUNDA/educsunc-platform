<template>
  <Teleport to="body">
    <div v-if="open" class="modal-shell-backdrop" @click.self="$emit('close')">
      <div class="modal-shell">
        <div class="modal-shell__header">
          <slot name="header" />
        </div>
        <div class="modal-shell__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-shell__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits<{
  (event: 'close'): void;
}>();
</script>

<style scoped>
.modal-shell-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.46);display:grid;place-items:center;padding:1.5rem;z-index:2300}
.modal-shell{width:min(980px,100%);max-height:calc(100vh - 3rem);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.modal-shell__header,.modal-shell__footer{padding:1.2rem 1.3rem}
.modal-shell__body{padding:1.3rem;overflow:auto;display:grid;gap:1.1rem;background:#fbfdff}
.modal-shell__footer{border-top:1px solid rgba(17,40,63,.08);background:#fff}

@media (max-width: 720px){
  .modal-shell-backdrop{padding:.75rem}
  .modal-shell{border-radius:22px}
}
</style>
