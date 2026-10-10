---
description: Erstelle Teamseiten mit Mitgliederprofilen mithilfe der integrierten Team-Komponenten von VitePress.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Teamseite

Wenn du dein Team vorstellen möchtest, kannst du Team-Komponenten verwenden, um eine Teamseite zu erstellen. Es gibt zwei Möglichkeiten: Du kannst sie in eine Dokumentationsseite einbetten oder eine vollständige Teamseite erstellen.

## Teammitglieder auf einer Seite anzeigen

Du kannst die von `vitepress/theme` bereitgestellte Komponente `<VPTeamMembers>` verwenden, um auf jeder Seite eine Liste von Teammitgliedern anzuzeigen.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# Our Team

Lerne unser großartiges Team kennen.

<VPTeamMembers size="small" :members />
```

Der obige Code zeigt ein Teammitglied in einem kartenähnlichen Element an. Das Ergebnis sollte ungefähr wie folgt aussehen.

<VPTeamMembers size="small" :members />

Die Komponente `<VPTeamMembers>` gibt es in zwei Größen: `small` und `medium`. Welche du verwendest, hängt von deinen Anforderungen ab; auf Dokumentationsseiten passt `small` normalerweise besser. Du kannst jedem Mitglied außerdem weitere Eigenschaften wie eine `description` oder eine `sponsor`-Schaltfläche hinzufügen. Weitere Informationen findest du unter [`<VPTeamMembers>`](#vpteammembers).

Das Einbetten von Teammitgliedern in eine Dokumentationsseite eignet sich für kleine Teams oder wenn nur einzelne Mitglieder im Zusammenhang mit der Dokumentation vorgestellt werden sollen.

Wenn du viele Mitglieder hast oder einfach mehr Platz für ihre Darstellung benötigst, kannst du [eine vollständige Teamseite erstellen](#create-a-full-team-page).

## Create a full Teamseite

Statt Teammitglieder in eine Dokumentationsseite einzubetten, kannst du auch eine vollständige Teamseite erstellen, ähnlich wie bei einer eigenen [Startseite](./default-theme-home-page).

Erstelle zunächst eine neue Markdown-Datei. Der Dateiname spielt keine Rolle; hier nennen wir sie `team.md`. Setze darin die Frontmatter-Option `layout: page` und baue anschließend die Seitenstruktur mit `TeamPage`-Komponenten auf.

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
    title: 'Creator',
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
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
```

Bei einer vollständigen Teamseite musst du alle Komponenten mit der Komponente `<VPTeamPage>` umschließen. Sie sorgt dafür, dass alle verschachtelten Team-Komponenten die passende Layout-Struktur und Abstände erhalten.

Die Komponente `<VPPageTitle>` fügt den Seitentitelbereich hinzu. Der Titel ist eine `<h1>`-Überschrift. Verwende die Slots `#title` und `#lead`, um dein Team vorzustellen.

`<VPMembers>` funktioniert genauso wie auf einer Dokumentationsseite und zeigt eine Liste von Mitgliedern an.

### Abschnitte zur Aufteilung der Teammitglieder hinzufügen

Du kannst der Teamseite „Abschnitte“ hinzufügen. Zum Beispiel kannst du verschiedene Arten von Teammitgliedern wie Kernteammitglieder und Community-Partner haben. Mit Abschnitten kannst du die Rollen der einzelnen Gruppen besser erläutern.

Füge dazu die Komponente `<VPTeamPageSection>` in die zuvor erstellte Datei `team.md` ein.

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
    <template #title>Our Team</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

Die Komponente `<VPTeamPageSection>` kann wie `VPTeamPageTitle` die Slots `#title` und `#lead` sowie zusätzlich den Slot `#members` zur Anzeige von Teammitgliedern enthalten.

Denke daran, die Komponente `<VPTeamMembers>` innerhalb des Slots `#members` einzufügen.

## `<VPTeamMembers>`

Die Komponente `<VPTeamMembers>` zeigt eine übergebene Liste von Mitgliedern an.

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
  // Size of each members. Defaults to `medium`.
  size?: 'small' | 'medium'

  // List of members to display.
  members: TeamMember[]
}

interface TeamMember {
  // Avatar image for the member.
  avatar: string

  // Name of the member.
  name: string

  // Title to be shown below member's name.
  // e.g. Developer, Software Engineer, etc.
  title?: string

  // Organization that the member belongs.
  org?: string

  // URL for the organization.
  orgLink?: string

  // Description for the member.
  desc?: string

  // Social links. e.g. GitHub, Twitter, etc. You may pass in
  // the Social Links object here.
  // See: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL for the sponsor page for the member.
  sponsor?: string

  // Text for the sponsor link. Defaults to 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

The root component when creating a full team page. It only accepts a single slot. It will style all passed in team related components.

## `<VPTeamPageTitle>`

Adds "title" section of the page. Best use at the very beginning under `<VPTeamPage>`. It accepts `#title` and `#lead` slot.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Our Team
    </template>
    <template #lead>
      The development of VitePress is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Creates a "section" with in team page. It accepts `#title`, `#lead`, and `#members` slot. Du kannst add as many sections as you like inside `<VPTeamPage>`.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Partners</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
