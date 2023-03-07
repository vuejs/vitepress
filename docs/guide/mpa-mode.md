# MPA Mode <Badge type="warning" text="experimental" />

MPA (Multi-Page Application) mode can be enabled via the command line via `vitepress build --mpa`, or via config through the `mpa: true` option.

In MPA mode, all pages are rendered without any JavaScript included by default. As a result, the production site will likely have a better initial visit performance score from audit tools.

However, due to the absence of SPA navigation, cross-page links will lead to full page reloads. Post-load navigations in MPA mode will not feel as instant as in SPA mode.

Also note that no-JS-by-default also means you are essentially using Vue purely as a server-side templating language - no event handlers will be attached in the browser, so there will be no interactivity. To load client-side JavaScript, you can do so by using the special `<script client>` tag (works in both `.md` and `.vue` files, but only in MPA mode):

```html
<script client>
document.querySelector('h1').addEventListener('click', () => {
  console.log('client side JavaScript!')
})
</script>

# Hello
```

Client scripts in all theme components will be bundled together, while client script for a specific page will be split for that page only.

Notice that `<script client>` is **not evaluated as Vue component code**: it's processed as a plain JavaScript module. For this reason, MPA mode should only be used if your site requires absolutely minimal client-side interactivity.
