# PixelFantasyWar — Guia de referência do projeto

Jogo de estratégia tática por turnos (estilo Fire Emblem / FFT) que roda no navegador.
Deploy: GitHub Pages servindo a pasta `docs/` → https://jeanomeg.github.io/pixelwar/

## Stack

- **TypeScript** (strict, `experimentalDecorators`, `noUnusedLocals`/`noUnusedParameters`).
- **Vitest** (testes em `tests/`; os que precisam da engine usam `happy-dom`).
- **Excalibur.js 0.30.x** (engine 2D) + **@excaliburjs/plugin-tiled 0.30.2** (mapas `.tmx`).
- **Lit 3** para UI em HTML sobre o canvas (Web Components).
- **Parcel 2.11** como bundler. Assets (`png, wav, mp3, tmx, tsx, ttf`) usam `transformer-raw` (`.parcelrc`) e são importados como URL (tipos em `src/files.d.ts`).
- Gerenciador de pacotes: **yarn** (`yarn.lock`; `build.js` chama `yarn`).

## Comandos

```
yarn dev            # parcel serve index.html
yarn build:parcel   # build em ./docs (public-url ./)
yarn build          # node build.js: apaga .parcel-cache/docs/dist, builda, faz `git add .` e commit "- Build deploy"
yarn validate       # typecheck + lint + test (não use "yarn check": é um comando do próprio yarn)
yarn typecheck      # tsc --noEmit
yarn lint           # eslint src tests scripts vitest.config.ts
yarn test           # vitest run
yarn balance        # tabela de custos das classes (scripts/balance-report.ts)
yarn ai:sim         # partidas CPU × CPU sem gráficos: IA nova × antiga e entre níveis (SIM_GAMES=n)
yarn ai:tune        # variações de pesos da IA contra a base
yarn ai:stall       # CPU × CPU do mesmo nível: empates, sequências sem ataque, turnos em porta, fim de partida
```

