# PixelWar

Jogo de batalhas táticas por turnos inspirado em Fire Emblem e Final Fantasy Tactics. Desenvolvido com TypeScript e [Excalibur.js](https://excaliburjs.com/).

**Jogar no navegador:** https://jeanomeg.github.io/pixelwar/

---

## Como jogar

### Objetivo

Elimine todas as unidades inimigas antes que eliminiem as suas. O jogo também termina se o limite de turnos for atingido.

### Modos de jogo

| Modo | Descrição |
|---|---|
| **Player vs CPU** | Você controla o time azul, a IA controla o time vermelho |
| **Player vs Player** | Dois jogadores se alternam no mesmo computador |
| **CPU vs CPU** | Assista dois times controlados pela IA se enfrentarem |

---

## Controles

| Ação | Como fazer |
|---|---|
| Selecionar unidade | Clique com o **botão esquerdo** sobre uma unidade aliada |
| Mover | Selecione **Move** no menu e clique na célula de destino |
| Atacar | Selecione **Attack** no menu e clique na unidade inimiga |
| Usar skill | Selecione **Skills** no menu e escolha a habilidade |
| Passar unidade | Selecione **Done** no menu |
| Passar turno | Selecione **Pass Turn** para encerrar o turno de todos |
| Ver alcance de movimento | Clique com o **botão direito** sobre qualquer unidade |
| Ver alcance de ataque | Clique com o **botão do meio** sobre qualquer unidade |

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

> Ataques de longa distância (Arqueiros, Magos, Lanceiros) só acertam alvos na **mesma linha ou coluna** e são bloqueados pela primeira unidade no caminho.

---

## Unidades

| Unidade | HP | ATK | DEF | Alcance | Movimento |
|---|---|---|---|---|---|
| **Archer** | 10 | 2 | 2 | 6 | 4 |
| **Mage** | 10 | 2 | 2 | 5 | 5 |
| **Spearman** | 10 | 4 | 2 | 2 | 6 |
| **Thief** | 10 | 5 | 2 | 1 | 6 |
| **Fighter** | 15 | 4 | 3 | 1 | 6 |
| **Cleric** | 20 | 3 | 4 | 1 | 6 |
| **Barbarian** | 20 | 5–6 | 4 | 1 | 4 |
| **Warrior** | 25 | 4 | 5 | 1 | 4 |

> O **Thief** atravessa portas e terrenos especiais com custo reduzido de movimento. **Arqueiros** e **Magos** podem atacar sobre água.

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
| **Terreno rápido** | Custa 1 ponto de movimento (em vez de 2) |
| **Água** | Intransponível para a maioria das unidades. Arqueiros e Magos podem atacar sobre ela. |
| **Porta** | Bloqueia passagem para a maioria das unidades, exceto o Thief |
| **Árvores / Obstáculos** | Bloqueiam movimento e linha de visão de ataques |

---

## Desenvolvimento

```
npm install
npm run dev     # inicia servidor de desenvolvimento
npm run build   # gera build de produção
```

**Stack:** TypeScript · Excalibur.js · Lit (Web Components) · Tiled (mapas)
