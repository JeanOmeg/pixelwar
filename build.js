const { execSync } = require('child_process')

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' })
}

console.log('✅ Limpando arquivos')
run('rm -rf ./parcel-cache')
run('rm -rf ./docs')
run('rm -rf ./dist')

console.log('✅ Criando build')
run('parcel build ./index.html --dist-dir ./docs --public-url ./')

console.log('✅ Adicionando os arquivos')
run('git add .')

try {
  console.log('✅ Commit')
  run('git commit -m "- Build deploy"')
} catch (error) {
  console.log('ℹ️ Nada para commitar ou commit falhou')
}
