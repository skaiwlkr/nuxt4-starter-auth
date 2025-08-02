// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // Type of the project. 'lib' for libraries, the default is 'app'
  type: 'app',

  // Enable stylistic formatting rules with custom settings
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  vue: true,

  // Disable jsonc and yaml support
  jsonc: false,
  yaml: false,

  // Disable problematic rules
  rules: {
    'unicorn/prefer-node-protocol': 'off',
    'node/prefer-global/process': 'off',
    'vue/block-order': ['error', {
      order: [['script', 'template'], 'style'],
    }],
    // Enforce max line length of 100 characters
    'max-len': ['warn', {
      code: 150,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      ignoreComments: false,
    }],
  },

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: [
    'dist/**',
    '.nuxt/**',
    'node_modules/**',
    'README.md',
  ],
}, {
  files: ['server/db/migrate.ts'],
  rules: {
    'no-console': 'off',
    'perfectionist/sort-imports': 'off',
    'antfu/if-newline': 'off',
    'style/brace-style': 'off',
  },
})
