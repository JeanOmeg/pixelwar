# Controle (gamepad) — plano

Jogar o jogo inteiro só com um controle (Xbox, PlayStation, Switch Pro, genéricos), no desktop e no celular/tablet, sem tirar nada do mouse, toque e teclado.

Legenda: 🔧 decisão tomada (dá para mudar antes de implementar) · ❓ precisa da sua resposta

---

## Dá para fazer?

**Sim.** O navegador já tem a **Gamepad API** (`navigator.getGamepads()`), e ela funciona onde o jogo roda:

| Onde | Funciona? | Observação |
|---|---|---|
| Chrome / Edge / Firefox no PC | ✅ | USB ou Bluetooth. Xbox e PlayStation vêm com o mapeamento `standard` (botões na mesma posição) |
| Safari no Mac | ✅ | Xbox, PlayStation, MFi |
| Chrome no Android | ✅ | Bluetooth ou USB-C (OTG) |
| Safari no iPhone/iPad | ✅ | Xbox, PlayStation e MFi pelo Bluetooth (iOS 13+) |

Limites do navegador (não temos como mudar):
- O controle só "aparece" para a página **depois do primeiro botão apertado** (privacidade). Antes disso não dá para saber que ele existe.
- Apertar um botão do controle **não conta como gesto do usuário**. Então **tela cheia** e o **primeiro som** (desbloqueio de áudio) ainda precisam de um toque ou clique na tela. No PC isso quase não aparece. No celular é um toque, no PLAY! do loader.
- Só funciona em página segura (`https` ou `localhost`). O GitHub Pages já é `https`.

**Por que não é um trabalho enorme:** a partida já é jogável inteira pelo teclado (cursor por setas, Enter, Esc, Tab, R/F, E, P e o menu da unidade com setas). O controle pode apertar as mesmas "teclas". O trabalho novo de verdade é: ler o controle, navegar nos **menus** (que hoje dependem de mouse ou Tab) e mostrar os **botões do controle** nas dicas.

**Como ficou:** o controle "aperta" as teclas que o jogo já entende (setas, Enter, Esc, Tab, R/F, E, P, H, T), enviadas ao elemento focado. Só o que o teclado não tinha (andar entre os botões dos menus, câmera, dicas) é código novo. Arquitetura no CLAUDE.md, seção "Controle / gamepad".

---

## Botões

Nomes do Xbox; no PlayStation A = ✕, B = ◯, X = ▢, Y = △.

| Botão | Na partida | Nos menus |
|---|---|---|
| D-pad / analógico esquerdo | Move o cursor 1 tile (segurar repete) | Anda entre os botões |
| **A** | Confirmar (= Enter); pula o anúncio de fase | Aperta o botão em foco |
| **B** | Cancelar / fechar menu (= Esc) | Voltar (= Esc) |
| **X** | Alcance de ataque (= F) | — |
| **Y** | Alcance de movimento (= R) | — |
| **LB / RB** | Unidade anterior / próxima que pode agir (= Shift+Tab / Tab) | — |
| **LT / RT** | Zoom − / + (rumo ao cursor) | — |
| Analógico direito | Move a câmera | Rola listas e páginas |
| **Start / Options** | Pausa e continua (= P) | Confirma (= Enter: inicia a partida, confirma o exército) |
| **View / Share / Select** | End turn (= E, com a confirmação de hoje) | — |
| L3 | Esconder/mostrar a HUD (= H) | — |
| R3 | Mensagens rápidas do online (= T, tecla nova) | — |

- [x] Mapeamento aprovado, com End turn no **View/Select**.
- [x] Emotes no online: **R3** abre a lista (padrão de "quick chat"), D-pad escolhe, A envia, B fecha. O teclado ganhou o mesmo atalho (**T**).
- [x] Controle Nintendo: segue a **posição** (botão de baixo = confirmar), como o mapeamento `standard` do navegador entrega; as dicas mostram as letras do Nintendo.
- [x] Repetição ao segurar: 1ª em 300 ms, depois a cada 110 ms. Analógico esquerdo vale como direcional a partir de 0,5; zona morta do direito e dos gatilhos 0,2.
- Mudança em relação à proposta: **Y no exército** (Random) e **LB/RB nos menus** ficaram de fora. Random, Classic army e as páginas são alcançados pelo direcional como qualquer botão, e a Units é uma página única (rola com o analógico direito).

---

## Infra (código)

