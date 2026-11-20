# Checklist — Tutorial guiado ("Learn to play")

Partida **100% roteirizada** para quem nunca jogou: **Twin Keeps (`map_1`)**, **exército clássico** dos dois lados (Fighter, Barbarian, Archer, Cleric, Mage, Spearman, Thief, Warrior), jogador de Azul contra a CPU. Sai da tela de modo direto para a partida: **sem seletor de mapas e sem montar exército**.

## Decisões

- **Tudo roteirizado, nada aleatório.** Cada ação do jogador, cada ação da CPU e **cada dado** (golpe e contra-ataque) vêm do roteiro. Mesma partida, mesmo dano, sempre.
- O jogador só consegue fazer **a ação do passo atual**. Todo o resto fica travado.
- A CPU segue o roteiro (não usa a IA) e **perde rápido**: ela se expõe e o Azul ganha os dados de que precisa. Mesmo assim, a partida passa por **todas** as lições.
- Ao vencer: "Tutorial complete!" + **"Play a real match?"**. Sim → mesma partida de verdade: Twin Keeps, exército clássico dos dois lados, CPU **Easy**, modo `p1vscpu`, sem tutorial. Não → menu principal.
- Velocidade travada em x1. O Azul perde pelo menos uma unidade (realista). "Skip tutorial" volta direto ao menu.
- End turn no tutorial **não** pede a confirmação "N left - sure?" (o balão já explica).
- Regras de jogo não mudam: o roteiro só escolhe as ações e os dados, e o motor aplica como sempre.

## 1. Modo e entrada no menu

- [x] `GameMode` ganha `'tutorial'` ([src/game-modes.ts](src/game-modes.ts)).
- [x] `GAME_MODES`: `Learn to play` na **primeira posição**, ao lado do Online; a tela de modo passou para 5 cards.
- [x] Retratos do card: `['WarriorA', 'ThiefB']`.
- [x] `chooseMode('tutorial')` não vai para `map`: `launchTutorial` vai direto à cena do Twin Keeps com `tutorialSettings()` ([src/tutorial/tutorial-mode.ts](src/tutorial/tutorial-mode.ts)).
- [x] Não salva `'tutorial'` em `pixelfantasywar.mode` nem mexe em `map`/`army.*`/`placement.*`.
- [x] O seletor de dificuldade não vale para o tutorial.
- [x] Sem `pixelfantasywar.tutorial.done`, o card mostra a etiqueta **"New here?"**.
- [ ] Botão no fim da página "How to play" que abre o tutorial.

## 2. O roteiro (`src/tutorial/script.ts`, puro)

- [x] Tipos de passo (`TutorialStep`): `info` (texto + Next), `do` (o jogador faz exatamente a ação), `cpu` (o Vermelho faz, animado; texto num movimento só anuncia e fica até a fase acabar, texto num ataque espera Next depois do golpe).
- [x] Ações (`TutorialAction`): iguais ao `GameAction`, mas o `move` só diz o destino; o caminho é o do próprio jogo (`toGameAction` em [src/tutorial/resolve.ts](src/tutorial/resolve.ts)).
- [x] Textos neutros quanto à entrada ("Select", "choose", "pick"), com `[texto]` destacado.
- [x] O que destacar: a unidade do passo e, quando ela já está no modo certo, o tile/alvo; `cells` (extras) e `ui` (partes da HUD).
- [x] Unidades fora da lição não agem: o passo é o End turn. O teste garante que ainda há unidade azul com ação nesse momento.

### A partida escrita (5 rodadas, 41 ações do jogador)

| Rodada | Azul (jogador) | Vermelho (CPU) |
|---|---|---|
| 1 | Warrior sai; Barbarian para na porta → Undo → passa; Archer usa Run; Spearman Wait; End turn | todos correm (Run) para o meio |
| 2 | Warrior na floresta; Thief corre (Run) para trás da linha; Archer **erra** o Cleric (1 de dano); Barbarian na frente do Archer; Cleric e Mage saem | Mage e Fighter atacam o Barbarian (**contra-ataque**); Thief tira **20** no Warrior (crítico) e leva o revide |
| 3 | Thief **pelas costas** mata o Fighter; Barbarian **Special** mata o Mage; Warrior usa **Guard**; Cleric **Heal**; Archer **Aimed Shot**; Mage **Fireball** | Thief erra o Warrior com Guard e morre no revide; Cleric e Warrior apanham do Barbarian no revide; Barbarian com **Rage** mata o **Mage azul** |
| 4 | Barbarian mata o Cleric; Thief pelas costas + Archer tira **20** e mata o Warrior; Cleric pelas costas + Spearman (Run, alcance 2) matam o Barbarian | Archer e Spearman (Pierce) acertam o Cleric azul **pelas costas** |
| 5 | Thief pelas costas mata o Archer; Spearman com **Pierce** dá o golpe final → vitória | — |

Cortes (de 49 para 41 ações): o Thief não corre na rodada 1 (corre direto para o lugar na 2, e a lição de floresta passou para o Warrior); o Fighter fica no castelo (o 20 natural passou para o Archer); saiu o ataque do Warrior na rodada 3, o do Warrior na 4 (o Fireball ficou mais forte) e o do Cleric na 5 (o Pierce mata sozinho). Todas as lições continuam.

