# Checklist de melhorias — PixelFantasyWar

Levantamento feito lendo o código (nov/2026). Marque o que quer fazer; risque o que não quer.
Esforço: **P** = pequeno (horas), **M** = médio (1–2 dias), **G** = grande (vários dias).
⭐ = minha recomendação de prioridade (melhor relação valor/esforço).

---

## 1. Jogabilidade

### Leitura do tabuleiro (o jogador decide melhor)
- [x] ⭐ **Seta de direção sobre cada unidade** (P/M): o ataque pelas costas é central no jogo, mas a direção só aparece no card ("facing left").
  - **No mapa:** uma seta pequena em cada unidade, junto da barra de HP, apontando exatamente para onde ela está virada (cima, baixo, esquerda, direita). Atualiza a cada movimento, ataque, contra-ataque e "Undo move". No tabuleiro espelhado do online, a seta segue a tela (como o sprite).
  - **Ao mover:** no modo mover, ao passar o mouse (ou o cursor do teclado/controle, ou o toque de prévia) sobre um destino, mostrar no tile final a seta da direção em que a unidade vai parar (a do último passo do caminho, igual ao `Unit.move`). Assim o jogador decide já sabendo se vai ficar de costas para um inimigo.
  - **Onde mexer:** ator próprio por unidade, como o `hpBar` em `Unit` (redesenhado só quando a direção muda); a prévia no destino sai do caminho que a `SelectionManager` já calcula (`facingBetween` dos dois últimos nós).
- [x] ⭐ **No modo mover, mostrar de onde dá para atacar** (M): ao passar o mouse num destino, marcar os inimigos atacáveis dali e indicar "pelas costas" quando for o caso. — feito: highlight vermelho nos inimigos ao alcance a partir do destino e espada dourada sobre os que seriam atacados pelas costas.

### Ritmo e fim de partida
- [x] **MP nunca volta** (P, regra): no fim da partida quase ninguém tem skill. Todas as unidades ganham 1 de MP pra cada abate, e 1 de MP a cada critico, não pode ultrapassar o maximo de 4MP Exige rodar `yarn balance:sim`. Feito: +1 PM por abate e por crítico de verdade (o do Special não conta), teto de 4 sem exceção (Steal incluso). `balance:sim` (3000 partidas) antes × depois: todas as classes mudaram dentro do ruído (±2,5%); Warrior já estava em 46%, não foi a regra.

### Novos objetivos e modos
- [ ] ⭐ **Objetivos além de eliminar** (G): Comandante (perde quem perder o líder), Capturar ponto (altares do Ruined Temple / Fallen Citadel), Sobreviver N rodadas. Dá vida nova aos 12 mapas.
- [ ] **Desafios / puzzles** (M): "vença em 1 turno" com exército e posições fixas. O motor do tutorial (`script.ts`, `ActionGate`) e o `applyAction` ajudam muito.
- [ ] **Campanha curta** (G): sequência de mapas com exército que evolui (desbloqueia classes, mantém sobreviventes).
- [x] ⭐ **Gelo escorregadio** (M, muda regra): hoje o gelo (tiles 208–209 e o lago congelado 277–299, só no Frozen Pass) é marcado como chão rápido (`isFast`), igual à grama. Proposta: custa **2 de movimento**, como a floresta, e quem está nele fica com **−2 DEF** (é difícil se defender escorregando).
  - **Nova flag:** precisa de uma flag nova (`isIce`) no tileset, gerada por `yarn tileset` (`scripts/tileset/`). Só tirar o `isFast` não basta, porque o jogo trataria o gelo como floresta (+2 DEF e custo de alcance).
  - **Onde mexer:** custo no `PathFinder`, −2 DEF em `Unit.combatStats()` (ao lado do bônus da floresta) e uma constante `ICE_DEFENSE` em `combat.ts`.
  - **Decidido — movimento:** Thief e Assassin andam no gelo pagando 1. O Ranger paga 2, como as outras classes. Ou seja, o gelo **não** segue a regra da floresta em `TERRAIN_RULES`: o Ranger é rápido na floresta, mas não no gelo.
  - **Decidido — alcance:** o gelo não custa alcance a mais para ninguém, porque é terreno aberto. O `slowTerrainCostsRange` precisa tratar o gelo como tile rápido.
  - **IA:** confirmar que o `ThreatMap` e o `scorePosition` usam `combatStats()`. Assim a IA evita parar no gelo sozinha. Rodar `yarn ai:sim` no Frozen Pass.
  - **Mapa e tutorial:** o lago congelado deixa de ser atalho e vira uma travessia arriscada; rever o Frozen Pass. O tutorial não é afetado (Twin Keeps não tem gelo).
  - **Feito:** flag `isIce` (tiles 208, 209, 277–279, 287–289, 297–299), `terrainDefense` em `terrain-rules.ts` (usado por `combatStats` e pelo `defenseAt` da IA), `ignoresIce` em `TERRAIN_RULES` (Thief/Assassin, traço "Sure-footed"), status "Ice DEF -2" no card. Frozen Pass (`SIM_MAP=map_10`, 20 jogos): turnos terminados no lago caíram de 38% → 22% (Normal) e 27% → 10% (Hard), sem empates, partidas ~2 fases mais longas; o mapa ficou como está (corredores abertos acima e abaixo do lago). IA nova × antiga lá: Hard 98%, Normal 88%.
  - **Atualizar:** README, `howTo` (Terrain) nos dois idiomas, card de terreno, `tests/pathfinding` e `tests/unit-rules`.

