# PixelFantasyWar — Análise e checklist da IA

Arquivo principal: [src/computer-player.ts](src/computer-player.ts)
Marque `[x]` ao concluir. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa.

---

## Como a IA funciona hoje

1. `makeMove()` ordena as unidades por **HP crescente** (a mais fraca age primeiro) e chama `decideActionForUnit` para cada uma.
2. Para cada unidade, em loop até ter movido e atacado:
   - gera ações possíveis: `attack`, `skillSpecialAttack`, `skillRun`, `move`, `moveAndAttack`, `flee`, `wait`;
   - pontua cada uma em `evaluateAction`;
   - executa a de maior score; cada **tipo** de ação só é executado uma vez por unidade;
   - para se todos os scores forem ≤ 0.
3. Pontuações:

| Ação | Score |
|---|---|
| `attack` | `evaluateAttack` + 60 se a unidade for de alcance |
| `evaluateAttack` | 1000 se "mata"; senão `dano_estimado × 3 + HP perdido do alvo` |
| `skillSpecialAttack` | 1200 se o crítico mata e o ataque normal não; senão −1 |
| `move` | `100 / (dist² + 1)` + 200 se puder atacar de lá |
| `moveAndAttack` | `evaluateAttack + 0.2 × move` |
| `skillRun` | `move − 15` |
| `flee` | `dist² × 1.5` (só quando HP < 20% **e** em menor número) |
| `wait` | −10 |

---

## Diagnóstico

### Escala dos números está desbalanceada

`evaluateMove` usa `squareDistance` em **pixels** (1 tile = 64px). Por isso o termo de aproximação fica praticamente zero:

| Distância | Score de aproximação |
|---|---|
| 1 tile | 0,024 |
| 5 tiles | 0,001 |
| 10 tiles | 0,0002 |

Na prática, o único termo que importa no movimento é o **+200 de "posso atacar daqui"**. Isso gera dois efeitos:

- **A IA gasta MP com Run sem necessidade.** Um `skillRun` para uma célula de onde dá para atacar vale ≈ 185. Um `attack` normal sem kill vale algo como 24–80, e um `moveAndAttack` sem kill vale ≈ 64–90. Resultado: mesmo podendo atacar parada ou andando normalmente, a unidade **corre primeiro** (gasta 2 MP e fica sem a skill do turno) e só depois ataca.
- **Depois de atacar, a unidade continua se aproximando do inimigo**, porque o +200 vale também depois do ataque. Arqueiros e magos não recuam.

### Estimativa de dano otimista demais

`evaluateAttack` assume:

- **d6 = 6 sempre.** A média real com vantagem é **4,47**.
- **Acerto garantido.** A chance real (com vantagem) vai de ~58% (Archer/Mage contra Warrior) a ~88%.
- **Quando `ATK − DEF ≤ 0`, estima 6 de dano**, o que é maior do que o possível em alguns casos.

Consequências:

- A IA acha que mata quando não mata (score 1000 em um ataque com ~40% de chance de não matar).
- O **Special Attack quase nunca é usado**: como o ataque normal "já mata" na conta otimista, o crítico retorna −1.
- O crítico também tem um valor que a IA ignora: **acerto garantido contra alvos de defesa alta**.

### Ataque pelas costas é ignorado

É a mecânica de maior impacto do jogo (dano com 2×ATK e acerto garantido), mas a IA:

- não procura células atrás do inimigo para atacar;
- não evita deixar as próprias costas expostas.

Além disso, existe o bug de direção inicial descrito no [CHECKLIST.md](CHECKLIST.md): unidades do time B começam com `miniDirection = 'right'`.

### Distância em linha reta, não por caminho

`findClosestCell` e `evaluateMove` usam distância euclidiana. Em mapas com água e paredes, a IA escolhe o inimigo "mais perto" em linha reta, mesmo que o caminho até ele seja longo, e pode ficar presa andando contra obstáculos.

Detalhe: o inimigo de referência é o mais próximo da posição **atual** da unidade (`unit.cell.pos`), não da célula de destino. A expressão `destination.unit ?? unit` quase sempre resolve para `unit`.

### Sem noção de perigo

A IA não calcula o que os inimigos conseguem alcançar no próximo turno. Unidades frágeis (Archer/Mage com 10 HP) entram no alcance de vários inimigos de corpo a corpo sem custo nenhum no score.

### Fuga praticamente nunca acontece

