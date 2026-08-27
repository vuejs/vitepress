import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/**/*.md', { render: true })
