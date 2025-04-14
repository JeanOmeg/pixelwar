// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    boot: [
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20'
      },

      typescript: {
        strict: true,
        vueShim: true
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      // viteVuePluginOptions: {},
      assetsInlineLimit: 0,
      sourcemap: true,
      vitePlugins: [
        ['vite-plugin-checker', {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,vue,tmx}"',
            useFlatConfig: true
          }
        }, { server: false }],
        ['tiled-tileset-plugin', {
          resolveId: {
            order: 'pre',
            handler(sourceId, importer, options) {
              if (!sourceId.endsWith(".tsx")) return;
              return { id: 'tileset:' + sourceId, external: 'relative' }
            }
          }
        }, { server: false }]
      ]
    },

    devServer: {
      port: 8080,
      open: false // opens browser window automatically
    },

    framework: {
      config: {},
      plugins: []
    },

    animations: [],

    ssr: {
      prodPort: 3000, // The default port that the production server should use
      middlewares: [
        'render' // keep this as last one
      ],

      pwa: true
    },

    pwa: {
      workboxMode: 'GenerateSW' // 'GenerateSW' or 'InjectManifest'
    },

    cordova: {
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
      },

      builder: {
        appId: 'pixel-war'
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: []
    }
  }
});
