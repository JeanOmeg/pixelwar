# PixelFantasyWar — IA: análise e checklist

Código em [src/ai/](src/ai/) (o [computer-player.ts](src/computer-player.ts) só executa com animação).
Marque `[x]` ao concluir. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa.

Última revisão: 18/11/2026 — IA reescrita; depois, correção do travamento em portas, da fuga no fim e do "sair sem atacar" (seção 9).

---

## Como a IA funciona agora

1. **Um plano por turno inteiro.** Para cada unidade, [planner.ts](src/ai/planner.ts) gera todos os planos: cada destino possível (parado, andando ou correndo, Run só além do alcance a pé) × cada forma de atacar (andar e atacar, ou atacar de onde está e depois sair: "bate e corre") × cada skill que vale tentar (Special, a skill de ataque da classe, Frenzy). Planos sem ataque também entram (só se posicionar).
2. **Uma escala só.** Tudo é medido em "pontos de valor": uma unidade vale o custo dela × 10 (Archer 100, Warrior 210). Matar vale o valor do alvo + um bônus; ferir vale a fração do HP tirado × valor; arriscar a unidade custa a fração do HP dela que pode perder × valor dela. MP também tem preço. Pesos em [weights.ts](src/ai/weights.ts) (`AI_WEIGHTS`).
3. **Ataque** (`scoreAttack`): chance de matar e dano esperado pelo `forecastAttack` (dados com vantagem, floresta, buffs), ataque pelas costas pela direção real de chegada, contra-ataque que o alvo devolve, efeitos das skills (Fireball nos vizinhos, Steal, Drain, Pinning Shot).
4. **Posição** (`scorePosition`):
   - **mapa de ameaça** ([threat.ts](src/ai/threat.ts)): para cada tile, quais inimigos conseguem atacá-lo no próximo turno (movendo e atacando pelas regras reais do pathfinding), com o dano esperado e a chance de morrer, incluindo ataque pelas costas de quem consegue chegar atrás;
   - **distância por caminho** até o inimigo (Dijkstra com as regras de terreno da classe), comparada com a distância ideal pelo alcance;
   - trabalho em equipe: não parar na linha de tiro de um aliado de longe que ainda vai atirar, healer perto de aliados feridos, tanque perto dos frágeis;
   - não acampar em porta (ninguém ataca quem está lá, mas ele também não ataca; sem isso o lado perdendo segurava empate).
5. **Ordem e foco de fogo** ([turn.ts](src/ai/turn.ts)): a cada passo todas as unidades que faltam planejam, e age a que mais ganha agindo agora (quem pode matar vai primeiro). O tabuleiro é relido depois de cada unidade, então o dano já causado entra na próxima decisão.
6. **Depois de agir**: Guard / Brace / Shield Wall se o mapa de ameaça diz que algum inimigo alcança a unidade; Second Wind e Heal quando falta HP (antes se ameaçada).
7. **Agressividade**: em vantagem de valor de exército ela arrisca mais e avança; em desvantagem fica mais cuidadosa; e fica um pouco mais ousada a cada rodada para a partida não travar em empate.
8. **Dificuldade** (escolhida na tela de modo, salva) e **personalidade** (sorteada por CPU: equilibrada, agressiva ou defensiva).

### Resultado medido (`yarn ai:sim`, 8 mapas, os dois lados, metade com exércitos sorteados)

| Confronto (128 partidas cada) | Vitórias | Derrotas | Empates | Unidades vivas no fim |
|---|---|---|---|---|
| Hard × IA antiga | **96%** | 4% | 0% | 4,3 × 0,1 |
| Normal × IA antiga | **84%** | 16% | 0% | 3,6 × 0,3 |
| Easy × IA antiga | 63% | 37% | 0% | 2,0 × 0,7 |
| Hard × Normal | **67%** | 33% | 0% | 2,2 × 0,8 |
| Hard × Easy | **93%** | 7% | 0% | 3,8 × 0,1 |

O Easy joga no nível da IA antiga; Normal e Hard a vencem com folga, e cada nível vence o de baixo.

---

## Checklist

### 1. Correções de pontuação

