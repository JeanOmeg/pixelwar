import { defineConfig } from 'vitest/config'

export default defineConfig({
  // same as the transformer-raw of .parcelrc: these files are imported as URLs
  assetsInclude: ['**/*.tmx', '**/tiledMap/*.tsx', '**/*.wav', '**/*.mp3', '**/*.ttf'],
  test: {
    include: ['tests/**/*.test.ts'],
    // pure rules run in node; tests that need the engine set
    // `// @vitest-environment happy-dom` at the top
    environment: 'node',
    // the engine warns about every sound it can't play without a browser
    onConsoleLog: log => !/audio files|Attempting to use/.test(log)
  }
})
