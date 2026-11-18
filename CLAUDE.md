# PixelFantasyWar — Guia de referência do projeto

Jogo de estratégia tática por turnos (estilo Fire Emblem / FFT) que roda no navegador.
Deploy: GitHub Pages servindo a pasta `docs/` → https://jeanomeg.github.io/pixelwar/

## Stack

- **TypeScript** (strict, `experimentalDecorators`) — sem testes automatizados.
- **Excalibur.js 0.30.x** (engine 2D) + **@excaliburjs/plugin-tiled 0.30.2** (mapas `.tmx`).
- **Lit 3** para UI em HTML sobre o canvas (Web Components).
- **Parcel 2.11** como bundler. Assets (`png, wav, mp3, tmx, tsx, ttf`) usam `transformer-raw` (`.parcelrc`) e são importados como URL (tipos em `src/files.d.ts`).
- Gerenciador de pacotes: **yarn** (`yarn.lock`; `build.js` chama `yarn`).

## Comandos

```
yarn dev            # parcel serve index.html
yarn build:parcel   # build em ./docs (public-url ./)
yarn build          # node build.js: apaga .parcel-cache/docs/dist, builda, faz `git add .` e commit "- Build deploy"
npx eslint src      # lint
npx tsc --noEmit    # checagem de tipos
```

⚠️ `yarn build` **faz commit automaticamente** de tudo que estiver no working tree. Não rodar sem o usuário pedir.
⚠️ `docs/` é saída de build (com hashes). Nunca editar à mão.

## Estilo de código (eslint.config.js)

- 2 espaços, aspas simples, **sem ponto e vírgula**, `{ a }` com espaços em objetos.
- `no-console` = warn; `any` = warn.
- Identificadores e textos do jogo em inglês; commits e README em português.

## Arquitetura

Fluxo: `index.html` → [src/main.ts](src/main.ts) cria `ex.Engine` (1920x1080, FitScreenAndFill, pixel-art) → registra cenas → `game.start(loader)` → monta `<start-screen-ui>`.
Roda também em celular/tablet (ver "Celular e toque").