`HP < 20%`: para unidades com 10 HP, isso só vale com 1 HP. Somado à exigência de estar em menor número, a fuga quase nunca é ativada.

### Ordem das unidades

A unidade mais fraca age primeiro. Isso empurra magos e arqueiros para a frente antes dos tanques e faz as unidades se bloquearem em corredores. Seria melhor agir primeiro quem pode matar, depois os tanques que abrem caminho, e por último os de alcance.

### Robustez do loop

- Se `executeAction` retornar `false`, o tipo não entra em `executedTypes`. Se a mesma ação continuar no topo, o `while` repete a ação indefinidamente (o risco é baixo hoje, mas existe).
- `findAttackableTargets` chama `selectionManger.selectUnit` só para que `findAttackRange` funcione (acoplamento com a seleção do jogador humano).
- O nome `selectionManger` está escrito errado.

### Performance

A cada iteração do loop, a IA recalcula tudo:

- `getRange` **dentro do loop de células** ([computer-player.ts:200](src/computer-player.ts#L200)), embora o resultado seja sempre o mesmo;
- um A* por célula alcançável;
- um `getRangeAttack` por célula;
- o range dobrado do Run, mais um A* por célula extra.

Com 8 unidades isso ainda é aceitável, mas não escala para mapas maiores.

### Outros

- Não há níveis de dificuldade nem aleatoriedade: em empates a escolha é sempre a mesma, o que deixa a IA previsível.
- Não há coordenação entre unidades (por exemplo, dois atacantes no mesmo alvo para garantir a kill, ou proteger aliados feridos).
- O `turnStart` sobrescrito não reseta as animações para idle, ao contrário do `Player.turnStart`.

---

## Checklist

### 1. Correções de pontuação (rápidas, grande impacto)

- [ ] 🔴 **Medir distância em tiles**, não em pixels², e normalizar o score de aproximação para uma faixa comparável aos outros (ex.: 0–50).
- [ ] 🔴 **Run só quando necessário:** só considerar `skillRun` se não houver `attack`/`moveAndAttack` disponível sem correr, ou se correr permitir uma kill que andar normalmente não permite.
- [ ] 🔴 **Depois de atacar, não dar bônus por "posso atacar daqui".** Unidades de alcance devem preferir recuar para fora do alcance inimigo; corpo a corpo podem segurar posição.
- [ ] 🔴 **Dano esperado realista:** usar média do d6 com vantagem (4,47), chance de acerto com vantagem e dano mínimo 1 no erro. Separar "kill garantida" de "chance de kill". **Pronto para usar:** `forecastAttack` em [combat.ts](src/combat.ts) já devolve `expectedDamage`, `hitChance` e `killChance` exatos (inclusive pelas costas e com Special); a UI usa a mesma função.
- [ ] 🟡 **Special Attack pela chance de kill:** usar quando a chance de matar com crítico for bem maior que a do ataque normal, ou contra alvos de defesa alta.
- [ ] 🟡 **Considerar Special Attack também depois de mover** (hoje só a partir da posição atual).
- [ ] 🟡 **Ajustar `shouldFlee`:** fugir com HP em valor absoluto baixo (ex.: ≤ dano esperado de 1 ataque inimigo), sem exigir menor número.

### 2. Ataque pelas costas

- [x] 🔴 **Corrigir antes a direção inicial das unidades** (item do [CHECKLIST.md](CHECKLIST.md)); sem isso, qualquer lógica de costas fica errada. Feito: o time 1 começa virado para a esquerda.
- [ ] 🔴 **Preferir atacar pelas costas:** em `moveAndAttack`, calcular a direção final do atacante e dar bônus quando ela for igual à do alvo (acerto garantido + dano 2×ATK).
- [ ] 🟡 **Evitar expor as costas:** penalizar posições onde um inimigo consegue chegar atrás da unidade no próximo turno.

### 3. Mapa de ameaça e posicionamento

- [ ] 🔴 **Mapa de ameaça:** no início do turno da IA, calcular para cada célula quantos inimigos conseguem atacá-la no próximo turno (movimento + alcance) e o dano esperado. Penalizar no `evaluateMove` proporcionalmente ao HP da unidade.
- [ ] 🟡 **Distância por caminho:** usar um "mapa de distância" (BFS/Dijkstra a partir dos inimigos, respeitando terreno e o custo da unidade) em vez da distância em linha reta.
- [ ] 🟡 **Papel por classe:**
  - Archer/Mage mantêm distância e procuram linha reta livre até o alvo.
  - Warrior/Cleric ficam na frente, protegendo os frágeis.
  - Thief usa portas e flanqueia pelas costas.
  - Barbarian/Fighter vão direto nos alvos frágeis.
- [ ] 🟢 **Valorizar terreno rápido e portas** no posicionamento (ex.: Thief segurando portas).

### 4. Coordenação do time

- [ ] 🟡 **Ordem de ação inteligente:** primeiro quem consegue matar, depois corpo a corpo, por último os de alcance (que se beneficiam de alvos já feridos e de linhas abertas).
- [ ] 🟡 **Foco de fogo:** guardar o dano já planejado no turno para cada alvo e somar ao avaliar, para escolher ataques que completem uma kill.
- [ ] 🟡 **Valor do alvo:** priorizar quem causa mais dano ou tem mais alcance (Archer, Mage, Barbarian), e não só quem tem menos HP.
- [ ] 🟢 **Não bloquear aliados:** evitar parar em corredores ou na frente da linha de tiro de um aliado de alcance.

### 5. Estrutura e robustez

- [ ] 🔴 **Marcar a ação como tentada mesmo quando falha** (`executedTypes.add` independente de `success`) ou limitar as iterações do `while`, para eliminar o risco de loop infinito.
- [x] 🟡 **Desacoplar do `SelectionManager`:** a IA deve chamar o `PathFinder` direto com a unidade dela, sem `selectUnit` como efeito colateral.
- [x] 🟡 **Ataque avaliado a partir de outra célula considerava a própria unidade bloqueando a linha.** Agora `getRangeAttack` recebe `ignore` com a célula atual da unidade.
- [ ] 🟡 **Extrair a pontuação para funções puras** (ex.: `src/ai/scoring.ts`) recebendo um "estado do tabuleiro" simples, para poder testar sem a engine.
- [ ] 🟡 **Pesos configuráveis** em um objeto (`AI_WEIGHTS`) em vez de números mágicos (1000, 1200, 200, 60, 15, 0.2…).
- [ ] 🟢 **Corrigir o nome** `selectionManger` → `selectionManager`.
- [ ] 🟢 **Resetar as animações para idle no `turnStart`**, como o `Player` base faz.

### 6. Performance

- [x] 🟡 **Calcular o range de movimento uma vez por iteração** (tirar o `getRange` de dentro do loop de células).
- [ ] 🟢 **Cachear `getRangeAttack` por célula** durante o turno da IA; invalidar só quando uma unidade se mover ou morrer. Prioridade baixa, porque o cálculo ficou ~600x mais barato.
- [x] 🟢 **Usar o próprio Dijkstra do range para obter caminhos**, em vez de rodar um A* por célula candidata. A IA usa um `MovementMap` para o movimento normal e outro para o Run.

### 7. Dificuldade e variedade

- [ ] 🟡 **Níveis de dificuldade** (Fácil/Normal/Difícil) controlando pesos, uso de skills, uso do mapa de ameaça e uma chance de escolher uma ação subótima. Adicionar a escolha na tela inicial.
- [ ] 🟢 **Pequena aleatoriedade** em empates de score, para a IA não ficar previsível.
- [ ] 🟢 **Personalidades** (agressiva, defensiva) por time ou por mapa.

### 8. Validação

- [ ] 🟡 **Log de decisão em modo debug:** para cada unidade, mostrar as 3 melhores ações com o score (ex.: `localStorage.debugAI = '1'`).
- [ ] 🟡 **Simulação sem gráficos:** rodar N partidas CPU vs CPU (IA nova contra IA antiga) e medir a taxa de vitória. Isso depende da extração da lógica de combate para funções puras (ver [CHECKLIST.md](CHECKLIST.md)).
- [ ] 🟢 **Testes unitários da pontuação:** "prefere kill", "não corre se pode atacar parado", "arqueiro recua depois de atacar", "prefere atacar pelas costas".

---

## Ordem sugerida

1. Corrigir a direção inicial das unidades e o risco de loop infinito.
2. Seção 1 inteira (escala de distância, Run, comportamento depois de atacar, dano esperado). Já muda bastante o comportamento com pouco código.
3. Ataque pelas costas (seção 2).
4. Extrair a pontuação para funções puras e adicionar o log de debug (seções 5 e 8).
5. Mapa de ameaça e distância por caminho (seção 3).
6. Coordenação, dificuldade e performance.
