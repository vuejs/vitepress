---
description: Habilita el modo MPA (Aplicación de Múltiples Páginas) en VitePress para páginas sin JavaScript con mejor rendimiento inicial.
---

# Modo MPA <Badge type="warning" text="experimental" /> {#mpa-mode}

El modo MPA (Aplicación de multiples páginas) puede ser habilitado por la línea de comandos con `vitepress build --mpa`, o a través de la configuración por la opción `mpa: true`.

En el modo MPA, todas las páginas son presentadas por defecto sin JavaScript incluido. Como resultado, el sitio en producción probablemente tendrá una marca de desempeño de visita inicial superior con herramientas de auditoría.

Sin embargo, debido a la ausencia de navegación SPA, los enlaces entre páginas resultan en recargas completas de la página. La navegación posterior a la carga en modo MPA no será tan instantánea como en modo SPA.

También note que `no-JS-by-default` significa que, esencialmente, está utilizando Vue únicamente como un lenguaje de plantillas del lado del servidor. No se adjuntarán controladores de eventos en el navegador, por lo que no habrá interactividad. Para cargar JavaScript del lado del cliente, deberá utilizar la etiqueta especial `<script client>`:

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('JavaScript en el lado del cliente!')
})
</script>

# Hola
```

`<script client>` es una funcionalidad exclusiva VitePress, no una funcionalidad Vue. Funciona tanto en archivos `.md` como en archivos `.vue`, pero solo en el modo MPA. Scripts de cliente en todos los componentes del tema serán empaquetados juntos, mientras el script del cliente para una página específica será dividido solo para esa página.

Note que `<script client>` **no es calificado como código de componente Vue**: es procesado como un simple módulo JavaScript. Por esta razón, el modo MPA debe ser usado apenas si su sitio exige el mínimo absoluto de interactividad del lado del cliente.