| Arquivo | Responsabilidade |
|---|---|
| [src/main.ts](src/main.ts) | Engine, registro das cenas (`menu-shell` + uma `LevelBase` por entrada de `MAPS`), tela inicial |
| [src/maps.ts](src/maps.ts) | **Registro de mapas `MAPS`** (fonte única: cenas, seletor e sorteio), `sceneNameOf`, `getMapInfo` (tamanho, tiles e spawns lidos do `.tmx`) |
| [src/game-modes.ts](src/game-modes.ts) | `GameMode`, `GAME_MODES` (textos da tela de modo) e `MatchSettings` (dados passados à cena) |
| [src/ui-sprites.ts](src/ui-sprites.ts) | Desenha em canvas e devolve data URL: `mapPreview(map)` (miniatura gerada do `.tmx`) e `unitPortrait(type)`. Com cache |
| [src/unit-classes.ts](src/unit-classes.ts) | `CLASS_INFO` (papel e descrição por classe), traços derivados de `TERRAIN_RULES`; usado na tela Units |
| [src/resources.ts](src/resources.ts) | Todos os assets (`Resources`), spritesheets e **todas as animações** das unidades (~2500 linhas geradas por repetição), `loader` |
| [src/config.ts](src/config.ts) | `SCALE` (2x), `SCALE_UNIT`, `UNIT_OFFSET`, `ENEMY_SPEED`, tipos `UnitType`, e **`UNIT_CONFIG`** (stats + animações + skills de cada unidade) |
| [src/levels/level-base.ts](src/levels/level-base.ts) | `LevelBase` (ex.Scene, uma por mapa): no `onActivate` lê o modo de `context.data` (`MatchSettings`), limpa a cena, monta o tabuleiro, cria jogadores, posiciona unidades (spawns de `getMapInfo`) e inicia o `TurnManager` |
| [src/board.ts](src/board.ts) | Grade de `Cell`s, conversão world→cell, `getUnits()`, instancia `PathFinder` |
| [src/cell.ts](src/cell.ts) | Actor de cada tile; guarda `unit`, `pathNode` e os highlights (`range`/`path`/`attack`/`cursor`) |
| [src/unit.ts](src/unit.ts) | Actor da unidade: estado do turno, movimento animado, ataque (usa `combat.ts`), animações direcionais, morte |
| [src/combat.ts](src/combat.ts) | **Regras de combate puras** (sem engine): `resolveAttack`, `forecastAttack` (probabilidades exatas), `facingBetween`, `rollWithAdvantage` |
| [src/player.ts](src/player.ts) | Classe abstrata. Cada jogador recebe um **bitmask** (`mask`) usado no pathfinding; `Player.resetMasks()` a cada level |
| [src/human-player.ts](src/human-player.ts) | Input do mouse e callbacks do menu de unidade; turno aguarda `ex.Future` (`humanMove`) |
| [src/computer-player.ts](src/computer-player.ts) | IA: gera `ActionPlan`s, pontua (`evaluate*`) e executa a melhor, por unidade (ordem: menor HP primeiro) |
| [src/turn-manager.ts](src/turn-manager.ts) | Loop de fases, resultado (vitória/empate), tela de fim, revanche e volta ao menu |
| [src/selection-manager.ts](src/selection-manager.ts) | Unidade selecionada, modo `move`/`attack`, ranges, caminho, highlights e cursor |
| [src/path-finding/](src/path-finding/) | `PathNodeComponent` (flags do tile, mask, x/y), `PathFinder` (Dijkstra de movimento → `MovementMap`, alcance de ataque em linha reta) e `terrain-rules.ts` (regras por classe) |
| [src/game-ui.ts](src/game-ui.ts) | `GameUI`: controlador da UI de partida (HUD, dica, card/prévia, menu, banner, fim). Criado por partida e destruído no `onDeactivate` |
| [src/ui-components/](src/ui-components/) | Lit (shadow DOM). Partida: `game-hud` (+ `game-hint`), `unit-card`, `unit-menu`, `phase-banner`, `game-over`. Menus: `start-screen-ui` (título, modo, páginas), `map-select`, `start-screen-pages.ts` (How to play, Units, Credits). `audio-menu`. Base visual em `theme.ts` e `icons.ts`; dados em `view-models.ts` |
| [src/damage-manager.ts](src/damage-manager.ts) | Número de dano flutuante (`Critical!`, `Back attack!`, `Miss`) |
| [src/audio-manager.ts](src/audio-manager.ts) | Volumes padrão e mute |
| [src/device.ts](src/device.ts) | Celular/tablet: `isTouchDevice`, `readableBoost` (ampliação da UI em tela pequena), tela cheia + paisagem no primeiro toque (`setupTouchDevice`) |
| [src/css/main.css](src/css/main.css) | Só a fonte global e `.credits` (a UI de jogo tem estilos próprios nos componentes) |

**Código morto / legado** (não importado pelo jogo): `src/actors/actor-start-screen.ts`, `src/texts/`, `src/fonts/`, `src/assets/tiledMap/map1.js|map2.js|map3.js`, `src/assets/maps/Map1.png|Map2.png` (miniaturas antigas; agora são geradas) e `credits.html` (o conteúdo está na tela Credits). `Resources.LevelMusic1` não é usado (só `LevelMusic2`).

## Fluxo de jogo

1. `start-screen-ui`: título (Play / How to play / Units / Credits) → modo → `map-select` → `engine.goToScene(sceneNameOf(map), { sceneActivationData: { mode } })`. O último modo e mapa escolhidos ficam em `localStorage` (`pixelfantasywar.mode`, `pixelfantasywar.map`) só para pré-selecionar; a partida não depende disso.
2. `LevelBase.onActivate` → `resetAndLoad()` → `parse()` (cria `SelectionManager`, `GameUI`, jogadores, unidades e `TurnManager`) → `turnManager.start()` (não aguardado).
3. `TurnManager.start()`: para cada fase: `checkResult` (só um jogador com unidades → vencedor) → `ui.setTurn` + `ui.playPhaseBanner` → `player.turnStart()` (reseta unidades) → `makeMove()` até retornar `true` → `turnEnd()` → `nextTurn()`.
4. Fim: `ui.showGameOver(...)` com "Victory!"/"Defeat" (PvCPU), "Blue/Red wins!" (PvP e CPUvCPU) ou "Draw" (limite de fases). "Play again" → `LevelBase.restart()` (vai a `menu-shell` e volta com o mesmo `MatchSettings`); "Main menu" → `menu-shell` + remonta `start-screen-ui`.
5. `LevelBase.onDeactivate` → `ui.destroy()` e `player.dispose()` (fecha os listeners de pointer do `HumanPlayer`).