- [x] 🔴 **Medir distância em tiles** — agora por **caminho** (pontos de movimento, Dijkstra a partir dos inimigos), na mesma escala de valor dos outros termos, com teto (`approachCap`).
- [x] 🔴 **Run só quando necessário** — Run só gera destinos além do alcance a pé e custa o MP (`mp` × 2); o teste "não corre se pode atacar parado" cobre.
- [x] 🔴 **Depois de atacar, não dar bônus por "posso atacar daqui"** — não existe mais esse bônus; a posição final vale pelo mapa de ameaça. Planos "atacar e depois sair" deixam arqueiros e magos recuarem (teste "arqueiro atira e recua").
- [x] 🔴 **Dano esperado realista** — `forecastAttack` (vantagem, floresta, buffs, costas), com o contra-ataque descontado.
- [x] 🟡 **Special Attack pela chance de kill** — cada skill de ataque entra como uma opção do plano e só ganha quando o ganho (kill/dano) passa do preço do MP.
- [x] 🟡 **Considerar Special Attack também depois de mover** — as opções de skill valem para qualquer posição de ataque.
- [x] 🟡 **Ajustar `shouldFlee`** — substituído pelo risco de morte do mapa de ameaça: com pouco HP, ficar onde o inimigo alcança pesa muito, então a unidade recua sozinha (teste "unidade ferida recua").

### 2. Ataque pelas costas

- [x] 🔴 **Corrigir a direção inicial das unidades.**
- [x] 🔴 **Preferir atacar pelas costas** — o plano calcula a direção de chegada e usa o ataque pelas costas na previsão (acerto garantido, 2×ATK, sem contra-ataque); Thief/Assassin ganham um extra (teste "prefere atacar pelas costas").
- [x] 🟡 **Evitar expor as costas** — o mapa de ameaça conta ataque pelas costas quando o inimigo consegue parar atrás da unidade na direção em que ela vai ficar.

### 3. Mapa de ameaça e posicionamento

- [x] 🔴 **Mapa de ameaça** — [threat.ts](src/ai/threat.ts): inimigos que alcançam cada tile, dano esperado (os 3 mais fortes), chance de morrer.
- [x] 🟡 **Distância por caminho** — `distanceToEnemies` (Dijkstra com o custo de terreno da classe).
- [x] 🟡 **Papel por classe** — de longe: distância ideal = alcance e mais medo de dano; pesados: menos medo e bônus perto dos frágeis; flanco: extra pelas costas; healer: bônus perto de aliados feridos.
- [x] 🟢 **Valorizar terreno** — a floresta (+2 DEF) entra no mapa de ameaça; portas viraram penalidade (acampar trava a partida).

### 4. Coordenação do time

- [x] 🟡 **Ordem de ação inteligente** — age primeiro a unidade que mais ganha agindo agora.
- [x] 🟡 **Foco de fogo** — o tabuleiro é relido a cada unidade; alvos já feridos ficam fáceis de matar e sobem na lista.
- [x] 🟡 **Valor do alvo** — pelo custo da classe (quem custa mais é quem mais pesa no exército inimigo).
- [x] 🟢 **Não bloquear aliados** — penalidade por parar entre um aliado de longe que ainda não atirou e o alvo dele.

### 5. Estrutura e robustez

- [x] 🔴 **Marcar a ação como tentada mesmo quando falha** — o laço por tipo de ação não existe mais; cada unidade executa um plano.
- [x] 🟡 **Desacoplar do `SelectionManager`.**
- [x] 🟡 **Ataque avaliado a partir de outra célula** com `ignore` da célula atual.
- [x] 🟡 **Extrair a pontuação para funções puras** — `scoreAttack`, `scorePosition`, `planUnit`, `ThreatMap` não mudam o jogo; [computer-player.ts](src/computer-player.ts) e a simulação só executam o plano (`AiExecutor`).
- [x] 🟡 **Pesos configuráveis** — `AI_WEIGHTS`, `DIFFICULTIES` (com pesos próprios por nível) e `PERSONALITIES` em [weights.ts](src/ai/weights.ts).
- [x] 🟢 **Corrigir o nome** `selectionManger` → `selectionManager`.
- [x] 🟢 **Resetar as animações para idle no `turnStart`.**

### 6. Performance

