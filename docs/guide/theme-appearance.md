# Dark Mode

By default, VitePress will add a dark-mode toggle to the navigation bar. To remove it, set `false` to the [`config.appearance`](../config/app-configs.html#appearance) option. If you would like to customize the style in dark mode only, prepend `:root.dark ` to the CSS selectors:

```css
.dark .BannerPicture {
  filter: grayscale(1) invert(1);
}
```
