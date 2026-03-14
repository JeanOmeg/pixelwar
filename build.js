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

console.log('✅ Commit')
run('git commit -m "- Build deploy"')
