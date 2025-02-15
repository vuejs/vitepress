# تبلیغات Carbon {#carbon-ads}

ویت‌پرس پشتیبانی داخلی برای [Carbon Ads](https://www.carbonads.net/) را دارد. با تعریف مشخصات تبلیغات Carbon در تنظیمات، ویت‌پرس تبلیغات را در صفحه نمایش می‌دهد.

```js
export default {
  themeConfig: {
    carbonAds: {
      code: 'your-carbon-code',
      placement: 'your-carbon-placement'
    }
  }
}
```

این مقادیر برای فراخوانی اسکریپت CDN Carbon به شکل زیر استفاده می‌شوند.

```js
`//cdn.carbonads.com/carbon.js?serve=${code}&placement=${placement}`
```

برای یادگیری بیشتر درباره پیکربندی تبلیغات Carbon، لطفاً به [وب‌سایت Carbon Ads](https://www.carbonads.net/) مراجعه کنید.
