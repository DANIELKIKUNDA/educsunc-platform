<template>
  <section class="action-toolbar">
    <div class="action-toolbar__surface">
      <header v-if="title || description" class="action-toolbar__header">
        <div>
          <h3 v-if="title">{{ title }}</h3>
          <p v-if="description">{{ description }}</p>
        </div>
        <slot name="header-actions" />
      </header>

      <div v-if="$slots.filters" class="action-toolbar__filters">
        <slot name="filters" />
      </div>

      <div v-if="$slots.actions" class="action-toolbar__actions">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
.action-toolbar__surface{
  display:grid;
  gap:1rem;
  padding:1.1rem 1.15rem 1.2rem;
  border-radius:var(--ui-radius-lg);
  border:1px solid var(--ui-border);
  background:linear-gradient(180deg,var(--ui-surface),var(--ui-surface-subtle));
  box-shadow:var(--ui-shadow-md);
}

.action-toolbar__header{
  display:flex;
  align-items:start;
  justify-content:space-between;
  gap:1rem;
}

.action-toolbar__header h3{
  margin:0;
  color:var(--ui-text-strong);
  font-size:1rem;
}

.action-toolbar__header p{
  margin:.3rem 0 0;
  color:var(--ui-text-muted);
  line-height:1.55;
}

.action-toolbar__filters,
.action-toolbar__actions{
  display:flex;
  flex-wrap:wrap;
  gap:.9rem;
  width:100%;
  max-width:100%;
}

@media (min-width: 1080px){
  .action-toolbar__surface{
    grid-template-columns:1fr;
    align-items:stretch;
  }

  .action-toolbar__header{
    grid-column:1;
  }

  .action-toolbar__filters{
    min-width:0;
    flex-wrap:nowrap;
    align-items:end;
    justify-content:center;
    max-width:1180px;
    margin-inline:auto;
  }

  .action-toolbar__actions{
    flex-wrap:nowrap;
    justify-content:center;
    align-items:end;
    max-width:1180px;
    margin-inline:auto;
  }
}

@media (max-width: 720px){
  .action-toolbar__header{
    flex-direction:column;
  }
}
</style>