- [x] 🟡 **Calcular o range de movimento uma vez por iteração.**
- [x] 🟢 **Cachear `getRangeAttack`** — *medido e descartado:* uma partida inteira de 100 fases é planejada em ~0,25 s na simulação; o mapa de ameaça guarda em cache só as previsões de dano.
- [x] 🟢 **Usar o próprio Dijkstra do range para obter caminhos.**

### 7. Dificuldade e variedade

- [x] 🟡 **Níveis de dificuldade** — Easy / Normal / Hard na tela de modo (salvo em `pixelfantasywar.difficulty`; o HUD mostra "CPU (Hard)"). Mudam ruído, chance de erro, uso de skills, peso do mapa de ameaça e, no Hard, pesos ajustados pela simulação (`yarn ai:tune`).
- [x] 🟢 **Pequena aleatoriedade** — ruído proporcional ao score em cada plano (quase nulo no Hard, só desempata).
- [x] 🟢 **Personalidades** — equilibrada (50%), agressiva ou defensiva, sorteada para cada CPU na partida.

### 8. Validação

- [x] 🟡 **Log de decisão** — `localStorage.debugAI = '1'`: no console, cada decisão com os 3 melhores planos e as partes do score.
- [x] 🟡 **Simulação sem gráficos** — `yarn ai:sim` ([tests/sim/](tests/sim/)): partidas completas nos mapas reais, IA nova × IA antiga (portada em `legacy-ai.ts`) e entre níveis. `SIM_GAMES` controla o número de partidas.
- [x] 🟢 **Testes da pontuação** — [tests/ai.test.ts](tests/ai.test.ts): prefere a kill, não corre se pode atacar parado, arqueiro atira e recua, prefere atacar pelas costas, unidade ferida recua, não bloqueia a linha de tiro; mapa de ameaça (inclusive costas) e distância por caminho.

---

### 9. Travamento no fim e nas portas (18/11/2026)

- [x] 🔴 **Ficava parada atrás de porta tampada** — `distanceToEnemies` media a distância até "ao lado do inimigo" ignorando unidades, então um inimigo do outro lado de uma porta parecia a 2 passos (porta não deixa atacar e a unidade atrás dela tampa a passagem). Agora é o custo até um tile **de onde a unidade consegue atacar** (linha reta, alcance pelo terreno, porta e parede bloqueiam), com inimigos bloqueando o caminho; sem nenhum tile assim, cai na distância simples + 6.
- [x] 🔴 **Última unidade fugindo até o empate** — atrás no placar a agressividade ia a 0,5 (medo ×2, avanço ×½). Agora o mínimo é 0,7 e, com 1–2 unidades e atrás, vale 1,3 ("última resistência"). A ousadia por rodada começa na 6ª (antes 8ª) e cresce +1 a cada 10 (antes 15).
- [x] 🔴 **Ao lado do inimigo, saía sem atacar** — o plano "bate e sai" existia, mas o contra-ataque esperado pesava tanto quanto o dano causado: numa troca equilibrada (Fighter × Fighter num corredor: +25 de dano, −25 de revide) a unidade só ia embora. Novo peso `counterShare` = 0,5 (bater primeiro vale por si: o alvo fica mais fácil para os aliados e revida mais fraco). Em 2.600 decisões simuladas, "podia atacar e saiu sem atacar" caiu de 20% para 9%; o que sobra é unidade com pouco HP diante de revide forte (aí fugir é o certo). Na força, neutro a levemente melhor (`yarn ai:tune`: Hard 55%, Normal 51% contra o peso antigo).
- [x] 🟡 **Medição** — `yarn ai:stall` ([tests/sim/stall.sim.ts](tests/sim/stall.sim.ts)): CPU × CPU do mesmo nível.

| Hard × Hard (64 partidas) | Antes | Depois |
|---|---|---|
| Empates | 11% | 0% |
| Fases do fim (time com 1–2 unidades) | 17 | 6 |
| Fases do fim com ataque | 32% | 85% |
| Turnos de unidade ao lado de porta | 16% | 8% |
| Maior sequência sem ataque | 90 | 5 |

## Ideias para depois

- Olhar um passo à frente (simular a melhor resposta do inimigo para os 2–3 melhores planos) no Hard.
- Coordenar dois atacantes no mesmo alvo antes de agir (hoje o foco sai da ordem gulosa).
- Personalidade escolhida pelo mapa (defensiva no Old Fortress, agressiva em campo aberto).