Nomes dos jogadores: `'Human'`/`'CPU'` (PvCPU), `'Human A'`/`'Human B'` (PvP), `'CPU A'`/`'CPU B'` (CPUvCPU). A UI não usa esses nomes: o time vem do índice no array (`0` = Blue, `1` = Red) e o rótulo de `Player.isHuman` ("Player", "Player 1", "CPU"...).

`maxTurns` (por mapa, em `MAPS`; hoje 100) conta **fases de jogador**, não rodadas. Ao chegar a 0 a partida termina empatada.

No início da partida o time 0 fica virado para a direita e o time 1 para a esquerda (`miniDirection`), para que ataque de frente não conte como ataque pelas costas.

## Mapas (Tiled)

- Arquivos em `src/assets/tiledMap/` (`map_1.tmx`, `map_2.tmx`, tileset `NewFullTile.tsx` + `src/assets/tiles/NewFullTile.png`). Tiles 32x32, mapa 28x17.
- Camada de tiles obrigatória: **`map`**. Propriedades booleanas por tile no tileset: `iswalkable`, `isattackable`, `isfast`, `isdoor`, `iswater`.
- Camada de objetos obrigatória: **`unit`**. Cada objeto: `name` = `UnitType` (ex.: `ArcherA`) e class/type = índice do jogador (`0` ou `1`).
- Nada de PNG de miniatura: o seletor desenha a miniatura a partir do `.tmx` (`mapPreview`), com as unidades nas posições iniciais. Tamanho, unidades por time e o elenco também vêm do `.tmx`.
- Mapas atuais: `map_1` Twin Keeps, `map_2` River Isles, `map_3` Greenwood, `map_4` Split River, `map_5` Crater Lake, `map_6` Old Fortress, `map_7` Riverside Village, `map_8` Ruined Temple. Todos espelhados (terreno e exército simétricos em x → 27 − x).

**Tiles que combinam** (ids do tileset; no `.tmx` o gid é id + 1). Tudo abaixo já aparece nos mapas existentes:
- Chão: grama 20–23, terra 0–3, piso de pedra 30–33, cascalho 10–13. Pedras (bloqueiam): na grama 24–26, na terra 4–6, na pedra 34–36, na água 44–46.
- Moldura da ilha (água + margem de terra): cantos 87 ┌, 89 ┐, 107 └, 109 ┘; topo 88/118; base 108/138; esquerda 97/127; direita 99/129. O lado de terra combina direto com terra (0–3).
- Grama sobre terra (anel da ilha, jardins): 110 ┌, 111 topo, 112 ┐, 120 esquerda, 122 direita, 130 └, 131 base, 132 ┘, miolo 20–23.
- Lago retangular (≥ 2×2): 170 ┌, 138 topo, 173 ┐, 99 esquerda, 97 direita, 180 └, 88 base, 183 ┘, miolo 40–43. Em grama, cercar com 131 (acima), 111 (abaixo), 122 (à esquerda), 120 (à direita); em terra, não precisa.
- Rio vertical de 2 colunas: 99 | 97, com 89 | 87 na borda de cima e 109 | 107 na de baixo (são cantos de duas ilhas). Ponte sobre ele: 167 | 169. Ponte larga sobre lago: 167, 168…, 169 numa linha do lago. Canal horizontal: 147, ponte vertical 48.
- Bosque 3×3 na grama: 50–52 / 60–62 / 70–72; na terra: 53–55 / 63–65 / 73–75. Árvore solta na grama: 78 (o 68 tem fundo de grama, não usar na terra).
- Construção retangular (padrão dos castelos do `map_1`): linha de cima com **cantos de topo de muro claro (8/17)** e fachadas 18/19/28/29 no meio; laterais com topo de muro 7/8/9/17; linha de baixo só com fachadas (inclusive nos cantos); piso 30–33. Porta na parede de cima/baixo: 38 no lugar de uma fachada.
- **Porta lateral**: nunca colocar o 37 direto na coluna do muro. Ela fica numa saliência **uma coluna para fora** do muro, em 3 linhas: 27 (acima), 37 (porta), fachada 29/18 (abaixo); no muro principal, fachada na linha de cima da porta e piso na linha da porta. O 27 (muro com arco) só aparece acima de uma porta lateral.
- Pilar ou bloco isolado: 39 (sobre piso). Topo de muro (7/8/9/17) sozinho vira um quadrado claro sem fachada, não usar como pilar.