⚠️ `yarn build` **faz commit automaticamente** de tudo que estiver no working tree. Não rodar sem o usuário pedir.
⚠️ `docs/` é saída de build (com hashes). Nunca editar à mão.
⚠️ Se o `yarn dev` cair com `ENOENT ... dist/*.js`, apague `dist/` e `.parcel-cache/` e rode de novo.

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
| [src/unit-types.ts](src/unit-types.ts) | **Lista de classes** `UNIT_CLASSES`, `UnitClass`, `UnitType` (`<Classe><A|B>`), `UNIT_TYPES`, `unitClassOf`, `unitTypeOf`. Puro (sem assets) |
| [src/class-stats.ts](src/class-stats.ts) | `CLASS_STATS`: HP/ATK/DEF/alcance/movimento de cada classe (os dois times). Puro |
| [src/skills.ts](src/skills.ts) | `SKILLS` (definição de todas as skills), `CLASS_SKILL` (a skill própria de cada classe), `skillsOf` e as constantes dos efeitos. Puro |
| [src/unit-classes.ts](src/unit-classes.ts) | `CLASS_INFO` (papel, descrição, **custo**), `ARMY_BUDGET`, `armyCost`, traços (`classTraits`) e `rangeNote` (alcance em tiles); usado nas telas Units e de exército |
| [src/balance.ts](src/balance.ts) | Fórmula dos custos (`computeCosts`, `classPower`). Um teste garante que `CLASS_INFO` bate com ela |
| [src/army-ai.ts](src/army-ai.ts) | `buildCpuArmy`: exército da CPU por papel (de longe, alcance 2, flanco, corpo a corpo, pesado) dentro do orçamento; `roleOf` (usado também pela IA de partida) |
| [src/ai/](src/ai/) | IA de partida: pesos/dificuldades, mapa de ameaça, planejador e turno (ver seção "IA") |
| [src/speed.ts](src/speed.ts) | Velocidade do jogo (x1/x2/x3, salva): `engine.timescale` e `gameDelay(ms)` (use no lugar de `ex.Util.delay` em pausas da partida) |
| [src/loader.ts](src/loader.ts) | Tela de carregamento (logo, botão PLAY!) e registro de todos os `Resources` |
| [src/resources.ts](src/resources.ts) | Todos os assets (`Resources`), cursores/destaques, `buildUnitAnimations` e `UNIT_ANIMATIONS` (as 12 animações de cada `UnitType`, geradas da grade da spritesheet) |
| [src/config.ts](src/config.ts) | `SCALE` (2x), `SCALE_UNIT`, `UNIT_OFFSET`, `ENEMY_SPEED`, `STARTING_MP` e **`UNIT_CONFIG`** (gerado: stats de `CLASS_STATS` + animações + skills de cada `UnitType`) |
| [src/levels/level-base.ts](src/levels/level-base.ts) | `LevelBase` (ex.Scene, uma por mapa): no `onActivate` lê o modo de `context.data` (`MatchSettings`), limpa a cena, monta o tabuleiro, cria jogadores, posiciona unidades (spawns de `getMapInfo`) e inicia o `TurnManager` |
| [src/board.ts](src/board.ts) | Grade de `Cell`s, conversão world→cell, `getUnits()`, instancia `PathFinder` |
| [src/cell.ts](src/cell.ts) | Actor de cada tile; guarda `unit`, `pathNode`, o highlight (`decoration`: `range`/`path`/`attack`) e o cursor (ator **separado**, para mover o cursor não apagar destaques) |
| [src/unit.ts](src/unit.ts) | Actor da unidade: estado do turno, movimento animado, **skills** (`canUseSkill`, `startSkill`, `settlePendingSkill`, `useSkillOn`), stats efetivos (`combatStats`: buffs + floresta), ataque + **contra-ataque**, desfazer movimento, barra de HP no mapa, morte (uma vez) |
| [src/combat.ts](src/combat.ts) | **Regras de combate puras** (sem engine): `resolveAttack`, `forecastAttack` (probabilidades exatas), `facingBetween`, `rollWithAdvantage` |
| [src/player.ts](src/player.ts) | Classe abstrata. Cada jogador recebe um **bitmask** (`mask`) usado no pathfinding; `Player.resetMasks()` a cada level |
| [src/human-player.ts](src/human-player.ts) | Input (mouse, toque e **teclado**, todos por `act(cell, button)`), callbacks do menu de unidade, modo de alvo de skill; turno aguarda `ex.Future` (`humanMove`) |
| [src/computer-player.ts](src/computer-player.ts) | Jogador CPU: executa com animação os planos de `src/ai/` (dificuldade e personalidade) |
| [src/turn-manager.ts](src/turn-manager.ts) | Loop de fases, resultado (vitória/empate), tela de fim, revanche e volta ao menu |
| [src/selection-manager.ts](src/selection-manager.ts) | Unidade selecionada, modo `move`/`attack`/`heal`, ranges, caminho, highlights e cursor |
| [src/path-finding/](src/path-finding/) | `PathNodeComponent` (flags do tile, mask, x/y), `PathFinder` (Dijkstra de movimento → `MovementMap`, alcance de ataque em linha reta) e `terrain-rules.ts` (regras por classe) |
| [src/camera-controller.ts](src/camera-controller.ts) | **Zoom do mapa** (`CameraController`, um por partida): roda do mouse (suave, ~8% por clique, rumo ao cursor), pinça e arrastar no toque; câmera nunca sai do mapa; `onTap` (toque vale ao soltar), `onChange`, `worldToPage` (sem atraso de quadro), `ensureVisible`. Limites e matemática pura em [src/camera-math.ts](src/camera-math.ts) (`MIN_ZOOM` 1 = padrão, `MAX_ZOOM` 2) |
| [src/game-ui.ts](src/game-ui.ts) | `GameUI`: controlador da UI de partida (HUD, dica, card/prévia, menu, banner, fim). Criado por partida e destruído no `onDeactivate` |
| [src/ui-components/](src/ui-components/) | Lit (shadow DOM). Partida: `game-hud` (+ `game-hint`), `unit-card`, `unit-menu`, `phase-banner`, `game-over`, `pause-menu`. Menus: `start-screen-ui` (título, modo, páginas), `map-select`, `army-select`, `start-screen-pages.ts` (How to play, Units, Credits), `class-details.ts` (`renderClassDetails`: tudo sobre uma classe, usado na tela Units e na de exército). `audio-menu`. Base visual em `theme.ts` e `icons.ts`; dados em `view-models.ts` |
| [src/damage-manager.ts](src/damage-manager.ts) | Texto flutuante: dano (`Critical!`, `Back attack!`, `Miss`, `Counter!`), efeitos (`+8`, `DEF +3`, `Pinned`) e nome da skill usada (`Guard -2 MP`, via `Unit.announceSkill`) |
| [src/audio-manager.ts](src/audio-manager.ts) | Volumes padrão e mute (lembrado em `localStorage`: `pixelfantasywar.muted`) |
| [src/device.ts](src/device.ts) | Celular/tablet: `isTouchDevice`, `readableBoost` (ampliação da UI em tela pequena), tela cheia + paisagem (`enterFullscreen`/`exitFullscreen`/`toggleFullscreen`, `setupTouchDevice` no primeiro toque) |
| [src/css/main.css](src/css/main.css) | Só a fonte global e `.credits` (a UI de jogo tem estilos próprios nos componentes) |

Testes em [tests/](tests/): `combat`, `balance` (custos = fórmula; exército clássico de cada `.tmx` = 100), `army-ai`, `pathfinding` e `unit-rules` (skills, floresta, contra-ataque). `tests/helpers.ts` monta tabuleiros a partir de mapas ASCII. O `vitest.config.ts` trata `.tmx`/`.tsx`/áudio/fonte como assets, igual ao `transformer-raw` do Parcel.

## Fluxo de jogo

1. `start-screen-ui`: título (Play / How to play / Units / Credits) → modo → `map-select` → `engine.goToScene(sceneNameOf(map), { sceneActivationData: { mode } })`. O último modo, mapa e dificuldade escolhidos ficam em `localStorage` (`pixelfantasywar.mode`, `pixelfantasywar.map`, `pixelfantasywar.difficulty`) só para pré-selecionar; a partida recebe tudo em `MatchSettings` (`mode`, `armies`, `difficulty`).
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
O nome do actor é o `UnitType`; regras por classe removem o sufixo com `unitClassOf` (`unit-types.ts`).

