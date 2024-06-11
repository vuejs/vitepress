<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/yyx990803.png',
    name: 'Evan You',
    title: 'Criador',
    links: [
      { icon: 'github', link: 'https://github.com/yyx990803' },
      { icon: 'twitter', link: 'https://twitter.com/youyuxi' }
    ]
  },
  {
    avatar: 'https://github.com/kiaking.png',
    name: 'Kia King Ishii',
    title: 'Desenvolvedor',
    links: [
      { icon: 'github', link: 'https://github.com/kiaking' },
      { icon: 'twitter', link: 'https://twitter.com/KiaKing85' }
    ]
  }
]
</script>

# Página de Equipo {#team-page}

Si deseas presentar a tu equipo, puedes utilizar componentes del equipo para crear la página del equipo. Hay dos formas de utilizar estos componentes. Una es incrustarlo en la página del documento y otra es crear una página de equipo completa.

## Mostrar miembros del equipo en una página {#show-team-members-in-a-page}

Puedes usar el componente `<VPTeamMembers>` expuesto en `vitepress/theme` para mostrar una lista de los miembros del equipo en cualquier página.

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

Saluda a nuestro increible equipo.

<VPTeamMembers size="small" :members="members" />
```

El código anterior mostrará a un miembro del equipo en un elemento similar a una tarjeta. Debería mostrar algo similar a lo siguiente.

<VPTeamMembers size="small" :members="members" />

El componente `<VPTeamMembers>` viene en dos tamaños diferentes, pequeño `small` y médio `medium`. Si bien es una cuestión de preferencia, generalmente el tamaño `small` debería encajar mejor cuando se use en la página del documento. Además, puede agregar más propiedades a cada miembro, como agregar el botón "descripción" o "patrocinador". Obtenga más información sobre en [`<VPTeamMembers>`](#vpteammembers).

Incrustar miembros del equipo en la página del documento es bueno para equipos pequeños donde tener una página de equipo dedicada completa puede ser demasiado, o introducir miembros parciales como referencia al contexto de la documentación.

Si tienes una gran cantidad de miembros o simplemente deseas más espacio para exhibir a los miembros del equipo, considere [crear una página de equipo completa.](#create-a-full-team-page)

## Creando una página de equipo completa {#create-a-full-team-page}

En lugar de agregar miembros del equipo a la página del documento, también puede crear una página de equipo completa, del mismo modo que puede crear una [Página Inicial](./default-theme-home-page) personalizada.

Para crear una página de equipo, primero cree un nuevo md. El nombre del archivo no importa, pero aquí lo llamaremos `team.md`. En este archivo, configure la opción `layout: page` desde frontmatter,  y luego puedes componer la estructura de tu página usando componentes `TeamPage`.

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
      Algunos de los miembros han elegido aparecer a continuación.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>
```

Al crear una página de equipo completa, recuerde agrupar todos los componentes con el componente `<VPTeamPage>`. Este componente garantizará que todos los componentes anidados relacionados con el equipo obtengan la estructura de diseño adecuada, como los espacios.

El componente `<VPPageTitle>` adiciona la sección de título de la página. El título es `<h1>`. Use los _slots_ `#title` y `#lead` para poder documentar sobre su equipo.

`<VPMembers>` funciona igual que cuando se usa en una página de documento. Mostrará la lista de miembros.

### Agregar secciones para dividir a los miembros del equipo {#add-sections-to-divide-team-members}

Puede agregar "secciones" a la página de su equipo. Por ejemplo, puede tener diferentes tipos de miembros del equipo, como miembros del equipo central y socios de la comunidad. Puede dividir a estos miembros en secciones para explicar mejor las funciones de cada grupo.

Para poder hacerlo, agregue al componente `<VPTeamPageSection>` al archivo `team.md` que creamos anteriormente.

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
    <template #title>Amigos</template>
    <template #lead>...</template>
    <template #members>
      <VPTeamMembers size="small" :members="partners" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```

El componente `<VPTeamPageSection>` Puede tener los _slots_ `#title` y `#lead` similares al componente `VPTeamPageTitle`, y también al _slot_ `#members` para mostrar a los miembros del equipo.

Recuerde colocar el componente `<VPTeamMembers>` dentro del _slot_ `#members`.

## `<VPTeamMembers>`

El componente `<VPTeamMembers>` muestra una determinada lista de miembros.

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

  //  Lista de miembros que se mostrará.
  members: TeamMember[]
}

interface TeamMember {
  // Imagen de avatar de miembro.
  avatar: string

  // Nombre del miembro.
  name: string

  // Título a ser mostrado a bajo del nombre del miembro.
  // Ej.: Desarrollador, Ingeniero de Software, etc.
  title?: string

  // Organización a la que pertenece al miembro.
  org?: string

  // URL de la organización.
  orgLink?: string

  // Descripción del miembro.
  desc?: string

  // Links sociales, por ejemplo, GitHub, Twitter, etc.
  // Puedes pasar un objeto de Links Sociales aquí.
  // Vea: https://vitepress.dev/reference/default-theme-config.html#sociallinks
  links?: SocialLink[]

  // URL de la página del patrocinador del miembro.
  sponsor?: string

  // Texto para enlace del patrocinador. El valor predeterminado es 'Sponsor'.
  actionText?: string
}
```

## `<VPTeamPage>`

El componente raíz al crear una página de equipo completa. Sólo acepta una _slot_. Aplicará estilo a todos los componentes anteriores relacionados con el equipo.

## `<VPTeamPageTitle>`

Agrega la sección "título" a la página. Es mejor usarlo desde el principio debajo `<VPTeamPage>`. Acepta los _slots_ `#title` y `#lead`.

```html
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Nuestro equipo
    </template>
    <template #lead>
      El desarrollo de VitePress está guiado por un equipo internacional,
      Algunos de los miembros han elegido aparecer a continuación.
    </template>
  </VPTeamPageTitle>
</VPTeamPage>
```

## `<VPTeamPageSection>`

Crea una 'sección' en la página del equipo. Aceptar los _slots_ `#title`, `#lead` y `#members`. Puedes agregar tantas secciones como quieras dentro `<VPTeamPage>`.

```html
<VPTeamPage>
  ...
  <VPTeamPageSection>
    <template #title>Amigos</template>
    <template #lead>Lorem ipsum...</template>
    <template #members>
      <VPTeamMembers :members="data" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
```
