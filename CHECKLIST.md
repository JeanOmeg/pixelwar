# PixelFantasyWar — Checklist de melhorias

Marque `[x]` ao concluir. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa.
Itens da IA estão em [CHECKLIST-IA.md](CHECKLIST-IA.md).

Última revisão: 17/11/2026. Todos os itens foram conferidos no código antes de fechar. `yarn validate` (tipos + lint + 74 testes) passa.

## 1. Bugs

- [x] 🔴 **Ataque pelas costas indevido no início da partida.** Todas as unidades começavam com `miniDirection = 'right'`, e as do time B eram só espelhadas na imagem. Quando A atacava B de frente, o golpe contava como pelas costas. Agora o time 1 começa com `miniDirection = 'left'` ([level-base.ts](src/levels/level-base.ts)).
- [x] 🔴 **Listeners e menus acumulam entre partidas.** Cada partida criava um `HumanPlayer` com `pointers.on(...)` e um `UIManager` com outro `<unit-menu>` e outro listener de `resize`, e nada era removido. Agora o `HumanPlayer` guarda as inscrições e as fecha em `dispose()`, e o `GameUI` remove tudo em `destroy()`. As duas coisas são chamadas no `LevelBase.onDeactivate`.
- [x] 🟡 **Prévia de alcance (botão direito/meio) some ao mover o mouse.** O cursor e os highlights usavam o mesmo ator `decoration` da célula, então mover o cursor apagava os destaques, e `hasCursor` nunca virava `true`. Agora o cursor é um ator separado na `Cell` (`cursor`), o highlight guarda o tipo (`Cell.highlight`) e só o próximo clique limpa a prévia.
- [x] 🟡 **Cancelar o Run clicando fora do mapa trava a skill do turno.** A devolução de MP agora fica em `Unit.settlePendingSkill`, que também volta `usedSkill` para `false`.
- [x] 🟡 **Morte da unidade roda várias vezes.** `onPostUpdate` era `async` e enfileirava a animação de morte a cada frame; o `ex.Util.delay(600)` não tinha `await`. Agora `die()` roda uma vez (flag `dying`), e unidades com HP ≤ 0 saem de `Board.getUnits()` na hora e não podem agir.
- [x] 🟡 **Tela de fim no PvP e no CPU vs CPU.** Agora mostra "Victory!"/"Defeat" no PvCPU, "Blue/Red wins!" no PvP e no CPU vs CPU, e "Draw" quando acaba o limite de fases. Também tem "Play again" e "Main menu".
- [x] 🟡 **`findAttackRange` usa o alcance da unidade selecionada, e não da unidade recebida.** Por isso a IA precisava chamar `selectUnit` antes de calcular alvos. `findPath` tinha o mesmo acoplamento.
- [x] 🟢 **Erro de ataque causa 1 de dano** (`MISS_DAMAGE`). Decidido: a regra fica. Está explícita no README, na tela How to play e no número flutuante ("Miss 1").
- [x] 🟢 **Descrição da skill Run dizia "Ends turn"**, mas ela não encerra o turno.
- [x] 🟢 **Modo de jogo passado por `localStorage`.** Agora vai em `goToScene(cena, { sceneActivationData: { mode } })` e a `LevelBase` lê no `onActivate`. O `localStorage` só guarda a última escolha para pré-selecionar no menu.
- [x] 🟢 **Texto do banner de turno.** O cálculo `Turn ${(this.turn - this.maxTurns) + 1}` foi trocado por "Round N".
- [x] 🟢 **Barbarian vermelho andava de lado ao subir/descer** (achado ao gerar as animações): `MoveUp`/`MoveDown` usavam a linha 1 da spritesheet. Resolvido com `buildUnitAnimations` para todas as classes.

## 2. Performance

- [x] 🔴 **Pathfinding a cada frame.** `onPostUpdate` chama `hasActions()` → `canAttack()` → `getPossibleTargets()` → `getRangeAttack()` para toda unidade, 60 vezes por segundo. Resolvido deixando o `getRangeAttack` ~600x mais barato: ele agora só anda nas 4 linhas retas, no máximo uns 24 tiles. Se ainda pesar, calcular só quando o estado mudar.
- [x] 🟡 **IA recalcula o range dentro do loop.** `getRange` era recalculado para cada célula, mas o resultado é sempre o mesmo.
- [x] 🟡 **A\* simples demais.** Substituído por Dijkstra com heap e desempate por menos curvas (`MovementMap`). Num teste com os dois mapas reais (121 mil caminhos), o A\* antigo gerava caminhos **acima do movimento da unidade** em ~6% dos casos e caminhos mais caros que o ótimo em ~15%. O novo gera 0 nos dois casos, e os alcances de movimento e de ataque ficaram idênticos aos antigos.
- [x] 🟢 **Coordenadas tiradas do nome da célula.** `getXOrYByNameCell` fazia parse da string `cell(x, y)` e devolvia `x` e `y` trocados. Agora `x`/`y` ficam no `PathNodeComponent`.