Spritesheets em `src/assets/minis/<Classe><A|B>.png`: grade 4 colunas x 14 linhas de 32x32 (linhas 0–3 lateral, 5–8 de frente, 10–13 de costas; cada bloco = idle/move/attack/death, 4 quadros). Esquerda = lateral com `flipHorizontal`. Todas as 28 variantes usam `buildUnitAnimations(Resources.<Classe><A|B>SpriteSheet)` (`UNIT_ANIMATIONS`). (Antes as originais eram escritas à mão, e o Barbarian vermelho usava a animação lateral ao andar para cima/baixo.)

**Sprites das classes novas** foram derivados das originais (mesmo estilo e animações): troca de paleta + peças desenhadas por quadro acima da cabeça. Paleta comum a todos os minis: contorno `#0a0d2a`, sombra `#000000` (alpha 128), time escuro `#0000c0`/`#a61414`, time claro `#7d7dea`/`#f96363`, branco `#ffffff` (brilho e efeito de golpe), madeira `#684722`/`#bc9148`, pele `#f3cb87`, dourado `#fff000`.
| Nova | Base | Mudança |
|---|---|---|
| Paladin | Fighter (espada) | armadura prata, time mais vivo, elmo de aço, detalhes dourados, penacho, golpe dourado |
| Berserker | Barbarian | pele de pintura de guerra, machado de aço, chifres, golpe laranja |
| Assassin | Thief | roupa bem escura, lâmina e golpe roxos |
| Ranger | Archer | arco/couro verdes, pena, flecha verde |
| Necromancer | Mage | manto escuro, pele pálida, cajado de osso, magia verde |
| Halberdier | Spearman | elmo com crista, haste de aço |

**Adicionar unidade:** spritesheet (as duas cores) → `ImageSource` `<Classe>ASpriteSheet`/`<Classe>BSpriteSheet` em `Resources` → nome em `UNIT_CLASSES` (`unit-types.ts`) → stats em `CLASS_STATS` (`class-stats.ts`) → `TERRAIN_RULES` (`terrain-rules.ts`) → skill própria em `SKILLS`/`CLASS_SKILL` (`skills.ts`, ver "Adicionar skill") → `CLASS_INFO` (papel, descrição, **custo** = o que `yarn balance` mostrar) → papel em `ROLE_CLASSES` (`army-ai.ts`). Animações, `UNIT_CONFIG`, tela de exército e tela Units saem sozinhos. `yarn test` falha se o custo não bater com a fórmula.

| Classe | HP | ATK | DEF | Range | Move | Custo | Skill própria | Terreno |
|---|---|---|---|---|---|---|---|---|
| Archer | 10 | 2 | 2 | 6 | 4 | 10 | Aimed Shot | mira água; alcance cai em floresta/água |
| Mage | 10 | 2 | 2 | 5 | 5 | 9 | Fireball | mira água; alcance cai em floresta/água |
| Spearman | 10 | 4 | 2 | 2 | 6 | 8 | Pierce | alcance cai em floresta/água |
| Thief | 10 | 5 | 2 | 1 | 6 | 9 | Steal | velocidade total na floresta |
| Fighter | 15 | 4 | 3 | 1 | 6 | 12 | Second Wind | — |
| Cleric | 20 | 3 | 4 | 1 | 6 | 15 | Heal | — |
| Barbarian | 20 | 5 | 4 | 1 | 4 | 16 | Rage | — |
| Warrior | 25 | 4 | 5 | 1 | 4 | 21 | Guard | — |
| Paladin | 18 | 4 | 4 | 1 | 5 | 15 | Shield Wall | — |
| Berserker | 16 | 7 | 2 | 1 | 5 | 15 | Frenzy | — |
| Assassin | 8 | 6 | 1 | 1 | 7 | 8 | Backstab | velocidade total na floresta |
| Ranger | 10 | 3 | 2 | 5 | 5 | 12 | Pinning Shot | velocidade total na floresta; mira água; alcance cai em floresta/água |
| Necromancer | 8 | 4 | 2 | 4 | 4 | 8 | Drain | mira água; alcance cai em floresta/água |
| Halberdier | 14 | 4 | 3 | 2 | 4 | 12 | Brace | alcance 2 em qualquer terreno |

Todas têm `STARTING_MP` (4), Run, Special e a skill própria. As de alcance 1 contra-atacam. O Barbarian B tinha ATK 6 (o A tinha 5); foi igualado em 5 para os exércitos por pontos serem justos.

### Balanceamento

O custo de cada classe sai da matemática real de combate (`forecastAttack`, probabilidades exatas com vantagem). Fórmula em [src/balance.ts](src/balance.ts) (`computeCosts`); `yarn balance` imprime a tabela e um teste exige que `CLASS_INFO` bata com ela:
- **ataque** = dano médio esperado contra as 14 classes (alvo na floresta, +2 DEF, em 35% dos casos) **+**, para classes corpo a corpo, o contra-ataque que causam quando um corpo a corpo as ataca;
- **resistência** = HP ÷ (dano médio recebido das 14 classes **+**, para corpo a corpo, o contra-ataque que levam ao atacar um corpo a corpo);
- **ameaça** = movimento + alcance efetivos, supondo 35% de floresta (quem paga 2 lá perde metade disso);
- **poder** = ataque × resistência × ameaça/6 × (1 + 0,12 por tile de alcance efetivo além de 1).
O custo é o poder escalado para que as 8 originais somem **100** (= `ARMY_BUDGET`; arredondamento pelo maior resto). Assim o exército desenhado nos mapas custa exatamente o orçamento (um teste lê os `.tmx`). As skills próprias ficam fora da conta: toda classe tem uma, paga com os mesmos 4 MP. Sem contra-ataque e floresta (`computeCosts({ counterattack: false, forest: false })`) a fórmula devolve os custos antigos; com eles, Archer, Berserker e Halberdier subiram 1 e o Cleric caiu 1. Faixa de poder relativo: 0,63–1,67.

