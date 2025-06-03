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
.title {
  position: relative;
  margin: 0 auto;
  max-width: 1152px;
  text-align: center;
  color: var(--vp-c-text-2);
}

.title-line {
  position: absolute;
  top: 16px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.title-text {
  position: relative;
  display: inline-block;
  padding: 0 24px;
  letter-spacing: 0;
  line-height: 32px;
  font-size: 20px;
  font-weight: 500;
  background-color: var(--vp-c-bg);
}

.lead {
  margin: 0 auto;
  max-width: 480px;
  padding-top: 12px;
  text-align: center;
  line-height: 24px;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.members {
  padding-top: 24px;
}
</style>