---

## 2. Feedback visual e áudio (sensação de jogo)

- [x] ⭐ **Projéteis** (M): Archer/Ranger/Mage/Necromancer não disparam nada; o alvo só pisca. Flecha, bola de fogo e magia verde atravessando os tiles deixam o ataque à distância legível.
- [x] ⭐ **Efeitos de skill** (M): Fireball sem explosão na área, Heal sem brilho, Guard/Shield Wall sem aura. Partículas simples (já existe `dust-particles.ts`).
- [x] **Tremida de câmera e flash** em crítico e ataque pelas costas (P).
- [x] ⭐ **Sons que faltam** (P/M): hoje são só 5 efeitos (hit, move, select, target, explosão) e o mesmo `HitSound` serve para espada, flecha e magia. Faltam: errou, crítico, cura, skill, morte própria, vitória/derrota, botão desabilitado.
- [x] **Mais músicas** (P): uma trilha só para todas as partidas. — feito: 16 faixas do Alexander Nakarada (Pixabay, crédito na tela Credits) tocando em ordem aleatória durante a partida (`src/music.ts`); a do menu nunca muda. Carregam sob demanda e são convertidas para 64 kbps por `yarn music` (originais em `music-src/`, fora do git): 141 MB → 34 MB.
- [x] **Volume separado de música e efeitos** (P): hoje só existe mudo ([src/audio-manager.ts](src/audio-manager.ts)).
- [x] **Tela de fim mais rica** (M): hoje só título + subtítulo. Mostrar dano causado, abates, MVP, crítico mais forte, rodadas.

---

## 3. Interface

- [ ] ⭐ **Tela de Opções** (M): reunir volume de música/efeitos, velocidade, confirmar End turn, mostrar grade, animações reduzidas, tamanho do texto. Hoje as opções estão espalhadas (canto da tela, HUD, pausa).
- [ ] ⭐ **Card de terreno** (M): mouse parado sobre um tile com regra especial mostra um card no mesmo estilo do `unit-card`, com o nome do terreno e as regras dele:
  - **Floresta:** custa 2 de movimento (Thief/Assassin/Ranger pagam 1), dá +2 DEF a quem está nela e custa 2 de alcance para Archer, Mage, Spearman, Ranger e Necromancer.
  - **Porta:** custa 2 de movimento, bloqueia ataques e quem está nela não ataca nem é atacado.
  - **Água:** não dá para andar nela; só Archer, Mage, Ranger e Necromancer atiram por cima.
  - **Gelo / lago congelado:** custa 2 de movimento (Thief/Assassin pagam 1; o Ranger paga 2), quem está nele fica com −2 DEF e, para ataques, é campo aberto (custa 1 de alcance para todos).
  - **Arbustos, capim alto e entulho:** funcionam como floresta, então mostram as mesmas regras.
  - **Unidade em cima de um terreno especial:** o card do terreno aparece **acima** do card da unidade, os dois juntos.
  - **Sem card:** paredes, pedras, árvores e outros tiles que só bloqueiam (é óbvio), e chão comum.
  - **Implementação:** as regras vêm das flags do tile (`PathNodeComponent`: `iswalkable`, `isattackable`, `isfast`, `isdoor`, `iswater`, `isice`) e de `TERRAIN_RULES`, sem tabela por id de tile. Os textos entram em `en.ts` e `pt-br.ts`. No toque, o card aparece ao tocar no tile; no teclado e no controle, junto com o cursor.