## 3. Organização do código

- [x] 🟡 **`resources.ts` tinha ~2500 linhas repetidas.** As 28 variantes usam `buildUnitAnimations` (`UNIT_ANIMATIONS`); o arquivo caiu para ~260 linhas. Antes de trocar, um script conferiu que as 190 animações escritas à mão seguiam a grade (as 2 diferentes eram o bug do Barbarian acima). O `loader` foi para [loader.ts](src/loader.ts).
- [x] 🟡 **`config.ts` repetia o mesmo bloco 16 vezes.** Agora `UNIT_CONFIG` é gerado a partir de `CLASS_STATS` ([class-stats.ts](src/class-stats.ts)), `UNIT_ANIMATIONS` e `skillsOf` ([skills.ts](src/skills.ts)). A lista de classes fica em [unit-types.ts](src/unit-types.ts).
- [x] 🟡 **Nomes de classe espalhados como string.** `'Archer'`, `'Mage'`, `'Spearman'`, `'Thief'` apareciam em `if`s no `PathFinder`. Agora ficam em `TERRAIN_RULES` ([terrain-rules.ts](src/path-finding/terrain-rules.ts)).
- [x] 🟡 **Lógica de skill duplicada.** Cobrança e devolução de MP ficam em `Unit.startSkill`, `Unit.settlePendingSkill` e `Unit.useSkillOn`, usados pelo `HumanPlayer` e pela IA.
- [x] 🟢 **Lado do menu decidido pelo nome do jogador.** O `UIManager` foi removido. O `GameUI` usa o índice do jogador para o time, e o menu fica ancorado ao lado da unidade.
- [x] 🟢 **Remover código morto.** Apagados `src/actors/`, `src/texts/`, `src/fonts/`, `map1.js|map2.js|map3.js`, `src/assets/maps/`, `credits.html`, `Resources.LevelMusic1`, `description` do `UNIT_CONFIG`, `Cell.getRandomNumber`, `Cell.getDistance`, `Board.getEmptyCells` e `Unit.availableActions` (nada os importava).
- [x] 🟢 **`noUnusedLocals` e `noUnusedParameters`** ativos no `tsconfig.json`.
- [x] 🟢 **Tipar `miniDirection`.** Agora é `Facing` (`'up' | 'down' | 'left' | 'right'`), de [combat.ts](src/combat.ts).

## 4. Qualidade e infraestrutura

- [x] 🟡 **Testes (Vitest)** em [tests/](tests/): combate, balanceamento (custos = fórmula; exército clássico de cada mapa = 100), exército da CPU, `PathFinder` e regras da `Unit` (skills, floresta, contra-ataque). Os que precisam da engine rodam com `happy-dom`.
- [ ] 🟡 **Deploy sem commit automático.** O `build.js` faz `git add .` e commita tudo, inclusive arquivos que não deveriam entrar. Trocar por GitHub Actions que builda e publica no Pages, e tirar `docs/` do repositório. *Adiado:* exige mudar a origem do Pages nas configurações do GitHub para "GitHub Actions" antes de remover `docs/`.
- [x] 🟢 **Scripts** `lint`, `typecheck`, `test`, `validate` (os três) e `balance` no `package.json`.
- [x] 🟢 **Versões alinhadas:** `excalibur` fixado em `0.30.3` (o que estava instalado), `plugin-tiled` em `0.30.2` (pede `~0.30.1`).
- [x] 🟢 **Seção "Desenvolvimento" do README** usa `yarn` e avisa que `yarn build` faz commit de tudo.
- [x] 🟢 **Mudo lembrado** no `localStorage` (`pixelfantasywar.muted`).

## 5. Gameplay e UX