- [x] Todas as lições de `LESSONS`: objetivo, rodada, card, selecionar, mover, porta, Undo, Run, MP, floresta, água, Wait (unidade fica cinza), End turn, fase da CPU, extras (pausa, zoom), ataque à distância, prévia, erro = 1, contra-ataque, crítico (natural e forçado), direção, pelas costas, Special, skill própria (Aimed Shot, Fireball, Pierce), Guard, Heal, perder unidade, alcance 2, vitória.
- [x] Dados escritos à mão, mas cada ataque tem `expect` e o teste confere tudo.

## 3. Partida no modo tutorial

- [x] `TutorialMatch` ([src/tutorial/tutorial-match.ts](src/tutorial/tutorial-match.ts)) criado pela `LevelBase` quando `mode === 'tutorial'`; cria `HumanPlayer` (Azul, com `gate`) + `ScriptedPlayer` (Vermelho); destruído no `onDeactivate`.
- [x] Anda pelo roteiro esperando a fase certa (`hooks.phaseStarted`/`phaseEnded`), mostra o balão, marca células e joga os passos `cpu` com `applyAction` (animados como o `RemotePlayer`).
- [x] Ataque do jogador usa os **dados do roteiro** (`ActionGate.attackRolls`).
- [x] A prévia de combate continua com as probabilidades reais.
- [x] Banner de fase continua; o balão do passo aparece depois dele.
- [x] Velocidade **travada em x1** (`lockSpeed` em [src/speed.ts](src/speed.ts)); o botão fica desabilitado e a preferência salva não muda.
- [x] Roteiro fora de sincronia (bug): aviso no balão, erro no console e volta ao menu.
- [x] Quando o próximo passo é da mesma unidade (mover e depois atacar, Undo e depois mover), o menu dela reabre sozinho.

## 4. Travar as ações fora do roteiro

- [x] `ActionGate` no `HumanPlayer` (`gate`): unidade, item do menu, tile/alvo, End turn, dados e `done` (avisa quando a ação terminou). Sem `gate`, tudo igual.
- [x] Só a unidade do passo abre o menu; só o tile/alvo do passo aceita o clique (os outros tiles válidos não fazem nada).
- [x] `unit-menu`: itens fora do passo desabilitados e o certo destacado (`MenuOptions.allows`, `MenuItem.highlight`).
- [x] `game-hud`: End turn desabilitado até o passo dele, sem confirmação.
- [x] Ação errada não faz nada; o balão treme (ou pisca o Next nos passos de texto).
- [x] Esc cancela só o modo atual. Pausa e "Main menu" sempre funcionam.
- [x] Inspecionar unidades (botão direito/meio, R/F, clique em inimigo) fica liberado.

## 5. UI do tutorial

- [x] `<tutorial-panel>` ([src/ui-components/tutorial-panel.ts](src/ui-components/tutorial-panel.ts)): texto, barra de progresso, `Next` (Enter/Espaço também; no controle, A) e `Skip tutorial` (segundo clique confirma). Entra pelo `GameUI.addOverlay`, abaixo do menu e dos diálogos.
- [x] Fica embaixo, acima do `game-hint` (que continua: ele explica o controle de cada modo).
- [x] Marcadores no mapa: o mesmo cursor amarelo animado do caminho de movimento (`TutorialMarkers`), por cima das unidades; seguem câmera e zoom.
- [x] Destaque na HUD (`HudView.highlight`: times, rodada, pausa, End turn) e no item do menu.
- [x] O olho (H) não esconde o balão.
- [x] Toque: `Next` ignora cliques nos primeiros 350 ms.
- [ ] Não entra em `MATCH_DIALOGS` (o A do controle cairia no Skip); o Next do controle é o A via Enter. Testar com controle de verdade.
- [ ] Celular: conferir legibilidade e se o balão cobre unidades em tela pequena deitada.
- [ ] Trocar "Select a unit" por textos de toque/controle, se fizer falta.

## 6. Fim do tutorial

- [x] Na vitória: "Tutorial complete!" + "Ready for a real match? Same map, same armies, no help this time." (sem citar a dificuldade), botões **Play a match** e **Main menu** (`hooks.describe`).
- [x] Grava `pixelfantasywar.tutorial.done = '1'`.
- [x] Play a match → `LevelBase.restart(afterTutorialSettings())`: Twin Keeps, clássico, Easy, `p1vscpu`. "Play again" dessa partida repete a partida de verdade.
- [x] Main menu → `returnToMainMenu()`.
- [x] Skip tutorial / Main menu da pausa → `TurnManager.quit()`, sem gravar `tutorial.done`.

## 7. Testes

- [x] `tests/tutorial.test.ts`: o roteiro inteiro no tabuleiro real (ações válidas, `expect`, dados, Run necessário, End turn possível, vitória só no último golpe, 5 rodadas, todas as lições, o Azul perde unidade).
- [ ] Teste do `ActionGate` (ação fora do passo recusada; sem tutorial, nada filtrado).
- [x] Navegador (Chrome headless, mouse + Enter no Next): tutorial do começo ao fim e "Play a match".
- [ ] Navegador: toque e controle.
- [x] `yarn validate`.

## 8. Documentação

- [x] `CLAUDE.md`: seção "Tutorial", linha na tabela de arquitetura, modo no "Fluxo de jogo", teste na lista.
- [x] `README.md`: modo "Learn to play" e como o tutorial funciona.
- [ ] Página "How to play" aponta para o tutorial.
