const { readdirSync, statSync } = require('fs')
const { join, relative } = require('path')

function printTree(dir, depth = 0, maxDepth = 3, ignored = ['node_modules', 'dist', '.git', '.vscode', '.parcel-cache', 'docs', 'res/tiledMap', 'res/minis']) {
  if (depth > maxDepth) return
  const indent = '  '.repeat(depth)
  const files = readdirSync(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const relativePath = relative('.', fullPath).replace(/\\/g, '/')
    if (ignored.includes(file) || ignored.includes(relativePath)) continue

    const isDir = statSync(fullPath).isDirectory()
    console.log(`${indent}- ${file}`)
    if (isDir) {
      printTree(fullPath, depth + 1, maxDepth, ignored)
    }
  }
}

printTree('.', 0, 3)
