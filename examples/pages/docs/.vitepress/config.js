module.exports = {
    lang: 'en-US',
    title: 'VitePresser',
    description: 'Vite & Vue powered static site generator.',

    themeConfig: {
        repo: 'vuejs/vitepress',
        docsDir: 'docs',

        editLinks: true,
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',


        nav: [
            { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
            {
                text: 'Config Reference',
                link: '/config/basics',
                activeMatch: '^/config/'
            }
        ],

    }
}
