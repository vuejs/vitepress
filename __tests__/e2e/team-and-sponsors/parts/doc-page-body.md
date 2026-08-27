<script setup>
import { VPTeamMembers, VPSponsors } from 'vitepress/theme'
import { members, friends, sponsors } from './data'
</script>

Regular paragraph with a [link](https://example.com) and `inline code`.

## Small, One Member

<VPTeamMembers size="small" :members="members.slice(0, 1)" />

## Small, Two Members

<VPTeamMembers size="small" :members="members.slice(0, 2)" />

## Small, Three Members

<VPTeamMembers size="small" :members />

## Medium, One Member

<VPTeamMembers size="medium" :members="members.slice(0, 1)" />

## Medium, Two Members

<VPTeamMembers size="medium" :members="members.slice(0, 2)" />

## Medium, Three Members

<VPTeamMembers size="medium" :members />

## Sponsors, Tiered

<VPSponsors :data="sponsors" />

## Sponsors, Single Tier

<VPSponsors tier="Friends" size="mini" :data="friends" />

## After Components

Trailing markdown content after the components.