**Adicionar um mapa** (o `.tmx` + 2 trechos de código):
1. Desenhar o `.tmx` no Tiled (camadas `map` e `unit`, tileset `NewFullTile.tsx`) em `src/assets/tiledMap/`.
2. Em `resources.ts`, importar o `.tmx` e criar o `TiledResource` (copiar o de `TiledMap1`, com `pathMap` para `.tmx`, `.png` e `.tsx`).
3. Em [src/maps.ts](src/maps.ts), adicionar `{ id, name, description, tiledMap, maxTurns }` em `MAPS`. O `id` é estável (vai no nome da cena e nas preferências salvas).

Pronto: cena, item no seletor, miniatura, sorteio e "Play again" saem dessa entrada. O seletor tem lista rolável e navegação por teclado, então não há limite prático de mapas.

## Unidades

14 classes, cada uma com variante **A (azul, jogador 0)** e **B (vermelho, jogador 1)**, com os **mesmos stats nos dois times**.
- Originais: Archer, Mage, Spearman, Thief, Fighter, Cleric, Barbarian, Warrior.
- Novas: Paladin, Berserker, Assassin, Ranger, Necromancer, Halberdier.
O nome do actor é o `UnitType`; regras por classe removem o sufixo com `name.replace(/[AB]$/, '')` (`unitClassOf`).

Spritesheets em `src/assets/minis/<Classe><A|B>.png`: grade 4 colunas x 14 linhas de 32x32 (linhas 0–3 lateral, 5–8 de frente, 10–13 de costas; cada bloco = idle/move/attack/death, 4 quadros). Esquerda = lateral com `flipHorizontal`. As originais têm as 12 animações escritas uma a uma em `resources.ts`; as novas usam `buildUnitAnimations(image)` (`NewUnitAnimations`).

**Sprites das classes novas** foram derivados das originais (mesmo estilo e animações): troca de paleta + peças desenhadas por quadro acima da cabeça. Paleta comum a todos os minis: contorno `#0a0d2a`, sombra `#000000` (alpha 128), time escuro `#0000c0`/`#a61414`, time claro `#7d7dea`/`#f96363`, branco `#ffffff` (brilho e efeito de golpe), madeira `#684722`/`#bc9148`, pele `#f3cb87`, dourado `#fff000`.
| Nova | Base | Mudança |
|---|---|---|
| Paladin | Fighter (espada) | armadura prata, time mais vivo, elmo de aço, detalhes dourados, penacho, golpe dourado |
| Berserker | Barbarian | pele de pintura de guerra, machado de aço, chifres, golpe laranja |
| Assassin | Thief | roupa bem escura, lâmina e golpe roxos |
| Ranger | Archer | arco/couro verdes, pena, flecha verde |
| Necromancer | Mage | manto escuro, pele pálida, cajado de osso, magia verde |
| Halberdier | Spearman | elmo com crista, haste de aço |

**Adicionar unidade:** spritesheet (as duas cores) → `ImageSource` em `Resources` + entrada em `NewUnitAnimations` (`resources.ts`) → `UnitType` + stats em `NEW_CLASS_STATS` + entradas A/B em `UNIT_CONFIG` (`config.ts`) → `UnitClass` + `TERRAIN_RULES` (`terrain-rules.ts`) → `CLASS_INFO` (papel, descrição, **custo**) e `NEW_CLASSES` (`unit-classes.ts`). Ela aparece sozinha na tela de exército e na tela Units. Recalcular o custo como descrito em "Balanceamento".

