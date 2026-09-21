// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  // Last: turns off every stylistic rule Prettier owns.
  prettier,
)
