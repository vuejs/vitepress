# Modo MPA <Badge type="warning" text="experimental" /> {#mpa-mode}

El modo MPA (Aplicación de multiples páginas) puede ser habilitado por la linea de comandos con `vitepress build --mpa`, o a través de la configuración por la opción `mpa: true`.

En el modo MPA, todas las páginas son presentadas por defecto sin JavaScript incluído. Como resultado, el sitio en producción probablemente tendrá una marca de desempeño de visita inicial superior con herramientas de auditoría.

Sin embargo, debido a la ausencia de navegación SPA, los links entre páginas resultan en recargas de página completos. Navegaciones después de la carga en el modo MPA no parecerán tan instantáneos en comparación con el modo SPA.

También note que no tener JavaScript por defecto significa que está esencialmente utilizando Vue como modelo de lenguaje en el lado del servidor. Nungun manipulador de eventos será embutido en el navegador, entonces no habrá interactividad. Para cargar JavaScript en el lado del cliente, necesitará usar el tag especial `<script client>`:

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
