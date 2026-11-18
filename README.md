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
| **Player vs CPU** | Você controla o time azul, a IA controla o time vermelho |
| **Player vs Player** | Dois jogadores se alternam no mesmo computador |
| **CPU vs CPU** | Assista dois times controlados pela IA se enfrentarem |

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
| Pausar | Botão **⏸** no topo da tela (ou **Esc** sem nada para cancelar). No menu de pausa: **Resume** continua, **Main menu** (pede confirmação) encerra a partida e volta ao menu principal |

### Celular e tablet

O jogo roda em telas de toque, **na horizontal** (com o aparelho de pé aparece um aviso para girá-lo). Ele entra em tela cheia e gira para a horizontal no primeiro toque e ao começar a partida, onde o navegador permite (no iPhone não). O botão ao lado do de som, no canto inferior esquerdo, liga e desliga a tela cheia (também no computador).

| Ação | Como fazer |
|---|---|
| Selecionar unidade | **Toque** numa unidade aliada para abrir o menu |
| Mover / Atacar | O primeiro toque no destino (ou no inimigo) mostra o caminho (ou a prévia do combate); **toque de novo no mesmo lugar** para confirmar |
| Cancelar | Toque fora das células destacadas, ou fora do menu para fechá-lo |
| Ver alcance | Toque num inimigo: movimento; toque de novo: ataque |
| Pular o anúncio de fase | Toque na tela |

### Interface

- **Topo:** os dois times (unidades vivas e HP total), a rodada, de quem é a vez e o botão **End turn**.
- **Card da unidade:** passe o mouse sobre qualquer unidade para ver HP, MP, atributos, para onde ela está virada e o estado no turno.
- **Prévia de combate:** no modo de ataque, passe o mouse sobre um inimigo ao alcance para ver a chance de acerto, a faixa de dano, a chance de matar e se o ataque é pelas costas.
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

> Todo ataque é em **linha reta** (mesma linha ou coluna) e para na primeira unidade do caminho; aliados bloqueiam a linha de tiro. Paredes, árvores e portas também bloqueiam. Uma unidade parada em uma porta não pode atacar.
>
> O alcance é medido em pontos: cada tile custa 1 ponto. Para **Arqueiros, Magos e Lanceiros**, tiles de terreno lento (incluindo água) custam 2 pontos. Por exemplo, o Arqueiro (alcance 6) atinge 6 tiles em terreno rápido, mas só 3 em terreno lento.

---

## Unidades

| Unidade | HP | ATK | DEF | Alcance | Movimento | Custo |
|---|---|---|---|---|---|---|
| **Archer** | 10 | 2 | 2 | 6 | 4 | 9 |
| **Mage** | 10 | 2 | 2 | 5 | 5 | 9 |
| **Spearman** | 10 | 4 | 2 | 2 | 6 | 8 |
| **Thief** | 10 | 5 | 2 | 1 | 6 | 9 |
| **Fighter** | 15 | 4 | 3 | 1 | 6 | 12 |
| **Cleric** | 20 | 3 | 4 | 1 | 6 | 16 |
| **Barbarian** | 20 | 5 | 4 | 1 | 4 | 16 |
| **Warrior** | 25 | 4 | 5 | 1 | 4 | 21 |
| **Paladin** | 18 | 4 | 4 | 1 | 5 | 15 |
| **Berserker** | 16 | 7 | 2 | 1 | 5 | 14 |
| **Assassin** | 8 | 6 | 1 | 1 | 7 | 8 |
| **Ranger** | 10 | 3 | 2 | 5 | 5 | 12 |
| **Necromancer** | 8 | 4 | 2 | 4 | 4 | 8 |
| **Halberdier** | 14 | 4 | 3 | 2 | 4 | 11 |

> **Thief**, **Assassin** e **Ranger** pagam só 1 ponto de movimento em terreno lento (portas continuam custando 2). **Archer**, **Mage**, **Ranger** e **Necromancer** podem mirar em tiles de água. O **Halberdier** tem alcance 2 em qualquer terreno.

### Montando o exército

Antes de cada partida você escolhe a classe de cada uma das 8 posições iniciais do seu time, gastando até **100 pontos** (custo na tabela acima). O botão **Classic army** volta para o exército desenhado no mapa, que custa exatamente 100. No modo Player vs Player, cada jogador monta o seu; a CPU usa o exército do mapa.

---

## Skills

Cada unidade possui **4 PM (Pontos de Magia)** e pode usar **uma skill por turno**.

| Skill | Custo | Condição | Efeito |
|---|---|---|---|
| **Run** | 2 PM | Sem mover ou atacar ainda | Move o dobro da distância normal. Pode atacar depois. |
| **Special Attack** | 4 PM | Sem atacar ainda | O próximo ataque é sempre um golpe crítico. |

> PM não se regenera durante a batalha — use com estratégia.

---

## Terreno

| Tipo | Efeito |
|---|---|
| **Terreno rápido** | Custa 1 ponto de movimento |
| **Terreno lento** | Custa 2 pontos de movimento (1 para o Thief) |
| **Água** | Ninguém atravessa andando. Ataques passam por cima dela. |
| **Porta** | Todos passam, com custo 2. Bloqueia a linha de ataque, e quem está sobre ela não pode atacar nem ser atacado. |
| **Árvores / Paredes** | Bloqueiam movimento e linha de ataque |

> O movimento é só nas 4 direções (sem diagonal). As unidades passam por cima de aliados, mas não param sobre eles; inimigos bloqueiam a passagem. O caminho escolhido é sempre o mais barato e, entre os de mesmo custo, o com menos curvas.

---

## Desenvolvimento

```
npm install
npm run dev     # inicia servidor de desenvolvimento
npm run build   # gera build de produção
```

**Stack:** TypeScript · Excalibur.js · Lit (Web Components) · Tiled (mapas)
