<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: '창작자',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: '개발자',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# 팀 페이지 {#team-page}

팀을 소개하고 싶다면, 팀 페이지를 구성하기 위해 Team 컴포넌트를 사용할 수 있습니다. 이러한 컴포넌트를 사용하는 방법에는 두 가지가 있습니다. 하나는 문서 페이지에 포함시키는 것이고, 다른 하나는 전체 팀 페이지를 만드는 것입니다.

## 페이지에서 팀 멤버 보여주기 {#show-team-members-in-a-page}

`vitepress/theme`에서 제공되는 `<VPTeamMembers>` 컴포넌트를 사용하여 어떤 페이지에서든 팀 멤버 목록을 표시할 수 있습니다.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: '창작자',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# 우리 팀

우리 훌륭한 팀을 만나보세요.

<VPTeamMembers size="small" :members="members" />
```

위 코드는 카드 형태의 요소로 팀 멤버를 표시합니다. 아래와 비슷하게 표시될 것입니다.

<VPTeamMembers size="small" :members="members" />

`<VPTeamMembers>` 컴포넌트는 `small` 및 `medium`의 두 가지 다른 크기로 제공됩니다. 선호도에 달렸지만, 보통 문서 페이지에서 사용할 때는 `small` 크기가 더 잘 맞을 것입니다. 또한 "description"이나 "sponsor" 버튼을 추가하는 등 각 멤버에 대해 더 많은 속성을 추가할 수 있습니다. [`<VPTeamMembers>`](#vpteammembers)에서 더 자세히 알아보세요.

문서 페이지에 팀 멤버를 포함시키는 것은 전용 전체 팀 페이지를 만드는 것이 너무 과한 경우나, 문서 맥락을 참조로 일부 멤버를 소개할 때 좋습니다.

멤버 수가 많거나, 멤버를 보여주기 위해 더 많은 공간을 원한다면 [전체 팀 페이지 만들기](#create-a-full-team-page)를 고려해보세요.

## 전체 팀 페이지 만들기 {#create-a-full-team-page}

문서 페이지에 팀 멤버를 추가하는 대신, 전체 팀 페이지를 만들 수도 있습니다. 사용자 지정 [홈 페이지](./default-theme-home-page)를 생성하는 방법과 유사합니다.

팀 페이지를 생성하려면 먼저, 새 md 파일을 만듭니다. 파일 이름은 중요하지 않지만, 여기서는 `team.md`라고 하겠습니다. 이 파일에서 frontmatter 옵션 `layout: page`를 설정한 다음, `TeamPage` 컴포넌트를 사용하여 페이지 구조를 구성합니다.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: '창작자',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      우리 팀
    </template>
    <template #lead>
      VitePress의 개발은 국제적인
      팀에 의해 지도되며, 그 중 일부는 아래에 소개되어 있습니다.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

전체 팀 페이지를 생성할 때는 모든 컴포넌트를 `<VPTeamPage>` 컴포넌트로 감싸야 합니다. 이 컴포넌트는 공간 구조와 같은 적절한 레이아웃 구조를 팀 관련 컴포넌트에 적용할 것입니다.

`<VPPageTitle>` 컴포넌트는 페이지 제목 섹션을 추가합니다. 제목은 `<h1>` 헤딩입니다. 팀에 대해 문서화하려면 `#title`과 `#lead` 슬롯을 사용하십시오.

`<VPMembers>`는 문서 페이지에서 사용할 때와 동일하게 작동합니다. 회원 목록을 표시합니다.

### 팀 멤버를 구분하기 위한 섹션 추가 {#add-sections-to-divide-team-members}

팀 페이지에 "섹션"을 추가할 수 있습니다. 예를 들어, 코어 팀 멤버와 커뮤니티 파트너와 같은 다양한 유형의 팀 멤버가 있을 수 있습니다. 이러한 멤버를 섹션으로 나누어 각 그룹의 역할을 더 잘 설명할 수 있습니다.

이를 위해 이전에 만든 `team.md` 파일에 `<VPTeamPageSection>` 컴포넌트를 추가하십시오.

```html
---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

const coreMembers = [...]
const partners = [...]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>우리 팀</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>파트너</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

`<VPTeamPageSection>` 컴포넌트는 `VPTeamPageTitle` 컴포넌트와 유사하게 `#title`과 `#lead` 슬롯을 가질 수 있으며, 팀 멤버를 표시하기 위한 `#members` 슬롯도 가질 수 있습니다.

`#members` 슬롯 안에 `<VPTeamMembers>` 컴포넌트를 넣는 것을 잊지 마십시오.

## `<VPTeamMembers>`

`<VPTeamMembers>` 컴포넌트는 주어진 멤버 목록을 표시합니다.

```html
<VPTeamMembers
  size="medium"
  :members="[
    { avatar: '...', name: '...' },
    { avatar: '...', name: '...' },
    ...
  ]"
/>
```

```ts
interface Props {
  // 각 회원의 크기입니다. 기본값은 `medium`입니다.
  size?: 'small' | 'medium'

  // 표시할 회원 목록입니다.
  members: TeamMember[]
}

interface TeamMember {
  // 회원의 아바타 이미지입니다.
  avatar: string

  // 회원의 이름입니다.
  name: string

  // 회원 이름 아래에 표시될 직함입니다.
  // 예: 개발자, 소프트웨어 엔지니어 등
  title?: string

  // 회원이 속한 조직입니다.
  org?: string

  // 조직의 URL입니다.
  orgLink?: string

  // 회원에 대한 설명입니다.
  desc?: string

  // 소셜 링크입니다. 예: GitHub, Twitter 등.
  // 여기에 소셜 링크 객체를 전달할 수 있습니다.
  // 참조: https://vitepress.dev/ko/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // 회원의 후원 페이지 URL입니다.
  sponsor?: string

  // 후원 링크의 텍스트입니다. 기본값은 'Sponsor'입니다.
  actionText?: string
}
```

## `<VPTeamPage>`

전체 팀 페이지를 생성할 때 기본 컴포넌트입니다. 단일 슬롯만 허용합니다. 전달된 모든 팀 관련 컴포넌트에 적절한 스타일을 적용합니다.

## `<VPTeamPageTitle>`

페이지의 "제목" 섹션을 추가합니다. `<VPTeamPage>` 아래에서 맨 처음 사용하는 것이 가장 좋습니다. `#title`과 `#lead` 슬롯을 받습니다.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      우리 팀
    </template>
    <template #lead>
      VitePress의 개발은 국제적인
      팀에 의해 지도되며, 그 중 일부는 아래에 소개되어 있습니다.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

팀 페이지 내에 "섹션"을 생성합니다. `#title`, `#lead`, 그리고 `#members` 슬롯을 받습니다. `<VPTeamPage>` 안에 원하는 만큼 많은 섹션을 추가할 수 있습니다.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>파트너</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
