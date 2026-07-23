<template>
  <section class="VPTeamPageSection">
    <div class="title">
      <div class="title-line" />
      <h2 v-if="$slots.title" class="title-text">
        <slot name="title" />
      </h2>
    </div>
    <p v-if="$slots.lead" class="lead">
      <slot name="lead" />
    </p>
    <div v-if="$slots.members" class="members">
      <slot name="members" />
    </div>
  </section>
</template>

<style scoped>
.VPTeamPageSection {
  padding: 0 2rem;
}

@media (min-width: 48rem) {
  .VPTeamPageSection {
    padding: 0 3rem;
  }
}

@media (min-width: 60rem) {
  .VPTeamPageSection {
    padding: 0 4rem;
  }
}

.title {
  position: relative;
  margin: 0 auto;
  max-width: 72rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.title-line {
  position: absolute;
  top: 1rem;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.title-text {
  position: relative;
  display: inline-block;
  padding: 0 1.5rem;
  letter-spacing: 0;
  line-height: 2rem;
  font-size: 1.25rem;
  font-weight: 500;
  background-color: var(--vp-c-bg);
}

.lead {
  margin: 0 auto;
  max-width: 30rem;
  padding-top: 0.75rem;
  text-align: center;
  line-height: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.members {
  padding-top: 2.5rem;
}
</style>
