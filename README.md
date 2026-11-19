# PixelFantasyWar

Jogo de batalhas táticas por turnos inspirado em Fire Emblem e Final Fantasy Tactics. Desenvolvido com TypeScript e [Excalibur.js](https://excaliburjs.com/).

**Jogar no navegador:** https://jeanomeg.github.io/pixelwar/

---

## Como jogar

### Objetivo

Elimine todas as unidades inimigas antes que eliminem as suas. Se o limite de 100 fases (50 rodadas) for atingido, a partida termina empatada.

### Modos de jogo

| Modo | Descrição |
|---|---|
| **Online** | Jogue (ou assista) contra um amigo em outro aparelho, pela internet |
| **Player vs CPU** | Você controla o time azul, a IA controla o time vermelho |
| **Player vs Player** | Dois jogadores se alternam no mesmo computador |
| **CPU vs CPU** | Assista dois times controlados pela IA se enfrentarem |

**Dificuldade da CPU** (na tela de modo, fica salva): **Easy** comete erros e quase não usa skills; **Normal** joga bem; **Hard** não erra e usa pesos ajustados por simulação. A IA planeja o turno inteiro de cada unidade (para onde ir, quem atacar, de que lado e com qual skill), prevê o que o seu exército pode fazer no turno seguinte para não deixar unidades expostas, recua arqueiros e magos depois de atirar, bate antes de recuar quando está colada num inimigo, procura ataques pelas costas age primeiro com quem pode matar, dá a volta quando um inimigo tampa uma porta e, com 1 ou 2 unidades sobrando, luta em vez de fugir. Cada CPU também ganha uma personalidade (equilibrada, agressiva ou defensiva). Em simulações nos 8 mapas, a IA Normal vence a IA anterior em ~85% das partidas, e a Hard vence a Normal em ~70%.

### Modo online

Dois jogadores, cada um no seu aparelho, mais até 8 espectadores. Não há servidor do jogo: os navegadores se encontram por servidores públicos (Nostr, via [Trystero](https://github.com/dmotz/trystero)) e depois trocam as jogadas **direto entre si** (WebRTC). Nada é gravado em lugar nenhum.

> **Jogue no Wi-Fi.** Como a conexão é direta entre os aparelhos, algumas redes móveis (4G/5G) e redes de empresa bloqueiam a ligação. Se não conectar, troque para o Wi-Fi.

- **Nome:** cada um digita o seu ao entrar em **Online** (fica salvo). Ele aparece no placar, no banner do turno ("Ana's turn") e no fim da partida.
- **Salas:** toda sala tem um **código** de 5 letras/números (sem 0/O e 1/I/L, para não confundir). Uma sala **aberta** (padrão) aparece na lista **Open rooms** da tela Online, para jogar (se a vaga estiver livre) ou assistir; se uma sala nova demorar a aparecer, clique em **Refresh**. Uma sala **trancada** (cadeado) não aparece na lista: só entra quem tem o código, para jogar ou assistir (bom para torneio privado).
- **Lobby:** quem cria a sala é o dono: escolhe o mapa, tranca/destranca e pode remover alguém (Kick). O dono joga de **Azul** (começa). Cada jogador monta o próprio exército (100 pontos); o do outro fica escondido até os dois clicarem **Ready**.
- **Turno de 5 minutos:** o relógio fica no painel central do topo (contagem + barra que esvazia, vermelha nos últimos 15 s). Acabou o tempo, o turno termina sozinho. Se do outro lado nada chegar 15 s depois, aparece "*Fulano* is not responding" com **Wait** ou **Leave** (sair dá a vitória a quem ficou).
- **Pausa:** só para quem pausou; o jogo do outro continua. Sair pelo menu da pausa é desistir (o outro vence).
- **Queda de conexão:** o relógio para e o outro vê "Connection lost". Recarregar a página volta para a mesma vaga e a partida continua de onde parou. Sem voltar em 3 minutos, o outro vence.
- **Espectadores:** podem entrar no lobby ou no meio da partida (o jogo reaplica tudo o que já aconteceu). Veem os dois exércitos, passam o mouse/tocam para ver cards e alcances, mas não controlam nada.
- **Emotes:** botão **Say...** no topo (ou teclas 1–6): "Nice!", "Oops", "Good luck", "GG", "Hmm...", "Hurry up!". Um a cada 3 s; dá para silenciar no menu da pausa.
- **Revanche:** **Rematch** no fim; começa quando os dois pedirem. Volta ao lobby com as cores trocadas.
- **Dados:** quem ataca sorteia os dados e manda o resultado; os outros calculam o mesmo ataque. No fim de cada turno os aparelhos comparam o tabuleiro; se divergir, a partida acaba sem resultado.

### Menu inicial

**Play** → escolha o modo → escolha o mapa (ou **Random map**) → **Start**. O seletor mostra uma prévia de cada mapa com as posições iniciais das unidades, o tamanho, quantas unidades cada time tem e o limite de rodadas. Use ↑/↓ e Enter, ou o mouse. O jogo lembra o último modo e mapa escolhidos.

O menu também tem **How to play** (regras resumidas), **Units** (as 8 classes, com atributos e habilidades especiais) e **Credits**.

### Mapas

| Mapa | Descrição |
|---|---|
| **Twin Keeps** | Duas fortalezas frente a frente, campo aberto no meio com bosques, lagos e pontes |
| **River Isles** | Exércitos em ilhas ligadas por pontes estreitas; o prado central é o ponto-chave |
| **Greenwood** | Campo aberto com bosques e pedras como cobertura e um laguinho com ponte no centro |
| **Split River** | Um rio corta o mapa ao meio; só três pontes estreitas, mas arqueiros e magos atiram por cima da água |
| **Crater Lake** | Um grande lago central com uma ponte longa e passagens rochosas ao norte e ao sul |
| **Old Fortress** | Uma fortaleza abandonada no meio do campo; as portas são a única entrada e o pátio com pilares é o prêmio |
| **Riverside Village** | Uma vila cortada por um rio, com casas, jardins e praças de pedra nas duas pontes |
| **Ruined Temple** | Muros quebrados e pilares em volta de um altar; torres de vigia protegem os arqueiros de cada lado |
| **Desert Oasis** | Deserto em volta de um oásis; o lago divide o campo em duas rotas, com cactos e pedras como única cobertura |
| **Frozen Pass** | Campo de neve entre dois vales verdes; o lago congelado dá para atravessar a pé e pinheiros nevados estreitam o caminho |
| **Hamlet Ford** | Dois povoados de fazenda separados por um rio, com duas pontes de madeira e uma de pedra |
| **Fallen Citadel** | Muralhas quebradas de uma cidadela em volta de altares gêmeos; brechas dos dois lados e torres de vigia em cada acampamento |

---

## Controles

| Ação | Como fazer |
|---|---|
| Selecionar unidade | Clique com o **botão esquerdo** sobre uma unidade aliada |
| Mover | Selecione **Move** no menu e clique na célula de destino |
| Atacar | Selecione **Attack** no menu e clique na unidade inimiga |
| Usar skill | Selecione **Skills** no menu e escolha a habilidade |
| Encerrar a unidade | Selecione **Wait** no menu |
| Encerrar o turno | Botão **End turn** no topo da tela (pede confirmação se ainda houver unidades com ações) |
| Cancelar | **Esc** fecha o menu ou sai do modo mover/atacar (o MP de uma skill não usada é devolvido) |
| Ver alcance de movimento | Clique com o **botão direito** sobre qualquer unidade |
| Ver alcance de ataque | Clique com o **botão do meio** sobre qualquer unidade |
| Ver alcance de um inimigo | Clique com o **botão esquerdo** sobre um inimigo (ou unidade que já agiu): movimento; clique de novo: ataque |
| Pular o anúncio de fase | Clique na tela ou aperte **Esc** |
| Pausar | Botão **⏸** no topo da tela (ou **P**, ou **Esc** sem nada para cancelar). No menu de pausa: **Resume** continua, **Main menu** (pede confirmação) encerra a partida e volta ao menu principal |
| Desfazer movimento | **Undo move** no menu, enquanto a unidade não atacou (devolve o MP do Run) |
| Velocidade | Botão **x1/x2/x3** no topo: acelera animações e o turno da CPU (fica salvo) |
| Zoom | **Roda do mouse** aproxima/afasta o mapa na direção do cursor, aos poucos, de 1× (visão padrão, mínimo) a 2×. Só o mapa, as unidades e o menu da unidade aumentam; com zoom, o cursor do teclado arrasta a câmera junto |
| Esconder a interface | Botão de **olho** acima do botão de som (ou **H**): esconde/mostra as barras do topo (times, pausa, velocidade, End turn), a dica e o card da unidade, para ver o mapa inteiro. O menu da unidade continua aparecendo |

### Teclado

| Tecla | Ação |
|---|---|
| **Setas** / **WASD** | Movem o cursor no mapa |
| **Enter** / **Espaço** | Age na célula do cursor (como o clique esquerdo) |
| **Tab** / **Shift+Tab** | Vai para a próxima/anterior unidade que ainda pode agir |
| **R** / **F** | Mostra o alcance de movimento/ataque da unidade sob o cursor |
| **E** | Encerra o turno (pede confirmação se ainda houver unidades com ações) |
| **P** | Pausa |
| **H** | Esconde/mostra a interface (barras, dica e card) |
| **T** | Abre/fecha as mensagens rápidas (online) |
| **Esc** | Fecha o menu, cancela, pula o anúncio de fase ou pausa |
| Menu da unidade | **↑/↓** escolhem, **→/←** abrem/fecham as skills, **Enter** confirma |

### Controle (gamepad)

Funciona com controles de Xbox, PlayStation, Switch Pro e a maioria dos controles USB/Bluetooth, no computador e no celular/tablet. Basta apertar qualquer botão: as dicas passam a mostrar os botões do controle em uso (A/B/X/Y, ✕/◯/▢/△ ou os do Nintendo). Dá para jogar do menu ao fim da partida sem mouse; nos menus o direcional anda entre os botões (contorno branco).

| Botão (Xbox / PlayStation) | Na partida | Nos menus |
|---|---|---|
| **D-pad** / **analógico esquerdo** | Move o cursor (segurar repete) | Anda entre os botões |
| **A** / ✕ | Seleciona e age | Aperta o botão |
| **B** / ◯ | Cancela, fecha o menu | Volta |
| **Y** / △ e **X** / ▢ | Alcance de movimento / de ataque | — |
| **LB**/**RB** (L1/R1) | Unidade anterior/próxima que pode agir | — |
| **LT**/**RT** (L2/R2) | Zoom (na direção do cursor) | — |
| **Analógico direito** | Move a câmera | Rola listas e páginas |
| **Start** (Options) | Pausa / continua | Confirma (inicia a partida, confirma o exército) |
| **View**/**Select** (Share) | Encerra o turno (com a mesma confirmação) | — |
| **Clique do analógico esquerdo** | Esconde/mostra a interface | — |
| **Clique do analógico direito** | Mensagens rápidas (online) | — |

Limite do navegador: a tela cheia e o primeiro som ainda precisam de um toque ou clique (o PLAY! da tela de carregamento). Nome e código de sala no online são digitados pelo teclado do computador ou do celular.

### Celular e tablet

O jogo roda em telas de toque, **na horizontal** (com o aparelho de pé aparece um aviso para girá-lo). A tela cheia é escolha do jogador: a partir do menu principal, o botão ao lado do de som, no canto inferior esquerdo, liga e desliga a tela cheia (também no computador; entrar trava o aparelho na horizontal). No iPhone o navegador não permite tela cheia: o mesmo botão explica como jogar sem as barras do Safari, adicionando o jogo à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abrindo pelo ícone. No Android também dá para instalar o jogo ("Instalar app" / "Adicionar à tela inicial"), que abre em tela cheia.

| Ação | Como fazer |
|---|---|
| Selecionar unidade | **Toque** numa unidade aliada para abrir o menu |
| Mover / Atacar | O primeiro toque no destino (ou no inimigo) mostra o caminho (ou a prévia do combate); **toque de novo no mesmo lugar** para confirmar |
| Cancelar | Toque fora das células destacadas, ou fora do menu para fechá-lo |
| Ver alcance | Toque num inimigo: movimento; toque de novo: ataque |
| Zoom | **Pinça** com dois dedos (até 2×; arrastar com dois dedos também move o mapa). Com zoom, **arraste com um dedo** para mover o mapa. O toque só vale ao soltar o dedo sem arrastar |
| Pular o anúncio de fase | Toque na tela |

### Interface

- **Topo:** os dois times (unidades vivas e HP total), pausa, velocidade (x1/x2/x3), a rodada, de quem é a vez e o botão **End turn**.
- **Skill usada:** quando uma unidade (sua ou da CPU) usa uma skill, o nome e o custo aparecem em cima dela (ex.: "Guard -2 MP"). Só aparece se a skill for de fato executada: escolher e cancelar não mostra nada.
- **Barra de HP** embaixo de cada unidade no mapa (verde, amarela abaixo de 50%, vermelha abaixo de 25%).
- **Card da unidade:** passe o mouse sobre qualquer unidade para ver HP, MP, atributos (em verde/vermelho quando uma skill ou a floresta os altera), o alcance em tiles, para onde ela está virada e o estado no turno.
- **Prévia de combate:** no modo de ataque, passe o mouse sobre um inimigo ao alcance para ver a chance de acerto, a faixa de dano, a chance de matar, se o ataque é pelas costas e o contra-ataque que você vai levar se ele sobreviver.
- **Rodapé:** dica do que fazer no momento.

---

## Sistema de combate

Cada ataque envolve três rolagens:

- **D20** — teste de acerto. O atacante soma seu **ATK + D20** contra a **DEF + 10** do defensor. Se o resultado for maior, o ataque acerta.
- **D6** — dano base. Somado ao ATK e subtraído pela DEF do defensor.
- **Vantagem** — todos os dados são rolados duas vezes e o maior valor é usado.

### Situações especiais

| Situação | Efeito |
|---|---|
| **Golpe crítico** (D20 = 20) | Dano fixo de **12 + ATK - DEF** (ignora o D6) |
| **Ataque pelas costas** | Atacante e defensor estão virados na mesma direção. Dano: **D6 + ATK×2 - DEF** |
| **Sempre acerta** | Golpe crítico e ataque pelas costas acertam independente do teste |
| **Erro** | Um ataque que erra ainda causa **1 de dano** |
| **Contra-ataque** | Uma unidade corpo a corpo (alcance 1) que sobrevive revida uma vez contra um atacante adjacente, com um ataque normal, e se vira para ele. **Não há contra-ataque depois de um ataque pelas costas**, nem de unidades de alcance 2 ou mais (exceto o Halberdier com Brace) |
| **Floresta** | Quem está num tile de floresta recebe **+2 DEF** |

> Todo ataque é em **linha reta** (mesma linha ou coluna) e para na primeira unidade do caminho; aliados bloqueiam a linha de tiro. Paredes, árvores e portas também bloqueiam. Uma unidade parada em uma porta não pode atacar.
>
> O alcance é medido em pontos: cada tile custa 1 ponto. Para **Archer, Mage, Spearman, Ranger e Necromancer**, tiles de floresta e de água custam 2 pontos. Por exemplo, o Arqueiro (alcance 6) atinge 6 tiles em campo aberto, mas só 3 sobre floresta ou água. O card da unidade mostra isso em tiles.

---

## Unidades

| Unidade | HP | ATK | DEF | Alcance | Movimento | Custo | Skill própria |
|---|---|---|---|---|---|---|---|
| **Archer** | 10 | 2 | 2 | 6 | 4 | 9 | Aimed Shot |
| **Mage** | 10 | 2 | 2 | 5 | 5 | 8 | Fireball |
| **Spearman** | 10 | 4 | 2 | 2 | 5 | 8 | Pierce |
| **Thief** | 10 | 5 | 2 | 1 | 6 | 10 | Steal |
| **Fighter** | 15 | 4 | 3 | 1 | 6 | 12 | Second Wind |
| **Cleric** | 20 | 3 | 4 | 1 | 6 | 15 | Heal |
| **Barbarian** | 20 | 5 | 4 | 1 | 4 | 17 | Rage |
| **Warrior** | 25 | 4 | 5 | 1 | 4 | 21 | Guard |
| **Paladin** | 18 | 4 | 4 | 1 | 5 | 15 | Shield Wall |
| **Berserker** | 16 | 7 | 2 | 1 | 5 | 17 | Frenzy |
| **Assassin** | 8 | 6 | 1 | 1 | 7 | 9 | Backstab |
| **Ranger** | 10 | 3 | 2 | 5 | 5 | 11 | Pinning Shot |
| **Necromancer** | 8 | 4 | 2 | 4 | 4 | 8 | Drain |
| **Halberdier** | 14 | 4 | 3 | 2 | 4 | 12 | Brace |

> **Thief**, **Assassin** e **Ranger** pagam só 1 ponto de movimento na floresta (portas continuam custando 2). **Archer**, **Mage**, **Ranger** e **Necromancer** podem mirar em tiles de água. O **Halberdier** tem alcance 2 em qualquer terreno. As classes de alcance 1 contra-atacam.
>
> Os custos saem da matemática real de combate (dano médio causado e recebido, contra-ataques, floresta, mobilidade e alcance), escalados para que as 8 classes originais somem 100. Vida/defesa e mobilidade a mais rendem cada vez menos (retorno decrescente), medido em milhares de partidas CPU × CPU com exércitos aleatórios: `yarn balance` mostra a conta e `yarn balance:sim` confere em partidas.

### Montando o exército

Antes de cada partida você escolhe a classe de cada uma das 8 posições iniciais do seu time, gastando até **100 pontos** (custo na tabela acima). O botão **Classic army** volta para o exército desenhado no mapa, que custa exatamente 100. Todos os times passam pela tela de montagem, na ordem Azul → Vermelho, inclusive a CPU (e no CPU vs CPU, para testar listas de exército em partidas IA vs IA). Para a CPU a tela já vem com uma sugestão sorteada: cada posição mantém o papel da classe desenhada no mapa (de longe, alcance 2, flanco, corpo a corpo ou pesado) e recebe uma classe sorteada desse papel. O botão **Random** sorteia outra lista válida.

---

## Skills

Cada unidade possui **4 PM (Pontos de Magia)** e pode usar **uma skill por turno**. Todas têm **Run** e **Special**, e cada classe tem uma skill própria. Skills de movimento/ataque só valem para o próximo movimento/ataque; se ele for cancelado, o PM volta. Efeitos "até o próximo turno" acabam quando começa o próximo turno do dono.

| Skill | Classe | Custo | Efeito |
|---|---|---|---|
| **Run** | Todas | 2 PM | Move o dobro da distância normal (sem ter movido nem atacado). Pode atacar depois. |
| **Special** | Todas | 4 PM | O próximo ataque é sempre um golpe crítico. |
| **Aimed Shot** | Archer | 2 PM | O próximo ataque não erra e causa +3 de dano. |
| **Fireball** | Mage | 2 PM | O próximo ataque também queima o alvo (acertando ou não) e cada inimigo ao lado dele em 2 de dano. |
| **Pierce** | Spearman | 2 PM | O próximo ataque ignora a DEF do alvo (armadura e floresta). |
| **Steal** | Thief | 2 PM | O próximo ataque, se acertar, rouba até 2 PM do alvo. |
| **Second Wind** | Fighter | 2 PM | Recupera 6 HP. |
| **Heal** | Cleric | 2 PM | Recupera 6 HP dele ou de um aliado adjacente (escolha o alvo no mapa). |
| **Rage** | Barbarian | 2 PM | O próximo ataque causa +5 de dano se acertar. |
| **Guard** | Warrior | 2 PM | +4 DEF até o próximo turno dele. |
| **Shield Wall** | Paladin | 2 PM | Ele e os aliados adjacentes ganham +2 DEF até o próximo turno dele. |
| **Frenzy** | Berserker | 2 PM | +4 ATK e −1 DEF até o próximo turno dele. |
| **Backstab** | Assassin | 4 PM | O próximo ataque conta como ataque pelas costas (acerto garantido, ATK dobrado, sem contra-ataque). |
| **Pinning Shot** | Ranger | 2 PM | Se o próximo ataque acertar, causa +2 de dano e o alvo não pode se mover no próximo turno dele. |
| **Drain** | Necromancer | 2 PM | O próximo ataque causa +2 de dano se acertar e cura o Necromancer pelo dano causado. |
| **Brace** | Halberdier | 2 PM | +2 DEF e contra-ataca a até 2 tiles, até o próximo turno dele. |

> PM não se regenera durante a batalha — use com estratégia.
>
> Toda skill custa **2 PM** (dá para usar duas vezes por partida) ou **4 PM** (uma vez). O Special (4 PM) é a régua: ele rende cerca de 7,5 de dano a mais, e cada skill de 2 PM foi ajustada para render perto da metade disso.

---

## Terreno

| Tipo | Efeito |
|---|---|
| **Campo aberto** (grama, terra, pedra) | Custa 1 ponto de movimento |
| **Floresta** | Custa 2 pontos de movimento (1 para Thief, Assassin e Ranger) e dá **+2 DEF** a quem está nela |
| **Água** | Ninguém atravessa andando. Ataques passam por cima dela. |
| **Porta** | Todos passam, com custo 2. Bloqueia a linha de ataque, e quem está sobre ela não pode atacar nem ser atacado. |
| **Árvores / Paredes** | Bloqueiam movimento e linha de ataque |

> O movimento é só nas 4 direções (sem diagonal). As unidades passam por cima de aliados, mas não param sobre eles; inimigos bloqueiam a passagem. O caminho escolhido é sempre o mais barato e, entre os de mesmo custo, o com menos curvas.

---

## Desenvolvimento

O projeto usa **yarn**.

```
yarn install
yarn dev        # servidor de desenvolvimento (Parcel)
yarn validate   # tipos + lint + testes (rode antes de publicar)
yarn test       # testes (Vitest)
yarn balance    # tabela de custos das classes calculada pela matemática de combate
yarn ai:sim     # partidas CPU vs CPU sem gráficos (IA atual × anterior e entre dificuldades)
yarn build      # gera o build em docs/ e FAZ COMMIT de tudo que estiver no working tree
```

Para testar o modo online sem rede, abra o jogo com `?localnet` no endereço (ex.: `http://localhost:1234/?localnet`) em várias abas do mesmo navegador: as salas passam a funcionar só entre essas abas.

> ⚠️ `yarn build` roda `git add .` e cria o commit "- Build deploy" sozinho. Confira o `git status` antes.

**Stack:** TypeScript · Excalibur.js · Lit (Web Components) · Tiled (mapas)