### Escolha de exército

Antes da partida, cada humano monta o exército na tela `<army-select>` (após o seletor de mapas; **sempre dois passos, Azul e depois Vermelho, em todos os modos**, inclusive CPU). Nos times da CPU a tela abre com uma sugestão de `buildCpuArmy` (sorteada uma vez por mapa em `chooseMap`, `cpuSuggestions`) e o botão **Random** (`randomize`) sorteia outra; o jogador pode editar a lista da CPU.
- Os **slots** são os spawns do time no `.tmx`, na ordem dos objetos (`teamSpawns`). O jogador escolhe a classe de cada slot; posição continua a do mapa.
- Orçamento `ARMY_BUDGET` (100). "Classic army" = exército desenhado no mapa (`defaultArmy`). Último exército usado por mapa/time fica em `localStorage` (`pixelfantasywar.army.<mapId>.<time>`).
- O resultado vai em `MatchSettings.armies` (`[azul, vermelho]`, `null` = do mapa) e a `LevelBase` aplica com `spawnsWithArmies`. "Play again" reaproveita os mesmos exércitos.

## Regras de combate (`src/combat.ts`, usado por `Unit.attack`)

- d20 e d6 rolados **sempre com vantagem** (`rollWithAdvantage`: maior de 2).
- Acerta se `ATK + d20 > DEF + 10`, ou crítico, ou ataque pelas costas.
- Crítico: `d20 === 20` ou `forcesCritical` → dano `12 + ATK − DEF`.
- Pelas costas: direção do atacante até o alvo (`facingBetween`) igual a `alvo.miniDirection` (`Unit.isBehind`) → `d6 + 2·ATK − DEF`.
- Normal: `d6 + ATK − DEF`.
- Dano mínimo 1. **Errar também causa 1 de dano** (`MISS_DAMAGE`, documentado no README).
- Modificadores de skill em `AttackContext`: `guaranteedHit` (Aimed Shot), `ignoreDefense` (Pierce), `bonusDamage` (Rage, só se acertar). Backstab liga `backAttack`; Special, `forcesCritical`.
- **Floresta**: quem está num tile de floresta (andável, não rápido, não porta) tem `+FOREST_DEFENSE` (2). Aplicado em `Unit.combatStats()`, junto com os buffs de skill; passe sempre `combatStats()` (e não `unitConfig`) para `resolveAttack`/`forecastAttack`.
- **Contra-ataque** (`Unit.attack` → `canCounter`): o defensor que sobrevive revida uma vez com `PLAIN_ATTACK` e se vira para o atacante, se `counterReach()` > 0 (1 para alcance 1; 2 com Brace) e o atacante estiver na linha de ataque dele. Nunca depois de um ataque pelas costas.
- `forecastAttack` enumera todas as combinações d20×d6 com vantagem e devolve chance de acerto, de crítico, faixa de dano, dano médio e chance de matar. A prévia da UI (inclusive do contra-ataque) e a IA usam isso. Mudou a regra? Mude **só** `resolveAttack`.
- Ataque em duas partes: `Unit.resolveAttackOn` rola os dados e devolve os `AttackEvent`s (golpe, efeitos de skill, contra-ataque) sem mudar nada; `applyAttackEvent` aplica um. `Unit.attack` anima evento por evento; `attackInstant`/`moveInstant` aplicam tudo na hora (simulação e testes).
- Morte: `onPostUpdate` chama `die()` quando `health <= 0`, que roda só uma vez (flag `dying`). `Board.getUnits()` já ignora unidades com HP ≤ 0, e elas não podem agir nem ser selecionadas.

## Movimento e alcance (`PathFinder`)

- Vizinhança ortogonal (4 direções). Custo por tile: `isfast` = 1, normal (floresta, tiles 50–79 do tileset) = 2, porta = 2. **Thief/Assassin/Ranger** pagam 1 em qualquer tile que não seja porta.
- Regras por classe (Thief ignora terreno lento, quem paga 2 de alcance em terreno lento, quem mira água) ficam em [src/path-finding/terrain-rules.ts](src/path-finding/terrain-rules.ts) (`TERRAIN_RULES`). Esse módulo não importa assets, para poder ser testado fora do navegador.
- `getMovementMap(start, mask, budget, unitName)` → `MovementMap`: Dijkstra sobre estados (nó, direção) com prioridade `custo·1000 + curvas`, então o caminho é sempre o mais barato e, no empate, o com menos curvas. `range` = nós onde a unidade pode **parar** (a própria célula + tiles vazios); `pathTo(node)` devolve `[start..node]` ou `[]`; `costTo(node)`. `getRange`/`findPath` são atalhos para ele. Use um único `MovementMap` quando precisar de vários caminhos (a IA faz isso).
- Passagem: tile `isWalkable` cujo `walkableMask & player.mask` ≠ 0. Tile com unidade tem `walkableMask = mask do dono` → aliados passam (mas não dá para parar neles), inimigos bloqueiam. `PathNodeComponent.isOccupied` = `walkableMask !== -1`.
- `getRangeAttack(start, ~player.mask, range, unitName, ignore?)`: anda em linha reta nas 4 direções; para em tile não `isAttackable`, em porta, quando acaba o alcance, ou na primeira unidade (inimigo entra no resultado, aliado não). Não inclui a célula de origem. Água só é alvo para quem tem `targetsWater` (Archer, Mage, Ranger, Necromancer). Quem tem `slowTerrainCostsRange` (Archer, Mage, Spearman, Ranger, Necromancer) paga 2 em tile não-rápido (floresta e água); demais pagam 1. Unidade parada em porta não ataca. `ignore` trata um nó como vazio (a IA usa para avaliar ataque a partir de outra célula, sem que a própria unidade bloqueie a linha).
- `PathNodeComponent` guarda `x`/`y` da grade; não depende mais do nome da cell.
- No mapa: `#` (parede/árvore) = não andável e não atacável; água = não andável, mas atacável (ataque passa por cima); porta = andável (custo 2) e não atacável.

