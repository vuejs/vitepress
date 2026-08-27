<template>
  <div class="VPTeamPageTitle">
    <h1 v-if="$slots.title" class="title">
      <slot name="title" />
    </h1>
    <p v-if="$slots.lead" class="lead">
      <slot name="lead" />
    </p>
  </div>
</template>

<style scoped>
.VPTeamPageTitle {
  padding: 3rem 2rem;
  text-align: center;
}

@media (min-width: 48rem) {
  .VPTeamPageTitle {
    padding: 4rem 3rem 3rem;
  }
}

@media (min-width: 60rem) {
  .VPTeamPageTitle {
    padding: 5rem 4rem 3rem;
  }
}

.title {
  letter-spacing: 0;
  line-height: 1.2222222;
  font-size: 2.25rem;
  font-weight: 500;
}

@media (min-width: 48rem) {
  .title {
    letter-spacing: -0.0104167em;
    line-height: 1.1666667;
    font-size: 3rem;
  }
}

.lead {
  margin: 0 auto;
  max-width: 32rem;
  padding-top: 0.75rem;
  line-height: 1.5;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

@media (min-width: 48rem) {
  .lead {
    max-width: 37rem;
    letter-spacing: 0.0075em;
    line-height: 1.4;
    font-size: 1.25rem;
  }
}
</style>
