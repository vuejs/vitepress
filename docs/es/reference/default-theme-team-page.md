---
description: Crea páginas de equipo con perfiles de miembros usando los componentes de equipo integrados de VitePress.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creador',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Desarrollador',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Página de Equipo {#team-page}

Si desea presentar a su equipo, puede utilizar los componentes de equipo para crear la página de equipo. Hay dos formas de utilizar estos componentes. Una es incrustarlo en una página de documento, y otra es crear una página de equipo completa.

## Mostrar miembros del equipo en una página {#show-team-members-in-a-page}

Puede usar el componente `<VPTeamMembers>` expuesto desde `vitepress/theme` para mostrar una lista de los miembros del equipo en cualquier página.

```html
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Creador',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  ...
]
</script>

# Nuestro equipo

Salude a nuestro increíble equipo.

<VPTeamMembers size="small" :members />
```

El código anterior mostrará a un miembro del equipo en un elemento con apariencia de tarjeta. Debería mostrar algo similar a lo siguiente.

<VPTeamMembers size="small" :members />

El componente `<VPTeamMembers>` viene en dos tamaños diferentes, `small` y `medium`. Si bien depende de su preferencia, generalmente el tamaño `small` debería encajar mejor cuando se usa en una página de documento. Además, puede agregar más propiedades a cada miembro, como agregar un botón de "descripción" o "patrocinador". Obtenga más información al respecto en [`<VPTeamMembers>`](#vpteammembers).

Incrustar miembros del equipo en la página de documento es bueno para equipos pequeños donde tener una página de equipo dedicada completa puede ser demasiado, o para presentar miembros parciales como referencia al contexto de la documentación.

Si tiene una gran cantidad de miembros, o simplemente desea tener más espacio para mostrar a los miembros del equipo, considere [crear una página de equipo completa](#create-a-full-team-page).

## Crear una página de equipo completa {#create-a-full-team-page}

En lugar de agregar miembros del equipo a la página de documento, también puede crear una página de equipo completa, de manera similar a cómo puede crear una [Página de Inicio](./default-theme-home-page) personalizada.

Para crear una página de equipo, primero, cree un nuevo archivo md. El nombre del archivo no importa, pero aquí lo llamaremos `team.md`. En este archivo, configure la opción del `frontmatter` `layout: page`, y luego podrá componer la estructura de su página usando los componentes `TeamPage`.

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
    title: 'Creador',
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
      Nuestro equipo
    </template>
    <template #lead>
      El desarrollo de VitePress está guiado por un equipo internacional,
      algunos de los cuales han elegido aparecer a continuación.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
```

Al crear una página de equipo completa, recuerde agrupar todos los componentes con el componente `<VPTeamPage>`. Este componente garantizará que todos los componentes anidados relacionados con el equipo obtengan la estructura de `layout` adecuada, como los espaciados.

El componente `<VPPageTitle>` agrega la sección del título de la página. El título es un encabezado `<h1>`. Use los `slots` `#title` y `#lead` para documentar sobre su equipo.

`<VPMembers>` funciona igual que cuando se usa en una página de documento. Mostrará una lista de miembros.

### Agregar secciones para dividir a los miembros del equipo {#add-sections-to-divide-team-members}

Puede agregar "secciones" a la página de equipo. Por ejemplo, puede tener diferentes tipos de miembros en el equipo, como miembros del equipo central y socios de la comunidad. Puede dividir a estos miembros en secciones para explicar mejor los roles de cada grupo.

Para hacerlo, agregue el componente `<VPTeamPageSection>` al archivo `team.md` que creamos anteriormente.

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
    <template #title>Nuestro equipo</template>
    <template #lead>...</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Socios</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

El componente `<VPTeamPageSection>` puede tener los `slots` `#title` y `#lead` similares al componente `VPTeamPageTitle`, y también un `slot` `#members` para mostrar a los miembros del equipo.

Recuerde colocar el componente `<VPTeamMembers>` dentro del `slot` `#members`.

## `<VPTeamMembers>`

El componente `<VPTeamMembers>` muestra una lista determinada de miembros.

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
  // Tamaño de cada miembro. El valor predeterminado es `medium`.
  size?: 'small' | 'medium'

  // Lista de miembros a mostrar.
  members: TeamMember[]
}

interface TeamMember {
  // Imagen de avatar del miembro.
  avatar: string

  // Nombre del miembro.
  name: string

  // Título a mostrar debajo del nombre del miembro.
  // Ej. Desarrollador, Ingeniero de Software, etc.
  title?: string

  // Organización a la que pertenece el miembro.
  org?: string

  // URL de la organización.
  orgLink?: string

  // Descripción del miembro.
  desc?: string

  // Enlaces sociales. Ej. GitHub, Twitter, etc. Puede pasar
  // el objeto de Enlaces Sociales (Social Links) aquí.
  // Vea: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL de la página de patrocinador del miembro.
  sponsor?: string

  // Texto para el enlace del patrocinador. El valor predeterminado es 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

El componente raíz al crear una página de equipo completa. Solo acepta un único _slot_. Aplicará estilo a todos los componentes relacionados con el equipo que se le pasen.

## `<VPTeamPageTitle>`

Agrega la sección del "título" de la página. Es mejor usarlo al principio debajo de `<VPTeamPage>`. Acepta los `slots` `#title` y `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Nuestro equipo
    </template>
    <template #lead>
      El desarrollo de VitePress está guiado por un equipo internacional,
      algunos de los cuales han elegido aparecer a continuación.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Crea una "sección" dentro de la página de equipo. Acepta los `slots` `#title`, `#lead` y `#members`. Puede agregar tantas secciones como desee dentro de `<VPTeamPage>`.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Socios</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```