## Turno e skills

Flags da unidade: `moved`, `attacked`, `passed`, `usedSkill`, `pendingSkill` (skill de movimento/ataque paga e ainda não usada; `isRunning`/`forcesCritical` são getters dela), `attackBonus`/`defenseBonus`, `braced`, `pinned`. `reset()` no início do turno do dono limpa tudo isso (efeitos "até o próximo turno"); `pinned` vira `moved = true` nesse turno. Unidade sem ações fica com tint cinza.

- **O turno termina sozinho** quando nenhuma unidade pode mover nem atacar (`hasActions`). Skills que não precisam de movimento/ataque e o "Undo move" só servem antes disso; o menu ainda abre para unidades assim (`canBeSelected`).
- **Desfazer movimento**: `Unit.move` guarda `previousMove`; `canUndoMove()` enquanto não atacou e a célula antiga está livre; `undoMove()` volta a posição e a direção e devolve o MP do Run.

Skills ([src/skills.ts](src/skills.ts)): toda classe tem Run, Special e uma própria (`CLASS_SKILL`). `kind`:
- `move` (Run) / `attack` (Special, Aimed Shot, Fireball, Pierce, Steal, Rage, Backstab, Pinning Shot, Drain): `startSkill` cobra o MP e guarda em `pendingSkill`; vale para o próximo movimento/ataque. `settlePendingSkill()` (chamado depois de mover/atacar, ao cancelar com Esc e ao encerrar o turno) devolve o MP se não foi usada. `attackContext()` traduz a skill pendente para o `AttackContext`; os efeitos depois do golpe (Steal, Drain, Pinning Shot, Fireball) ficam em `Unit.attack`.
- `self` (Second Wind, Guard, Shield Wall, Frenzy, Brace): efeito imediato em `applySelfSkill`.
- `ally` (Heal): o humano entra no modo `heal` da `SelectionManager` e escolhe o alvo; `useSkillOn` cobra e aplica. Alvos: `healTargets()`.
- 1 skill por turno; MP não regenera. Regras em `Unit.canUseSkill` (a classe precisa ter a skill).
- **Aviso de skill**: `Unit.announceSkill` mostra "Nome -N MP" sobre quem usou, só quando a skill acontece de fato: self ao usar (`startSkill`), Heal ao curar (`useSkillOn`), Run quando o movimento começa (`move`), skills de ataque quando o ataque sai (`attack`, com 350 ms antes do golpe). Escolher e cancelar não mostra nada. Vale para humano e CPU. Fica um pouco acima do texto do efeito; o `unit-card` desvia desse espaço (`FLOATING_TEXT_TILES`).

**Adicionar skill:** entrada em `SKILLS` (+ `CLASS_SKILL` se for de uma classe) → condição em `Unit.canUseSkill` (pelo `kind`) → efeito: `attackContext`/`attack` (ataque), `applySelfSkill` (self) ou `useSkillOn` (aliado) → IA: efeito em `scoreAttack` (skills de ataque, `src/ai/planner.ts`) ou `useEndOfTurnSkill` (self/aliado, `src/ai/turn.ts`) → teste em `tests/unit-rules.test.ts`. Menu, card e tela Units saem sozinhos.

## IA ([src/ai/](src/ai/))