- [ ] **Grade do tabuleiro opcional** (P): ajuda a contar tiles de alcance.
- [ ] **Histórico de combate** (M): painel recolhível com "Archer → Cleric: 4 dano (68%)". O online já tem o `ActionFeed`; o local poderia reaproveitar.
- [ ] **Prévia de combate em todos os modos** (P): ao escolher um ataque, o card com as probabilidades (acerto, crítico, dano, chance de matar e contra-ataque) deve aparecer no modo online e no tutorial, não só nas partidas locais. Hoje a prévia vem do `GameUI.forecastView` ([src/game-ui.ts](src/game-ui.ts)); falta investigar por que ela não aparece nesses dois modos (a causa ainda não foi verificada).
  - **Online:** conferir no jogador local (`isLocal`) e no espelhamento do tabuleiro; no turno do adversário não precisa aparecer.
  - **Tutorial:** conferir se o `ActionGate` ou o `TutorialMatch` escondem o card; a prévia ajuda a ensinar as chances, então deve aparecer no passo de ataque sem atrapalhar o balão.
  - **Testar:** local, online (duas abas com `?localnet`) e tutorial, com mouse, toque e controle.
- [ ] **Card com as skills** (P): no hover, mostrar quais skills a unidade inimiga ainda pode pagar com o MP que sobra (ameaça de Backstab, Rage...).
- [ ] **Dica ociosa longa demais** (P): "[Left click] select unit · [Right click] move range · [Middle click]..." é muita coisa todo turno. Encurtar depois que o jogador já usou cada comando.
- [ ] **Descrições de classe** (P): Cleric diz "Sturdy and mobile. Holds the line well." e não fala da cura, que é o papel dele. Mage, Archer e Ranger têm o mesmo papel "Ranged".
- [ ] **Exércitos salvos** (P/M): guardar 3–5 composições com nome na tela de exército, além do "último usado".
- [ ] **Daltonismo** (P): opção de padrão/borda diferente por time além de azul × vermelho.
- [ ] **Itens pendentes do tutorial** ([CHECKLIST-TUTORIAL.md](CHECKLIST-TUTORIAL.md)): botão em "How to play" que abre o tutorial, teste do `ActionGate`, teste em celular e controle.

---

## 4. Retenção / meta

- [ ] **Estatísticas locais** (P): vitórias por mapa, dificuldade e classe em `localStorage`, numa tela "Records".
- [ ] **Conquistas** (M): "vença sem perder unidade", "3 ataques pelas costas em um turno", "vença no Hard em cada mapa".
- [ ] **Desafio diário** (M): mapa + exércitos sorteados com a data como semente, todos jogam o mesmo.
- [ ] **Salvar e continuar partida local** (M): fechar a aba hoje perde a partida contra a CPU. Gravar a lista de ações (como o online já faz) e reaplicar.
- [ ] **Replay** (M): com o histórico de ações acima, rever uma partida e exportar/importar um código.

---

## 5. Aplicativo Android