- [x] `src/gamepad/gamepad-input.ts`: lê `navigator.getGamepads()` com `requestAnimationFrame` **próprio** (funciona com a pausa, que para o relógio da engine). Junta todos os controles conectados.
- [x] Mudança em relação ao plano: em vez de "intenções" chamando métodos, cada botão vira um **keydown sintético** no elemento focado. Reaproveita todo o tratamento de teclado (inclusive menu da unidade, seletor de mapas, Esc em todas as telas) e o que funciona no teclado funciona no controle. Seta que ninguém tratou vira navegação de foco.
- [x] Parte pura em `src/gamepad/controller.ts` e `pickInDirection` (focus-nav), com testes (`tests/gamepad.test.ts`).
- [x] `gamepadconnected`/`gamepaddisconnected`: o laço só roda com controle conectado.
- [x] Nada a desligar por partida: o módulo vive a sessão inteira e só envia teclas; o que é da partida (GameUI) já se desliga no `destroy`. O `GameUI` cancela a inscrição no modo de entrada no `destroy`.
- [x] Modo de entrada atual (`mouse | touch | keyboard | gamepad`): `inputMode()`/`onInputModeChange`, classe `input-gamepad` no `<html>`.

## Menus: navegação por foco

- [x] Navegador de foco genérico (`src/gamepad/focus-nav.ts`): atravessa os shadow roots e só considera o que está visível e por cima (`elementFromPoint`), então um diálogo aberto prende o foco.
- [x] Foco visível: anel dourado (`.pad-focus`), um `div` fixo que segue o elemento focado, só no modo controle. Mudança em relação ao plano: não deu para usar `:focus-visible`, porque o navegador não mostra para foco feito por script e os componentes têm estilos de foco diferentes.
- [x] Ao abrir uma tela ou diálogo, o foco vai para o botão principal (`.resume`, `.primary`, `.confirm`) ou para o primeiro.
- [x] B = voltar em todas as telas (é o Esc delas).
- [x] Listas roladas: botão fora da área visível conta como se estivesse na borda e só é alcançado de dentro da lista (do Confirm, ↑ vai ao card visível; dentro da grade, ↓ desce rolando). Cards desabilitados (classe acima do orçamento) são pulados.
- [x] Testado com controle falso: título, modo, mapa, exército (grade de classes, slots, Confirm), Units (rola), pausa, online (emotes).
- [x] Texto no online: digitado pelo teclado do computador ou do celular. A num campo de texto não faz nada; B ou o direcional saem dele.
- [ ] Lista de salas e lobby do online navegados só com o controle (são botões comuns, devem funcionar; **não testado** com o controle falso).

## Partida

- [x] Cursor pelo controle (setas): `moveCursor` → `ensureVisible` → card. Sem cursor, o primeiro direcional vai para uma unidade.
- [x] A abre o `unit-menu` com foco no 1º item ativo; D-pad navega, → abre Skills, B fecha.
- [x] Mover/atacar/curar: A confirma direto (sem o toque duplo do celular).
- [x] Zoom (LT/RT, rumo ao cursor) e câmera (analógico direito): `CameraController.padControl`, bloqueado com pausa, banner e fim.
- [x] Tabuleiro espelhado: ←/→ seguem a tela (vem do teclado).
- [x] Fora da vez do jogador local: igual ao teclado (cursor parado, nada acontece).
- [x] Start abre e fecha a pausa; A pula o anúncio de fase.
- [x] **Sem vibração.**

## Dicas e ícones na tela

- [x] No modo controle a `game-hint` mostra os botões: "Ⓐ select · Ⓨ move range · Ⓧ attack range · LB RB units · View end turn · Menu pause" (e as variantes de menu, mover, atacar, curar e emotes).
- [x] Ícones de acordo com o controle (`controllerFamily` pelo `gamepad.id`): Xbox A/B/X/Y, PlayStation ✕/◯/▢/△ (com as cores), Nintendo B/A/Y/X, desconhecido = Xbox. Desenhados como botões claros com sombra dura no `game-hint` (sintaxe `{A}`).
- [x] How to play: seção "Controller".
- [ ] Dicas de teclado dos menus ("Enter confirm · Esc back" no exército, "Esc back" no modo) continuam aparecendo no modo controle. Ficou para depois: estão dentro de shadow roots e o `:host-context` não funciona no Firefox nem no Safari.

## Celular e tablet com controle

- [x] No modo controle o `GameUI` para de agir como toque: dicas do controle e card no lado do time.
- [x] Tocar na tela troca o modo de volta para `touch`.
- [x] Tela cheia e primeiro som continuam precisando de um toque (avisado na How to play e no README).
- [ ] **Teste manual**: Android (Chrome) e iPhone (Safari) com Xbox e PlayStation por Bluetooth.

## Testes

- [x] Vitest: família, rótulos, aperto/repetição, analógico como direcional, zona morta, navegação espacial (19 testes).
- [x] Chrome headless com controle falso: menu → modo → mapa → exército → partida (RB, menu da unidade, mover, B, Y/X, zoom, câmera, pausa, End turn com confirmação, L3) e online (R3, emote recebido pelo outro jogador; dicas com ✕/◯/△/▢).
- [ ] **Teste manual**: controle real no PC e no celular.

## Documentação

- [x] README (seção "Controle (gamepad)" e tecla T) e CLAUDE.md (seção "Controle / gamepad").