Detalhes, diagnóstico e números em [CHECKLIST-IA.md](CHECKLIST-IA.md). Resumo:
- [weights.ts](src/ai/weights.ts): **todos os números** — `AI_WEIGHTS` (escala: unidade vale custo × `VALUE_PER_POINT`), `DIFFICULTIES` (Easy/Normal/Hard: ruído, erro, uso de skill, peso da ameaça, pesos próprios do Hard) e `PERSONALITIES`.
- [threat.ts](src/ai/threat.ts): `ThreatMap` — quais inimigos atacam cada tile no próximo turno (movimento + ataque em linha pelas regras reais), `harmAt` (dano esperado dos 3 mais fortes, chance de morrer, ataque pelas costas se o inimigo chega atrás).
- [planner.ts](src/ai/planner.ts): `planUnit` gera e pontua o turno inteiro de uma unidade (destino parado/andando/correndo × atacar antes ou depois de mover × skill), com `scoreAttack` (forecast, costas, contra-ataque, efeitos de skill, MP) e `scorePosition` (ameaça, distância por caminho até um tile **de onde dá para atacar** `distanceToEnemies` — inimigos bloqueiam, porta tampada obriga a dar a volta —, linha de tiro de aliado, suporte, porta). `aggressionOf`: vantagem de exército e rodada deixam a IA mais ousada; com 1–2 unidades e atrás, "última resistência" (não foge). Nada aqui muda o jogo.
- [turn.ts](src/ai/turn.ts): `playAiTurn` — a cada passo age a unidade que mais ganha agindo agora; `executePlan` via `AiExecutor` (animado no `ComputerPlayer`, instantâneo na simulação); `useEndOfTurnSkill`; log com `localStorage.debugAI = '1'`.
- [computer-player.ts](src/computer-player.ts): só o executor animado (destaques + `gameDelay`), dificuldade (de `MatchSettings.difficulty`) e personalidade (sorteada).
- Simulação: `yarn ai:sim` (IA nova × antiga e entre níveis, `SIM_GAMES`), `yarn ai:tune` (variações de peso). Em [tests/sim/](tests/sim/): `map-loader.ts` lê os `.tmx` (reaproveita um `Board` por mapa: atores da engine não são liberados), `legacy-ai.ts` é a IA antiga, `match.ts` joga uma partida com `Unit.moveInstant`/`attackInstant`.
- Mudou uma regra que a IA precisa entender? Ajuste `scoreAttack`/`scorePosition`/`ThreatMap`, rode `yarn test` (tests/ai.test.ts) e `yarn ai:sim`.
- Pausas da IA: `ENEMY_SPEED` em `config.ts`, divididas pela velocidade do jogo (`gameDelay`).

## UI (Lit)

UI de partida = `GameUI` ([src/game-ui.ts](src/game-ui.ts)) + componentes em `src/ui-components/`. Estilo: painéis pixel-art escuros, borda clara grossa e sombra preta dura (mesma linguagem da tela inicial).
- Tudo fica dentro de um `<div class="game-ui">` fixo sobre o canvas (`pointer-events: none`; só os painéis interativos recebem clique).
- **Escala** (definida em `theme.ts`): `--u` = `--s` × `--ui-scale` (tamanhos de layout) e `--t` = `--u` × `--text-scale` (**todo `font-size` usa `--t`**). Escreva `calc(N * var(--u))` / `calc(N * var(--t))` com N em pixels a 1920×1080; não use px fixos.
  - `--s` (pixels de página por pixel de mundo): `GameUI.updateScale()` na partida, `min(largura/1920, altura/1080)` nos menus.
  - Partida: `UI_SCALE = 1.3` e `TEXT_SCALE = 1.1` em `game-ui.ts` (painéis 30% maiores, texto ~43%). Menus: só `MENU_TEXT_SCALE = 1.3` em `start-screen-ui.ts` (o layout já ocupa a tela). Para deixar tudo maior/menor, mude essas constantes.
  - Tamanho mínimo de texto: 14 (12–13 só em rótulos dentro de caixinhas de atributo).