- [ ] **App Android com o código atual** (M): empacotar o mesmo build do Parcel num app Android.
  - **Opções avaliadas:**
    - **Capacitor** (escolhido): sucessor do Cordova, mantido pela Ionic. Copia a pasta do build para dentro do app (`webDir`) e roda numa WebView moderna. Funciona **offline** (menos o modo online), o projeto `android/` é Gradle comum (abre no Android Studio) e os plugins oficiais cobrem o que falta (voltar, tela cheia, orientação).
    - **Cordova:** faz a mesma coisa, mas está em declínio: plugins abandonados e Android/Gradle sempre atrasados. Nenhuma vantagem sobre o Capacitor aqui.
    - **TWA** (Trusted Web Activity, via Bubblewrap): só abre o site do GitHub Pages no Chrome, sem barra. Fica pequeno e atualiza junto com o deploy, mas precisa de internet (não temos service worker) e exige um `assetlinks.json` na **raiz do domínio** (`jeanomeg.github.io/.well-known/`), que um site de projeto (`/pixelwar`) não controla. Descartado.
  - **Configuração:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`; `capacitor.config.ts` com `webDir: 'docs'` (o `--public-url ./` do Parcel já serve para caminhos relativos); a pasta `android/` vai para o git, mas as saídas dela (`android/app/build`, `.gradle`) vão para o `.gitignore`.
  - **Ajustes no jogo:**
    - Detectar o app (`Capacitor.isNativePlatform()`) e tratá-lo como `isStandalone`: esconder o botão de tela cheia e a dica de Tela de Início.
    - **Sempre em paisagem, como os jogos de celular**, do splash ao fim, independente de como o aparelho está, da trava de rotação ou de qualquer configuração do sistema. Travado na própria `MainActivity` (`android:screenOrientation="sensorLandscape"` no `AndroidManifest.xml`: só as duas paisagens, girando 180° conforme o aparelho; nunca retrato), não pelo JavaScript. Com `configChanges` de orientação/tamanho para a Activity não ser recriada ao girar.
    - No app, o `.rotate-hint` ("gire o aparelho") e o travamento de orientação do `enterFullscreen` nunca rodam (não são necessários). Modo imersivo (sem barra de status nem de navegação).
    - **Botão voltar** do Android (`@capacitor/app`, `backButton`) = Esc (fecha menu, cancela, pausa); no título, sai do app.
    - Pausar a partida e o som quando o app vai para segundo plano (`appStateChange`).
    - Conferir na WebView: áudio depois do PLAY!, WebRTC/Trystero do modo online, `localStorage` (preferências e exércitos) e o controle (gamepad Bluetooth).
    - Ícone e splash a partir dos ícones já gerados em `src/assets/icons/` (`@capacitor/assets`).
  - **`yarn build`:** depois do `yarn build:parcel`, o `build.js` roda `npx cap sync android` e `gradlew assembleRelease` (em `android/`), e copia o APK para uma pasta fora do git (ex.: `release/pixelfantasywar.apk`). **Não commitar o APK**: com dezenas de MB a cada build, o histórico incha (publicar numa GitHub Release, se for distribuir).
    - Se não houver Android SDK/JDK na máquina (`ANDROID_HOME`/`JAVA_HOME`), pular o passo do Android com um aviso, sem quebrar o deploy da web.
    - Assinatura do release: keystore e senhas fora do repositório (variáveis de ambiente ou `android/keystore.properties` no `.gitignore`). Sem keystore, gerar só o APK de debug.
  - **Play Store** (opcional, depois): gerar `.aab` (`bundleRelease`), conta de desenvolvedor e política de privacidade (o modo online usa relays públicos do Nostr).
  - **Atualizar:** README (como instalar o APK) e CLAUDE.md (comandos, seção "Celular e toque").

---

## 6. Documentação desatualizada (correções rápidas)

- [x] README: "**Units** (as 8 classes...)" → são 14.
- [x] README: a lista de classes/stats não inclui as 6 novas (conferir a seção de unidades). — já estava completa (14 classes na tabela "Unidades").
- [x] Texto "How to play" (`howTo` → Terrain): "Archers, mages and spearmen pay 2 points of range per forest tile" — Ranger e Necromancer também pagam.
- [x] CLAUDE.md aponta para `CHECKLIST-ONLINE.md` e `CHECKLIST-GAMEPAD.md`, que não existem mais no repositório. — foram excluídos porque já foram concluídos; links removidos do CLAUDE.md.
