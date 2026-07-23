<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import VPLink from './VPLink.vue'
import VPSocialLinks from './VPSocialLinks.vue'

interface Props {
  size?: 'small' | 'medium'
  member: DefaultTheme.TeamMember
}

withDefaults(defineProps<Props>(), {
  size: 'medium'
})
</script>

<template>
  <article class="VPTeamMembersItem" :class="[size]">
    <div class="profile">
      <figure class="avatar">
        <img class="avatar-img" :src="member.avatar" :alt="member.name" />
      </figure>
      <div class="data">
        <h1 class="name">
          {{ member.name }}
        </h1>
        <p v-if="member.title || member.org" class="affiliation">
          <span v-if="member.title" class="title">
            {{ member.title }}
          </span>
          <span v-if="member.title && member.org" class="at"> @ </span>
          <VPLink
            v-if="member.org"
            class="org"
            :class="{ link: member.orgLink }"
            :href="member.orgLink"
            no-icon
          >
            {{ member.org }}
          </VPLink>
        </p>
        <p v-if="member.desc" class="desc" v-html="member.desc" />
        <div v-if="member.links" class="links">
          <VPSocialLinks :links="member.links" :me="false" />
        </div>
      </div>
    </div>
    <div v-if="member.sponsor" class="sp">
      <VPLink class="sp-link" :href="member.sponsor" no-icon>
        <span class="vpi-heart sp-icon" /> {{ member.actionText || 'Sponsor' }}
      </VPLink>
    </div>
  </article>
</template>

<style scoped>
.VPTeamMembersItem {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  border-radius: 0.75rem;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.VPTeamMembersItem.small .profile {
  padding: 2rem;
}

.VPTeamMembersItem.small .data {
  padding-top: 1.25rem;
}

.VPTeamMembersItem.small .avatar {
  width: 4rem;
  height: 4rem;
}

.VPTeamMembersItem.small .name {
  line-height: 1.5rem;
  font-size: 1rem;
}

.VPTeamMembersItem.small .affiliation {
  padding-top: 0.25rem;
  line-height: 1.25rem;
  font-size: 0.875rem;
}

.VPTeamMembersItem.small .desc {
  padding-top: 0.75rem;
  line-height: 1.25rem;
  font-size: 0.875rem;
}

.VPTeamMembersItem.small .links {
  margin: 0 -1rem -1.25rem;
  padding: 0.625rem 0 0;
}

.VPTeamMembersItem.medium .profile {
  padding: 3rem 2rem;
}

.VPTeamMembersItem.medium .data {
  padding-top: 1.5rem;
  text-align: center;
}

.VPTeamMembersItem.medium .avatar {
  width: 6rem;
  height: 6rem;
}

.VPTeamMembersItem.medium .name {
  letter-spacing: 0.0094rem;
  line-height: 1.75rem;
  font-size: 1.25rem;
}

.VPTeamMembersItem.medium .affiliation {
  padding-top: 0.25rem;
  font-size: 1rem;
}

.VPTeamMembersItem.medium .desc {
  padding-top: 1rem;
  max-width: 18rem;
  font-size: 1rem;
}

.VPTeamMembersItem.medium .links {
  margin: 0 -1rem -0.75rem;
  padding: 1rem 0.75rem 0;
}

.profile {
  flex-grow: 1;
  background-color: var(--vp-c-bg-soft);
}

.data {
  text-align: center;
}

.avatar {
  position: relative;
  flex-shrink: 0;
  margin: 0 auto;
  border-radius: 50%;
  box-shadow: var(--vp-shadow-3);
}

.avatar-img {
  position: absolute;
  inset: 0;
  margin: 0;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  margin: 0;
  font-weight: 600;
}

.affiliation {
  margin: 0;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.org.link {
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.org.link:hover {
  color: var(--vp-c-brand-1);
}

.desc {
  margin: 0 auto;
}

.desc :deep(a) {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration-style: dotted;
  transition: color 0.25s;
}

.links {
  display: flex;
  justify-content: center;
  height: 3.5rem;
}

.sp-link {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-sponsor);
  background-color: var(--vp-c-bg-soft);
  transition: color 0.25s, background-color 0.25s;
}

.sp .sp-link.link:hover,
.sp .sp-link.link:focus {
  outline: none;
  color: var(--vp-c-white);
  background-color: var(--vp-c-sponsor);
}

.sp-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
}
</style>
