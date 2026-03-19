import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-19',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    externals: {
      inline: ['pdf-parse'],
    },
  },

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    jiraBaseUrl: process.env.JIRA_BASE_URL || '',
    jiraEmail: process.env.JIRA_EMAIL || '',
    jiraApiToken: process.env.JIRA_API_TOKEN || '',
    jiraProjectKey: process.env.JIRA_PROJECT_KEY || 'GDCU',
  },

  app: {
    head: {
      title: 'Roadmap Planner',
      meta: [
        { name: 'description', content: 'Conversational product roadmap planning tool' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap' },
      ],
    },
  },
})