| Classe | HP | ATK | DEF | Range | Move | Custo | Terreno |
|---|---|---|---|---|---|---|---|
| Archer | 10 | 2 | 2 | 6 | 4 | 9 | mira água; alcance cai em terreno lento |
| Mage | 10 | 2 | 2 | 5 | 5 | 9 | mira água; alcance cai em terreno lento |
| Spearman | 10 | 4 | 2 | 2 | 6 | 8 | alcance cai em terreno lento |
| Thief | 10 | 5 | 2 | 1 | 6 | 9 | velocidade total em terreno lento |
| Fighter | 15 | 4 | 3 | 1 | 6 | 12 | — |
| Cleric | 20 | 3 | 4 | 1 | 6 | 16 | — |
| Barbarian | 20 | 5 | 4 | 1 | 4 | 16 | — |
| Warrior | 25 | 4 | 5 | 1 | 4 | 21 | — |
| Paladin | 18 | 4 | 4 | 1 | 5 | 15 | — |
| Berserker | 16 | 7 | 2 | 1 | 5 | 14 | — |
| Assassin | 8 | 6 | 1 | 1 | 7 | 8 | velocidade total em terreno lento |
| Ranger | 10 | 3 | 2 | 5 | 5 | 12 | velocidade total em terreno lento; mira água; alcance cai em terreno lento |
| Necromancer | 8 | 4 | 2 | 4 | 4 | 8 | mira água; alcance cai em terreno lento |
| Halberdier | 14 | 4 | 3 | 2 | 4 | 11 | alcance 2 em qualquer terreno |

Todas têm `mp: 4` e as mesmas skills. O Barbarian B tinha ATK 6 (o A tinha 5); foi igualado em 5 para os exércitos por pontos serem justos.

### Balanceamento

O custo de cada classe sai da matemática real de combate (`forecastAttack`, probabilidades exatas com vantagem):
- **ataque** = dano médio esperado contra todas as classes;
- **resistência** = HP ÷ dano médio recebido de todas as classes (quantos ataques aguenta);
- **ameaça** = movimento + alcance efetivos, supondo ~35% de terreno lento (quem paga 2 em terreno lento perde metade disso);
- **poder** = ataque × resistência × ameaça/6 × (1 + 0,12 por tile de alcance além de 1).
O custo é o poder escalado para que as 8 originais somem **100** (= `ARMY_BUDGET`). Assim o exército desenhado nos mapas atuais custa exatamente o orçamento. Faixa de poder relativo: originais 0,63–1,70; novas 0,60–1,18 (nenhuma domina, nenhuma é inútil).

### Escolha de exército

Antes da partida, cada humano monta o exército na tela `<army-select>` (após o seletor de mapas; no PvP primeiro o Azul, depois o Vermelho; a CPU usa o exército do mapa; no CPU vs CPU a tela é pulada).
- Os **slots** são os spawns do time no `.tmx`, na ordem dos objetos (`teamSpawns`). O jogador escolhe a classe de cada slot; posição continua a do mapa.
- Orçamento `ARMY_BUDGET` (100). "Classic army" = exército desenhado no mapa (`defaultArmy`). Último exército usado por mapa/time fica em `localStorage` (`pixelfantasywar.army.<mapId>.<time>`).
- O resultado vai em `MatchSettings.armies` (`[azul, vermelho]`, `null` = do mapa) e a `LevelBase` aplica com `spawnsWithArmies`. "Play again" reaproveita os mesmos exércitos.

## Regras de combate (`src/combat.ts`, usado por `Unit.attack`)

- d20 e d6 rolados **sempre com vantagem** (`rollWithAdvantage`: maior de 2).
- Acerta se `ATK + d20 > DEF + 10`, ou crítico, ou ataque pelas costas.
- Crítico: `d20 === 20` ou `forcesCritical` → dano `12 + ATK − DEF`.
- Pelas costas: direção do atacante até o alvo (`facingBetween`) igual a `alvo.miniDirection` (`Unit.isBehind`) → `d6 + 2·ATK − DEF`.
- Normal: `d6 + ATK − DEF`.
- Dano mínimo 1. **Errar também causa 1 de dano** (o README diz que erro não causa dano — divergência).
- `forecastAttack` enumera todas as combinações d20×d6 com vantagem e devolve chance de acerto, de crítico, faixa de dano, dano médio e chance de matar. A prévia da UI usa isso, e a IA pode usar também. Mudou a regra? Mude **só** `resolveAttack`.
- Morte tratada em `onPostUpdate` quando `health <= 0`.