- [x] 🟡 **Novas classes e escolha de exército.** 6 classes novas (Paladin, Berserker, Assassin, Ranger, Necromancer, Halberdier) com sprites derivados das originais, custos em pontos calculados pela matemática de combate e tela de montagem de exército com orçamento de 100 pontos.
- [x] 🟡 **IA monta o próprio exército** ([army-ai.ts](src/army-ai.ts)): cada posição mantém o papel da classe do mapa (de longe, alcance 2, flanco, corpo a corpo, pesado) e recebe uma classe sorteada desse papel, dentro dos 100 pontos.
- [x] 🟡 **Identidade por classe nas skills.** Cada classe tem uma skill própria além de Run e Special: Aimed Shot, Fireball, Pierce, Steal, Second Wind, Heal, Rage, Guard, Shield Wall, Frenzy, Backstab, Pinning Shot, Drain e Brace ([skills.ts](src/skills.ts)). A IA também usa.
- [x] 🟡 **Prévia de combate.** No modo de ataque, ao passar o mouse sobre um inimigo ao alcance, o `unit-card` mostra a chance de acerto, a faixa de dano, a chance de matar, se o ataque é pelas costas e o contra-ataque (`forecastAttack`).
- [x] 🟡 **Feedback do resultado do ataque.** O número flutuante diferencia "Miss", "Back attack!", "Critical!" e "Counter!", e mostra curas e buffs. Um som de erro seria um bom extra.
- [x] 🟡 **Alcance de ataque em "pontos".** O card mostra o alcance em tiles ("6 tiles in the open, 3 over forest or water"), e a tela Units marca "Range halves over forest/water".
- [x] 🟡 **Barra de HP sobre as unidades no mapa** (verde, amarela abaixo de 50%, vermelha abaixo de 25%).
- [x] 🟡 **Controle de velocidade** x1/x2/x3 no HUD (salvo): acelera animações (`engine.timescale`) e as pausas da CPU (`gameDelay`).
- [x] 🟡 **Desfazer movimento** ("Undo move" no menu) enquanto a unidade não atacou; devolve o MP do Run.
- [x] 🟡 **Indicar para onde cada unidade está virada.** O card e a prévia mostram uma seta com a direção. Um indicador no próprio mapa seria um extra.
- [x] 🟢 **Bônus de terreno:** +2 DEF na floresta (aparece no card e entra na prévia e no custo das classes).
- [x] 🟢 **Contra-ataque** de quem tem alcance 1 contra atacante adjacente, se sobreviver e não tiver sido atacado pelas costas (Halberdier com Brace revida a 2 tiles). Custos rebalanceados: Archer 10, Berserker 15, Halberdier 12, Cleric 15.
- [x] 🟢 **Controles por teclado:** setas/WASD, Enter/Espaço, Tab (próxima unidade), R/F (alcances), E (encerrar turno), P (pausa), menus navegáveis pelas setas.
- [x] 🟢 **Confirmação ao encerrar o turno** quando ainda há unidades com ações. O **End turn** do HUD pede um segundo clique.
- [ ] 🟢 **Mais mapas** e um modo campanha com progressão. O seletor já está pronto para muitos mapas (basta uma entrada em `MAPS`, ver CLAUDE.md). Quando houver mapas de tamanhos diferentes: filtro por tamanho no seletor e câmera/zoom na partida (hoje o enquadramento assume 28×17). *Deixado para uma tarefa própria.*
- [x] 🟢 **Suporte a mobile/touch.** Toque com prévia + confirmação, aviso para girar o aparelho, tela cheia no primeiro toque e UI ampliada em telas pequenas (ver CLAUDE.md, "Celular e toque").
- [x] 🟢 **Botão de tela cheia** ao lado do som (gira o celular para a horizontal) e tela cheia ao começar a partida no celular.
- [x] 🟢 **Pausa** com opção de sair para o menu principal (botão no HUD, P ou Esc).
- [x] 🟢 **Logo e botão PLAY do carregamento** iguais à tela título e proporcionais à tela.
- [x] 🟢 **Descrição das unidades.** Papel, descrição e skill própria de cada classe na tela Units.

## Ordem sugerida

1. IA: seções 1–3 do [CHECKLIST-IA.md](CHECKLIST-IA.md) (distância em tiles, Run só quando precisa, recuar depois de atacar, ataque pelas costas, mapa de ameaça). Agora ela já tem o dano esperado real e o risco de contra-ataque.
2. Deploy por GitHub Actions (depois de trocar a origem do Pages).
3. Mais mapas e campanha.
4. Extras: som de erro, seta de direção no mapa.
