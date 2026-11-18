# PixelFantasyWar — Checklist de melhorias

Marque `[x]` ao concluir. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa.
Itens da IA estão em [CHECKLIST-IA.md](CHECKLIST-IA.md).

Última revisão: 17/11/2026, depois da reescrita do pathfinder e da UI de jogo (`tsc --noEmit` e `eslint src` passam sem erros).

## 1. Bugs

- [x] 🔴 **Ataque pelas costas indevido no início da partida.** Todas as unidades começavam com `miniDirection = 'right'`, e as do time B eram só espelhadas na imagem. Quando A atacava B de frente, o golpe contava como pelas costas. Agora o time 1 começa com `miniDirection = 'left'` ([level-base.ts](src/levels/level-base.ts)).
- [x] 🔴 **Listeners e menus acumulam entre partidas.** Cada partida criava um `HumanPlayer` com `pointers.on(...)` e um `UIManager` com outro `<unit-menu>` e outro listener de `resize`, e nada era removido. Agora o `HumanPlayer` guarda as inscrições e as fecha em `dispose()`, e o `GameUI` remove tudo em `destroy()`. As duas coisas são chamadas no `LevelBase.onDeactivate`.
- [ ] 🟡 **Prévia de alcance (botão direito/meio) some ao mover o mouse.** O cursor e os highlights usam o mesmo ator `decoration` da célula. `showCursor` chama `toggleCursor(false)` em todas as células ([selection-manager.ts](src/selection-manager.ts)), e isso esconde qualquer highlight ([cell.ts:83-90](src/cell.ts#L83-L90)). Pelo mesmo motivo, o cursor não aparece sobre células destacadas. Além disso, `hasCursor` nunca vira `true`. Correção: usar atores separados para o cursor e para o highlight, e só limpar a prévia no próximo clique.
- [x] 🟡 **Cancelar o Run clicando fora do mapa trava a skill do turno.** A devolução de MP do humano agora fica toda em `HumanPlayer.refundPendingSkill`, que também volta `usedSkill` para `false`.
- [ ] 🟡 **Morte da unidade roda várias vezes.** `onPostUpdate` é `async` e roda a cada frame; enquanto `health <= 0`, enfileira a animação de morte de novo a cada frame ([unit.ts](src/unit.ts)). Além disso, `ex.Util.delay(600)` não tem `await`. Correção: usar uma flag `isDying` ou tratar a morte direto em `attack()`.
- [x] 🟡 **Tela de fim no PvP e no CPU vs CPU.** Agora mostra "Victory!"/"Defeat" no PvCPU, "Blue/Red wins!" no PvP e no CPU vs CPU, e "Draw" quando acaba o limite de fases. Também tem "Play again" e "Main menu".
- [x] 🟡 **`findAttackRange` usa o alcance da unidade selecionada, e não da unidade recebida.** Por isso a IA precisava chamar `selectUnit` antes de calcular alvos. `findPath` tinha o mesmo acoplamento.
- [ ] 🟢 **Erro de ataque causa 1 de dano** (`MISS_DAMAGE` em [combat.ts](src/combat.ts)). O número flutuante agora mostra "Miss 1". Decidir se essa é a regra e deixar explícito no README.
- [x] 🟢 **Descrição da skill Run dizia "Ends turn"**, mas ela não encerra o turno ([config.ts](src/config.ts)).
- [x] 🟢 **Modo de jogo passado por `localStorage`.** Agora vai em `goToScene(cena, { sceneActivationData: { mode } })` e a `LevelBase` lê no `onActivate`. O `localStorage` só guarda a última escolha para pré-selecionar no menu.
- [x] 🟢 **Texto do banner de turno.** O cálculo `Turn ${(this.turn - this.maxTurns) + 1}` foi trocado por "Round N".

## 2. Performance

- [x] 🔴 **Pathfinding a cada frame.** `onPostUpdate` chama `hasActions()` → `canAttack()` → `getPossibleTargets()` → `getRangeAttack()` para toda unidade, 60 vezes por segundo. Resolvido deixando o `getRangeAttack` ~600x mais barato: ele agora só anda nas 4 linhas retas, no máximo uns 24 tiles. Se ainda pesar, calcular só quando o estado mudar.
- [x] 🟡 **IA recalcula o range dentro do loop.** `getRange` era recalculado para cada célula, mas o resultado é sempre o mesmo.
- [x] 🟡 **A\* simples demais.** Substituído por Dijkstra com heap e desempate por menos curvas (`MovementMap`). Num teste com os dois mapas reais (121 mil caminhos), o A\* antigo gerava caminhos **acima do movimento da unidade** em ~6% dos casos e caminhos mais caros que o ótimo em ~15%. O novo gera 0 nos dois casos, e os alcances de movimento e de ataque ficaram idênticos aos antigos.
- [x] 🟢 **Coordenadas tiradas do nome da célula.** `getXOrYByNameCell` fazia parse da string `cell(x, y)` e devolvia `x` e `y` trocados. Agora `x`/`y` ficam no `PathNodeComponent`.

## 3. Organização do código

- [ ] 🟡 **`resources.ts` tem ~2500 linhas repetidas** (12 animações × 16 unidades). Criar uma função `buildUnitAnimations(spriteSheet)` que gera todas a partir da grade 4×14.
- [ ] 🟡 **`config.ts` repete o mesmo bloco 16 vezes.** Definir stats por classe uma vez e gerar as variantes A/B (cor + spritesheet). Skills comuns em uma constante.
- [x] 🟡 **Nomes de classe espalhados como string.** `'Archer'`, `'Mage'`, `'Spearman'`, `'Thief'` apareciam em `if`s no `PathFinder`. Agora ficam em `TERRAIN_RULES` ([terrain-rules.ts](src/path-finding/terrain-rules.ts)).
- [ ] 🟡 **Lógica de skill duplicada.** A cobrança de MP está repetida em `HumanPlayer` e `ComputerPlayer` (a devolução do humano já está centralizada em `refundPendingSkill`). Centralizar em métodos da `Unit`, como `startSkill(event)` e `cancelSkill()`.
- [x] 🟢 **Lado do menu decidido pelo nome do jogador.** O `UIManager` foi removido. O `GameUI` usa o índice do jogador para o time, e o menu fica ancorado ao lado da unidade.
- [ ] 🟢 **Remover código morto:** `src/actors/`, `src/texts/`, `src/fonts/`, `src/assets/tiledMap/map1.js|map2.js|map3.js`, `src/assets/maps/Map1.png|Map2.png` (miniaturas antigas), `credits.html` e `Resources.LevelMusic1`. A `description` de `UNIT_CONFIG` também ficou sem uso (o texto das classes está em `CLASS_INFO`). Membros sem uso: `Cell.getRandomNumber`, `Cell.getDistance`, `Board.getEmptyCells` e `Unit.availableActions`.
- [ ] 🟢 **Ativar `noUnusedLocals` e `noUnusedParameters`** no `tsconfig.json` para o compilador apontar esse tipo de sobra.
- [x] 🟢 **Tipar `miniDirection`.** Agora é `Facing` (`'up' | 'down' | 'left' | 'right'`), de [combat.ts](src/combat.ts).

## 4. Qualidade e infraestrutura

- [ ] 🟡 **Adicionar testes (Vitest)** para as regras puras: `combat.ts` (já extraído, com dados injetáveis em `resolveAttack` e `random` em `rollWithAdvantage`), `canUseSkill` e o `PathFinder`/`terrain-rules.ts`, que já rodam fora do navegador.
- [ ] 🟡 **Deploy sem commit automático.** O `build.js` faz `git add .` e commita tudo, inclusive arquivos que não deveriam entrar. Trocar por GitHub Actions que builda e publica no Pages, e tirar `docs/` do repositório.
- [ ] 🟢 **Adicionar scripts `lint` e `typecheck`** ao `package.json`.
- [ ] 🟢 **Alinhar versões:** `excalibur ^0.30.3` com `plugin-tiled 0.30.2` fixo.
- [ ] 🟢 **Corrigir a seção "Desenvolvimento" do README.** Ela manda usar `npm`, mas o projeto usa `yarn`. Também não avisa que `build` faz commit de tudo.
- [ ] 🟢 **Lembrar a escolha de mudo** (`audio-menu`) no `localStorage`. Hoje ela volta para "som ligado" a cada recarga.

## 5. Gameplay e UX (ideias)

- [x] 🟡 **Novas classes e escolha de exército.** 6 classes novas (Paladin, Berserker, Assassin, Ranger, Necromancer, Halberdier) com sprites derivados das originais, custos em pontos calculados pela matemática de combate e tela de montagem de exército com orçamento de 100 pontos.
- [ ] 🟡 **IA montar o próprio exército** (hoje a CPU usa o exército desenhado no mapa). Poderia escolher por pontos de acordo com o mapa e o exército do jogador.
- [ ] 🟡 **Identidade por classe nas skills.** Hoje todas têm Run e Special; com 14 classes isso pesa mais. Sugestões:
  - Cleric cura um aliado adjacente.
  - Thief rouba MP do alvo.
  - Warrior recebe um bônus de defesa até o próximo turno.
  - Mage causa dano em área.
- [x] 🟡 **Prévia de combate.** No modo de ataque, ao passar o mouse sobre um inimigo ao alcance, o `unit-card` mostra a chance de acerto, a faixa de dano, a chance de matar e se o ataque é pelas costas (`forecastAttack`).
- [x] 🟡 **Feedback do resultado do ataque.** O número flutuante agora diferencia "Miss", "Back attack!" e "Critical!". O som de acerto continua igual para todos; um som de erro seria um bom extra.
- [ ] 🟡 **Alcance de ataque mostrado em "pontos", não em tiles** (o README já explica a regra). O Archer mostra alcance 6, mas paga 2 por tile não rápido, então alcança só 3 tiles em terreno normal. O Spearman (alcance 2) só atinge o tile ao lado. Converter para tiles ou explicar no card.
- [ ] 🟡 **Barra de HP sobre as unidades no mapa.** O card já mostra HP/MP com barra e máximo; falta a barrinha no próprio mapa.
- [ ] 🟡 **Controle de velocidade** (principalmente no CPU vs CPU). O banner de fase já pode ser pulado com clique ou Esc.
- [ ] 🟡 **Desfazer movimento** antes de atacar ou encerrar a unidade.
- [x] 🟡 **Indicar para onde cada unidade está virada.** O card e a prévia mostram uma seta com a direção. Um indicador no próprio mapa seria um extra.
- [ ] 🟢 **Bônus de terreno**, como defesa extra na floresta.
- [ ] 🟢 **Contra-ataque** do defensor corpo a corpo quando sobrevive e o atacante está no alcance. Deixa o posicionamento mais importante.
- [ ] 🟢 **Controles por teclado** (setas, Enter) e atalho para encerrar o turno. O Esc já funciona.
- [x] 🟢 **Confirmação ao encerrar o turno** quando ainda há unidades com ações. O **End turn** do HUD pede um segundo clique.
- [ ] 🟢 **Mais mapas** e um modo campanha com progressão. O seletor já está pronto para muitos mapas (basta uma entrada em `MAPS`, ver CLAUDE.md). Quando houver mapas de tamanhos diferentes: filtro por tamanho no seletor e câmera/zoom na partida (hoje o enquadramento assume 28×17).
- [x] 🟢 **Suporte a mobile/touch.** Toque com prévia + confirmação, aviso para girar o aparelho, tela cheia no primeiro toque e UI ampliada em telas pequenas (ver CLAUDE.md, "Celular e toque").
- [x] 🟢 **Descrição das unidades.** Papel e descrição de cada classe em `CLASS_INFO` ([unit-classes.ts](src/unit-classes.ts)), mostrados na tela Units.

## Ordem sugerida

1. Bugs 🟡 restantes: prévia de alcance (botão direito/meio) e morte repetida.
2. Centralizar a cobrança de skill na `Unit`. Isso também ajuda a IA ([CHECKLIST-IA.md](CHECKLIST-IA.md)), que pode passar a usar `forecastAttack`.
3. Testes de `combat.ts` e do `PathFinder` (já são puros).
4. Gerar animações e config por função (`resources.ts` e `config.ts`).
5. Deploy por GitHub Actions.
6. Gameplay e UX.
