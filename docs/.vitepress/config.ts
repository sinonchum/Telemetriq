import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Telemetriq',
  description: 'Open-source TypeScript/React visualization framework for high-frequency spatial time-series data',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/introduction' },
      { text: 'API', link: '/concepts/dataset' },
      { text: 'GitHub', link: 'https://github.com/sinonchum/Telemetriq' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Quick Start', link: '/quickstart' },
        ],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Dataset Schema', link: '/concepts/dataset' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'CSV to Telemetriq', link: '/guides/csv-to-telemetriq' },
        ],
      },
    ],
  },
});