- **Fluxo de dados:** os componentes são "burros" e recebem view-models (`view-models.ts`). O `GameUI` monta esses dados a partir do estado do jogo no `pointermove` e a cada 150 ms (`refresh`). Para mostrar algo novo, adicione ao view-model e calcule no `GameUI`.
- `game-hud`: times (unidades vivas, HP total), pausa, velocidade (evento `speed` → `cycleSpeed`), rodada/fase e **End turn** (pede confirmação quando ainda há unidades com ações; `requestEndTurn()` é o mesmo pelo teclado) → evento `end-turn` → `HumanPlayer.endTurn()`.
- `game-hint`: dica contextual embaixo (`[texto]` sai destacado).
- `unit-card`: unidade sob o mouse (ou a selecionada), no topo, logo abaixo da barra do time da própria unidade (azul à esquerda, vermelho à direita), com a mesma largura e margem. Se nessa posição ele cobriria a unidade sob o mouse, desce para logo abaixo dela (`GameUI.cardTopAvoiding`). Mostra ATK/DEF efetivos (verde acima da base, vermelho abaixo), o alcance em tiles (`rangeNote`) e o estado (skill pronta, floresta, Braced, Pinned). Em modo ataque, sobre um inimigo ao alcance, vira a **prévia de combate** (`forecastAttack`, com `combatStats` e `attackContext`), sob a barra do time de quem ataca, e mostra o contra-ataque que vem se o alvo sobreviver (`ForecastView.counter`).
- `unit-menu`: ancorado ao lado da unidade (vira para o outro lado se não couber). Itens: Move, Attack, Skills (submenu com custo e descrição), Undo move (se der), Wait. Evento `select` (id) / `close`. Teclado: o foco vai para o primeiro item ativo; ↑/↓ navegam, →/← abrem/fecham as skills, Enter escolhe.
- **Pausa**: botão no painel central do `game-hud` (evento `pause`, `HudView.canPause`) ou Esc sem nada para cancelar → `GameUI.pause()`: `engine.clock.stop()` congela o loop (animações, movimento e as ações da CPU esperam), pausa os `ex.Sound` que estavam tocando e abre o `pause-menu` (`show()` → `'resume' | 'quit'`; Esc = Resume; "Main menu" pede um segundo clique). Ao retomar: `engine.clock.start()` e `play()` nesses sons. **Não usar `engine.stop()`/`engine.start()`**: o evento `stop` faz todo `ex.Sound` parar e se recusar a tocar até um evento `start` (o jogo ficava mudo), e `engine.start()` rodaria o loader de novo. "Quit" → `GameUI.onQuit` → `TurnManager.quit()`: marca `aborted` (o loop de fases sai no próximo passo), para a música e chama `returnToMainMenu()`. `Player.disposed` faz a CPU parar de agir depois que a cena sai.
- `phase-banner`: `play()` devolve Promise; clique ou Esc pula. `game-over`: `show()` devolve `'rematch' | 'menu'`.
- Contagem de unidades da UI usa `Board.getLivingUnits()` (atores vivos na cena), porque `getUnits()` não vê a unidade enquanto ela anda.
- **Menus** (`start-screen-ui`): mesmo tema e unidade `--u` da UI de partida (ela calcula `--s` = `min(largura/1920, altura/1080)`). Telas: `title` → `mode` → `map` (`<map-select>`), e `howto`/`units`/`credits` (templates em `start-screen-pages.ts`). Esc volta. Toca `TitleMusic` enquanto montada. Montada pelo `main.ts` e pelo `TurnManager.returnToMainMenu`.
- `map-select` recebe `MapListItem[]` (montados de `MAPS` + `getMapInfo` + `mapPreview`) e emite `start` (id ou `'random'`) e `back`. ↑/↓/Enter/Esc.
- `<audio-menu>` fica fixo no `index.html` (botões de som e de tela cheia).
- Fonte do jogo: `notjamslab14` (`@font-face` em `main.css`, vale dentro do shadow DOM).
- Controles: esquerdo = selecionar/agir; direito = ver alcance de movimento; meio = ver alcance de ataque; **Esc** = fecha o menu / cancela o modo mover/atacar (devolve MP de skill) / pula o banner / pausa (sem nada para cancelar) / retoma.
- Teclado (`HumanPlayer.handleKey`, ignorado enquanto `GameUI.isBlockingInput()`): setas/WASD movem o cursor (`GameUI.setHovered` mostra o card), Enter/Espaço = clique esquerdo (`act`), Tab/Shift+Tab = próxima unidade que pode agir, R/F = alcance de movimento/ataque. No `GameUI`: E = End turn, P = pausa. Sem cursor no mapa, a primeira tecla vai para uma unidade.
- **Olho** (`GameUI.setupEyeButton` / `toggleOverlays`, tecla H): botão fixo acima do `<audio-menu>` (mesmo estilo, só existe na partida). Esconde `game-hud`, `game-hint` e `unit-card` (`style.display`, porque o `:host` dos componentes define `display`). Nunca esconde o `unit-menu`, o banner nem os diálogos; ele vem antes deles no DOM, então os overlays abertos o cobrem. Volta a aparecer a cada partida.
- Barra de HP no mapa: ator próprio de cada `Unit` (`hpBar`, adicionado à cena no `onInitialize`), redesenhado só quando o HP muda.

## Celular e toque

