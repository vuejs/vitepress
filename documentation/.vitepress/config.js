module.exports = {
  // base: string
  title: /** String */ 'vitepress title',
  description: /** String */ 'vitepress documentation',
  head: /** HeadConfig[] */ [
    [
      'link',
      {
        href:
          'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
        rel: 'stylesheet'
      }
    ],
    // [
    //     'style',
    //     {},
    //     "* { font-family: 'Poppins', sans-serif; }"
    // ],
    ['script', {}, "console.log('welcome to vitepress')"]
  ],
  themeConfig: /** ThemeConfig = any */ {}
}