## Movimento e alcance (`PathFinder`)

- Vizinhança ortogonal (4 direções). Custo por tile: `isfast` = 1, normal = 2. **Thief** paga 1 em qualquer tile que não seja porta.
- Regras por classe (Thief ignora terreno lento, quem paga 2 de alcance em terreno lento, quem mira água) ficam em [src/path-finding/terrain-rules.ts](src/path-finding/terrain-rules.ts) (`TERRAIN_RULES`). Esse módulo não importa assets, para poder ser testado fora do navegador.
- `getMovementMap(start, mask, budget, unitName)` → `MovementMap`: Dijkstra sobre estados (nó, direção) com prioridade `custo·1000 + curvas`, então o caminho é sempre o mais barato e, no empate, o com menos curvas. `range` = nós onde a unidade pode **parar** (a própria célula + tiles vazios); `pathTo(node)` devolve `[start..node]` ou `[]`; `costTo(node)`. `getRange`/`findPath` são atalhos para ele. Use um único `MovementMap` quando precisar de vários caminhos (a IA faz isso).
- Passagem: tile `isWalkable` cujo `walkableMask & player.mask` ≠ 0. Tile com unidade tem `walkableMask = mask do dono` → aliados passam (mas não dá para parar neles), inimigos bloqueiam. `PathNodeComponent.isOccupied` = `walkableMask !== -1`.
- `getRangeAttack(start, ~player.mask, range, unitName, ignore?)`: anda em linha reta nas 4 direções; para em tile não `isAttackable`, em porta, quando acaba o alcance, ou na primeira unidade (inimigo entra no resultado, aliado não). Não inclui a célula de origem. Água só é alvo para Archer/Mage. Archer/Mage/Spearman pagam 2 em tile não-rápido; demais pagam 1. Unidade parada em porta não ataca. `ignore` trata um nó como vazio (a IA usa para avaliar ataque a partir de outra célula, sem que a própria unidade bloqueie a linha).
- `PathNodeComponent` guarda `x`/`y` da grade; não depende mais do nome da cell.
- No mapa: `#` (parede/árvore) = não andável e não atacável; água = não andável, mas atacável (ataque passa por cima); porta = andável (custo 2) e não atacável.

## Turno e skills

Flags da unidade: `moved`, `attacked`, `passed`, `usedSkill`, `isRunning`, `forcesCritical`. `reset()` no início do turno do dono. Unidade sem ações fica com tint cinza.

Skills (definidas em `UNIT_CONFIG[...].skill`, `event` é o nome do evento DOM do menu):
- `skill-run` (2 MP): exige não ter movido nem atacado; `effectiveMovement` = 2× movimento. Se o movimento for cancelado, MP é devolvido.
- `skill-special-attack` (4 MP): exige não ter atacado; próximo ataque é crítico. Se cancelado, MP é devolvido.
- 1 skill por turno; MP não regenera. Regras em `Unit.canUseSkill`.
- A devolução de MP do humano fica em `HumanPlayer.refundPendingSkill` (usada ao mover, atacar, cancelar com Esc e encerrar o turno).

**Adicionar skill:** entrada em `skill[]` no `UNIT_CONFIG` → caso em `canUseSkill` → callback em `MenuOptions` + `case` em `GameUI.onMenuSelect` → implementação em `HumanPlayer.maybeSelectUnit` (e devolução em `refundPendingSkill`) → suporte na IA (`ActionPlan.type`, `evaluateAction`, `executeAction`).

## IA (`ComputerPlayer`)

Para cada unidade (menor HP primeiro), em loop até mover+atacar: gera ações (`attack`, `skillSpecialAttack`, `skillRun`, `move`, `moveAndAttack`, `flee`, `wait`), pontua e executa a de maior score; cada tipo só uma vez por unidade; para se todos os scores ≤ 0.
- `evaluateAttack`: 1000 se mata (estimativa `ATK−DEF+6`), senão dano×3 + HP perdido do alvo. +60 para unidades de alcance.
- `evaluateCriticalAttack`: 1200 só se o crítico mata e o normal não.
- `evaluateMove`: aproxima do inimigo mais próximo, +200 se puder atacar de lá. `flee` quando HP < 20% e em desvantagem numérica.
- Velocidade das animações da IA: `ENEMY_SPEED` em `config.ts`.

