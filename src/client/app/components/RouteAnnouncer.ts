import { defineComponent, h, watchPostEffect, shallowRef } from 'vue'
import { useRoute } from '../router.js'

export const RouteAnnouncer = defineComponent({
    name: 'VitePressRouteAnnouncer',
    setup() {
        const vitePressRoute = useRoute()
        const previouslyLoadedPath = shallowRef(vitePressRoute.path)
        const routeAnnouncement = shallowRef('')
        watchPostEffect(() => {
            if (previouslyLoadedPath.value === vitePressRoute.path) return
            previouslyLoadedPath.value === vitePressRoute.path
            if (document?.title) {
                routeAnnouncement.value = document?.title
            } else {
                const vitepressPageHeader = document?.querySelector?.('h1')
                const vitepressContent =
                    vitepressPageHeader?.innerText ?? vitepressPageHeader?.textContent
                routeAnnouncement.value = vitepressContent || vitePressRoute?.path
            }
        })
        return () => h('p', {
            style: {
                border: 0,
                clip: 'rect(0 0 0 0)',
                height: '1px',
                margin: '-1px',
                overflow: 'hidden',
                padding: 0,
                position: 'absolute',
                width: '1px',
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
            },
            id: '__vitepress-route-announcer__',
            role: "alert",
            'aria-live': "assertive"
        }, [
            routeAnnouncement?.value
        ])
    },
})
