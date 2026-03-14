const { execSync } = require('child_process')
const fs = require('fs')

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' })
}

function removeDir(path) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true })
    console.log(`🗑️ Removido: ${path}`)
  } else {
    console.log(`ℹ️ Não existe: ${path}`)
  }
}

function hasStagedChanges() {
  try {
    execSync('git diff --cached --quiet')
    return false
  } catch {
    return true
  }
}

console.log('🗑️ Limpando arquivos')
removeDir('.parcel-cache')
removeDir('docs')
removeDir('dist')

console.log('🤖 Criando build')
run('C:\\Users\\Jean\\Documents\\workspace\\pixelwar\\node_modules\\.bin\\parcel build ./index.html --dist-dir ./docs --public-url ./ --no-cache --no-scope-hoist')

console.log('➕ Adicionando os arquivos')
run('git add .')

if (hasStagedChanges()) {
  console.log('✅ Commit')
  run('git commit -m "- Build deploy"')
} else {
  console.log('ℹ️ Nada para commitar')
}