- Detecção: `isTouchDevice()` = `(pointer: coarse)`. `setupTouchDevice()` (no `main.ts`) põe a classe `touch` no `<html>`, e liga o `keepScreenFitted`. **Tela cheia nunca é automática**: só o jogador decide, pelo botão de tela cheia do canto (`<audio-menu>`; entrar também trava em paisagem). O botão só aparece depois do PLAY! do loader (o `main.ts` liga o atributo `fullscreen-ready` ao montar o menu) e daí em diante fica sempre visível. Falhas são ignoradas (iPhone não tem; lá o botão fica escondido).
- `keepScreenFitted` (`device.ts`): o `FitScreen` da Excalibur mede `window.innerWidth/innerHeight` no `resize`, e no Android esse evento chega antes do tamanho final ao entrar/sair da tela cheia e ao girar (o tabuleiro ficava pequeno até sair e entrar na tela cheia de novo). Depois de cada `resize`/`fullscreenchange`/mudança de orientação ele reenvia `resize` em 100, 300, 700 e 1200 ms.
- **Loader e tamanho do canvas**: o loader da Excalibur guarda o tamanho do canvas ao começar (`pushResolutionAndViewport`) e o devolve depois do PLAY! (`popResolutionAndViewport`). Quem abria o jogo de pé e girava na tela de carregamento ficava com o canvas de retrato (tabuleiro pequeno na partida; o menu HTML escondia isso). Por isso o `main.ts` chama `refitScreen()` logo depois do `game.start`. Não remova.
- Botão de tela cheia: no `<audio-menu>` (z-index acima do `.rotate-hint`; aparece a partir do menu principal; no iPhone vira a dica de Tela de Início), ao lado do mute (`toggleFullscreen`; entrar também trava em paisagem, sair destrava). Escondido no app instalado (`isStandalone`). O ícone segue o evento `fullscreenchange`.
- No toque o engine usa `DisplayMode.FitScreen` (no desktop continua `FitScreenAndFill`): com o aparelho de pé o `FitScreenAndFill` esticava a resolução para 1920×4155, acima do limite de textura WebGL. O canvas é centralizado por CSS (`html.touch body` em `main.css`); a Excalibur converte coordenadas com `getBoundingClientRect`, então isso é seguro.
- **Instalar / iPhone**: `manifest.webmanifest` (na raiz, `display: fullscreen`, paisagem, ícones em `src/assets/icons/`) + `apple-touch-icon` e metas `apple-*` no `index.html`. Aberto pelo ícone da Tela de Início (`isStandalone`), o jogo roda sem a barra do navegador e o botão de tela cheia some. No iPhone (sem API de tela cheia, `needsHomeScreenForFullscreen`) o botão abre uma dica: Compartilhar → Adicionar à Tela de Início. O manifesto precisa de `@parcel/transformer-webmanifest` e `@parcel/packager-raw-url` (devDependencies). Ícones gerados a partir dos minis (Warrior azul × Barbarian vermelho).
- De pé (`pointer: coarse` + `orientation: portrait`) aparece o `.rotate-hint` do `index.html` por cima de tudo (menos o `<audio-menu>`, para o botão de tela cheia continuar acessível).
- **Zoom** (`CameraController`): só a câmera muda, então só mapa e unidades aumentam. Na UI, só o `unit-menu` segue o zoom (`--zoom` no elemento, multiplicado no `--u`/`--t` do `.menu`; `GameUI.followCamera` reposiciona o menu). O `--s` do `GameUI.updateScale` é medido em coordenadas de **tela** (`screenToPageCoordinates`), nunca de mundo, senão a HUD inteira cresce com o zoom. Zoom bloqueado com pausa, banner e fim de partida (`GameUI.isModalOpen`).
- O toque chega como `PointerEvent` com `pointerType = Touch` e botão esquerdo. O `HumanPlayer` e o `GameUI` ignoram o `down`/`move` de toque da Excalibur e agem no **tap** do `CameraController` (ao soltar, sem arrastar e sem segundo dedo), para a pinça e o arrasto não selecionarem nada. Não há hover: o `GameUI` atualiza `hovered` no tap, e o `HumanPlayer` usa **toque para prévia, segundo toque no mesmo tile para confirmar** (`pendingTarget`, `isValidTarget`). Toque fora do alcance cancela, como no desktop.
- Sem botão direito/meio: clicar/tocar num inimigo ou numa unidade sem ações mostra o alcance de movimento; de novo, o de ataque (`inspectUnit`, vale também no mouse).
- **Clique fantasma**: depois de um toque o navegador manda um `click` ao elemento que estiver sob o dedo, mesmo que ele tenha acabado de aparecer. Por isso o overlay do `unit-menu` fecha no `pointerdown`, os itens do menu ignoram cliques nos primeiros 350 ms (`GHOST_CLICK_MS`) e o `main.ts` bloqueia a tela inicial por 400 ms (o loader da Excalibur começa no `pointerup`). UI nova que abre em resposta a um toque no canvas precisa do mesmo cuidado.
- Escala: `readableBoost` aumenta `--ui-scale` na partida (até 1,6×) e `--text-scale` nos menus (até 1,4×, `MENU_MAX_TEXT_BOOST`) quando 1 `--u` daria menos de 0,68 px de página. No desktop fica 1.
- No toque, o `unit-card` vai para a metade da tela oposta ao tile tocado (no desktop fica no lado do time) e o tile tocado é esquecido a cada fase. As dicas falam em "tap"; dicas só de teclado usam a classe `keys-only` (escondida com `hover: none` + `pointer: coarse`, em `theme.ts`).
- Teste: Chrome headless com `Emulation.setDeviceMetricsOverride` (mobile, paisagem), `Emulation.setTouchEmulationEnabled` e `Input.dispatchTouchEvent`. Em `yarn dev` o engine fica em `window.__game` (só fora de produção), o que deixa o teste montar cenas (mover unidades, mudar HP) direto pela cena.

## Cuidados ao mexer

- Melhorias e bugs conhecidos estão em [CHECKLIST.md](CHECKLIST.md); análise e melhorias da IA em [CHECKLIST-IA.md](CHECKLIST-IA.md). Ao concluir um item, marcar `[x]`.

- Ao alterar regras de jogo, atualizar também o **README.md** (está em português e documenta regras e stats).
- Mudanças de regra de alcance/movimento quase sempre afetam `HumanPlayer`, `SelectionManager` e `ComputerPlayer` juntos.
- `LevelBase` recria board, players, `GameUI` e managers a cada ativação. Tudo que registra listener no engine ou no `window` precisa ser desfeito no `onDeactivate` (`GameUI.destroy`, `Player.dispose`), senão acumula entre partidas.
- `UNIT_CONFIG` é copiado raso por unidade (`{ ...UNIT_CONFIG[t] }`) — não mutar objetos aninhados (graphics, skill).
- O loader da Excalibur deixa um listener de `keyup` Enter no `body` que recria o botão "PLAY!" depois do carregamento. O `main.ts` troca `loader.startButtonFactory` por um botão invisível após o `game.start`; não remova isso (o seletor de mapas usa Enter).
- Teste automatizado no Chrome headless: emular foco (`Emulation.setFocusEmulationEnabled`) e usar polling por intervalo, senão o loop da Excalibur fica estrangulado e as animações parecem travadas.
- Validar mudanças com `yarn validate` (tipos + lint + testes) e testar no navegador com `yarn dev`.
- Pausas na partida: use `gameDelay` (`speed.ts`), não `ex.Util.delay`, para respeitar a velocidade do jogo.
