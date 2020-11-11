// @ts-nocheck
import { watchEffect } from 'vue'
import { Router } from '/@app/router'

export function installGoogleAnalytics(gaId: string, router: Router) {
  ;(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r
    i[r] =
      i[r] ||
      function () {
        ;(i[r].q = i[r].q || []).push(arguments)
      }
    i[r].l = 1 * new Date()
    a = s.createElement(o)
    m = s.getElementsByTagName(o)[0]
    a.async = 1
    a.src = g
    m.parentNode.insertBefore(a, m)
  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga'
  )

  ga('create', gaId, 'auto')
  ga('set', 'anonymizeIp', true)

  watchEffect(() => {
    // console.log('sending', router.route.path)
    ga('set', 'page', router.route.path)
    ga('send', 'pageview')
  })
}