## UI (Lit)

UI de partida = `GameUI` ([src/game-ui.ts](src/game-ui.ts)) + componentes em `src/ui-components/`. Estilo: painéis pixel-art escuros, borda clara grossa e sombra preta dura (mesma linguagem da tela inicial).
- Tudo fica dentro de um `<div class="game-ui">` fixo sobre o canvas (`pointer-events: none`; só os painéis interativos recebem clique).
- **Escala** (definida em `theme.ts`): `--u` = `--s` × `--ui-scale` (tamanhos de layout) e `--t` = `--u` × `--text-scale` (**todo `font-size` usa `--t`**). Escreva `calc(N * var(--u))` / `calc(N * var(--t))` com N em pixels a 1920×1080; não use px fixos.
  - `--s` (pixels de página por pixel de mundo): `GameUI.updateScale()` na partida, `min(largura/1920, altura/1080)` nos menus.
  - Partida: `UI_SCALE = 1.3` e `TEXT_SCALE = 1.1` em `game-ui.ts` (painéis 30% maiores, texto ~43%). Menus: só `MENU_TEXT_SCALE = 1.3` em `start-screen-ui.ts` (o layout já ocupa a tela). Para deixar tudo maior/menor, mude essas constantes.
  - Tamanho mínimo de texto: 14 (12–13 só em rótulos dentro de caixinhas de atributo).
- **Fluxo de dados:** os componentes são "burros" e recebem view-models (`view-models.ts`). O `GameUI` monta esses dados a partir do estado do jogo no `pointermove` e a cada 150 ms (`refresh`). Para mostrar algo novo, adicione ao view-model e calcule no `GameUI`.
- `game-hud`: times (unidades vivas, HP total), rodada/fase e **End turn** (pede confirmação quando ainda há unidades com ações) → evento `end-turn` → `HumanPlayer.endTurn()`.
- `game-hint`: dica contextual embaixo (`[texto]` sai destacado).
- `unit-card`: unidade sob o mouse (ou a selecionada), no topo, logo abaixo da barra do time da própria unidade (azul à esquerda, vermelho à direita), com a mesma largura e margem. Se nessa posição ele cobriria a unidade sob o mouse, desce para logo abaixo dela (`GameUI.cardTopAvoiding`). Em modo ataque, sobre um inimigo ao alcance, vira a **prévia de combate** (`forecastAttack`), sob a barra do time de quem ataca.
- `unit-menu`: ancorado ao lado da unidade (vira para o outro lado se não couber). Itens: Move, Attack, Skills (submenu com custo e descrição), Wait. Evento `select` (id) / `close`.
- `phase-banner`: `play()` devolve Promise; clique ou Esc pula. `game-over`: `show()` devolve `'rematch' | 'menu'`.
- Contagem de unidades da UI usa `Board.getLivingUnits()` (atores vivos na cena), porque `getUnits()` não vê a unidade enquanto ela anda.
- **Menus** (`start-screen-ui`): mesmo tema e unidade `--u` da UI de partida (ela calcula `--s` = `min(largura/1920, altura/1080)`). Telas: `title` → `mode` → `map` (`<map-select>`), e `howto`/`units`/`credits` (templates em `start-screen-pages.ts`). Esc volta. Toca `TitleMusic` enquanto montada. Montada pelo `main.ts` e pelo `TurnManager.returnToMainMenu`.
- `map-select` recebe `MapListItem[]` (montados de `MAPS` + `getMapInfo` + `mapPreview`) e emite `start` (id ou `'random'`) e `back`. ↑/↓/Enter/Esc.
- `<audio-menu>` fica fixo no `index.html`.
- Fonte do jogo: `notjamslab14` (`@font-face` em `main.css`, vale dentro do shadow DOM).
- Controles: esquerdo = selecionar/agir; direito = ver alcance de movimento; meio = ver alcance de ataque; **Esc** = fecha o menu / cancela o modo mover/atacar (devolve MP de skill) / pula o banner.

