import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Vue Floating UI Tour",
  description: "Documentation for vue-floating-ui-tour, a lightweight and customizable tour library for Vue 3.",
  base: '/floating-ui-tour/',

  head: [
    ['link', { rel: 'icon', href: '/floating-ui-tour/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/reference/api' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'Customization', link: '/guide/customization' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Middleware', link: '/guide/middleware' },
          ]
        }
      ],
      '/reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'useTour()', link: '/reference/api' },
            { text: 'types', link: '/reference/types' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pabyome/floating-ui-tour' } // Replace with your repo URL
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present PabyoMe' // Replace with your name/org
    },
    // algolia: {
    //   appId: '',
    //   apiKey: '',
    //   indexName: ''
    // },
  }
})
