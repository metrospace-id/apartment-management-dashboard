const path = require('path')

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  eslint: {
    mode: 'file',
    configure: (eslintConfig) => {
      // Use the new flat config
      return eslintConfig
    },
    loaderOptions: {
      configFile: path.resolve(__dirname, 'eslint.config.mjs')
    }
  }
}