## Celular e toque

- Detecção: `isTouchDevice()` = `(pointer: coarse)`. `setupTouchDevice()` (no `main.ts`) põe a classe `touch` no `<html>` e pede tela cheia + trava em paisagem no primeiro toque (não funciona no iPhone; falhas são ignoradas).
- No toque o engine usa `DisplayMode.FitScreen` (no desktop continua `FitScreenAndFill`): com o aparelho de pé o `FitScreenAndFill` esticava a resolução para 1920×4155, acima do limite de textura WebGL. O canvas é centralizado por CSS (`html.touch body` em `main.css`); a Excalibur converte coordenadas com `getBoundingClientRect`, então isso é seguro.
- De pé (`pointer: coarse` + `orientation: portrait`) aparece o `.rotate-hint` do `index.html` por cima de tudo.
- O toque chega como `PointerEvent` com `pointerType = Touch` e botão esquerdo. Não há hover: o `GameUI` também atualiza `hovered` no `down`, e o `HumanPlayer` usa **toque para prévia, segundo toque no mesmo tile para confirmar** (`pendingTarget`, `isValidTarget`). Toque fora do alcance cancela, como no desktop.
- Sem botão direito/meio: clicar/tocar num inimigo ou numa unidade sem ações mostra o alcance de movimento; de novo, o de ataque (`inspectUnit`, vale também no mouse).
- **Clique fantasma**: depois de um toque o navegador manda um `click` ao elemento que estiver sob o dedo, mesmo que ele tenha acabado de aparecer. Por isso o overlay do `unit-menu` fecha no `pointerdown`, os itens do menu ignoram cliques nos primeiros 350 ms (`GHOST_CLICK_MS`) e o `main.ts` bloqueia a tela inicial por 400 ms (o loader da Excalibur começa no `pointerup`). UI nova que abre em resposta a um toque no canvas precisa do mesmo cuidado.
- Escala: `readableBoost` aumenta `--ui-scale` na partida (até 1,6×) e `--text-scale` nos menus (até 1,4×, `MENU_MAX_TEXT_BOOST`) quando 1 `--u` daria menos de 0,68 px de página. No desktop fica 1.
- No toque, o `unit-card` vai para a metade da tela oposta ao tile tocado (no desktop fica no lado do time) e o tile tocado é esquecido a cada fase. As dicas falam em "tap"; dicas só de teclado usam a classe `keys-only` (escondida com `hover: none` + `pointer: coarse`, em `theme.ts`).
- Teste: Chrome headless com `Emulation.setDeviceMetricsOverride` (mobile, paisagem), `Emulation.setTouchEmulationEnabled` e `Input.dispatchTouchEvent`.

## Cuidados ao mexer

- Melhorias e bugs conhecidos estão em [CHECKLIST.md](CHECKLIST.md); análise e melhorias da IA em [CHECKLIST-IA.md](CHECKLIST-IA.md). Ao concluir um item, marcar `[x]`.

- Ao alterar regras de jogo, atualizar também o **README.md** (está em português e documenta regras e stats).
- Mudanças de regra de alcance/movimento quase sempre afetam `HumanPlayer`, `SelectionManager` e `ComputerPlayer` juntos.
- `LevelBase` recria board, players, `GameUI` e managers a cada ativação. Tudo que registra listener no engine ou no `window` precisa ser desfeito no `onDeactivate` (`GameUI.destroy`, `Player.dispose`), senão acumula entre partidas.
- `UNIT_CONFIG` é copiado raso por unidade (`{ ...UNIT_CONFIG[t] }`) — não mutar objetos aninhados (graphics, skill).
- O loader da Excalibur deixa um listener de `keyup` Enter no `body` que recria o botão "PLAY!" depois do carregamento. O `main.ts` troca `loader.startButtonFactory` por um botão invisível após o `game.start`; não remova isso (o seletor de mapas usa Enter).
- Teste automatizado no Chrome headless: emular foco (`Emulation.setFocusEmulationEnabled`) e usar polling por intervalo, senão o loop da Excalibur fica estrangulado e as animações parecem travadas.
- Validar mudanças com `npx tsc --noEmit` e `npx eslint src`, e testar no navegador com `yarn dev`.
