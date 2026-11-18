# Modo online (Trystero) — plano

Dois jogadores, cada um no seu aparelho, mais espectadores, sem servidor nosso e sem banco. Os navegadores se acham pelo Trystero (servidores públicos de BitTorrent/Nostr só para a apresentação) e depois trocam as mensagens direto entre si (WebRTC). O jogo continua só no GitHub Pages.

Legenda: 🔧 decisão tomada (dá para mudar antes de implementar) · ❓ precisa da sua resposta

---

## Regras do modo online

### Nome do jogador
- [x] Ao entrar em "Online" o jogador digita um nome (1–16 caracteres; espaços nas pontas removidos). Fica salvo em `localStorage` (`pixelfantasywar.name`) e já vem preenchido nas próximas vezes.
- [x] O nome aparece no HUD (no lugar de "Player"/"CPU"), no banner de fase ("Jean's turn"), na dica enquanto o outro joga ("Waiting for Jean..."), na lista de salas, no lobby e no fim ("Jean wins!" / "Victory!" / "Defeat").
- [x] Nomes iguais: mantém os dois; a cor do time já diferencia.

### Salas: abertas e trancadas
- [x] Toda sala tem um **código** de 5 caracteres sem letras confusas (sem `0/O`, `1/I/L`), ex.: `K7QMX`, com botão para copiar.
- [x] **Aberta (padrão)**: aparece na lista pública de salas da tela Online. Qualquer um pode **entrar para jogar** (se a vaga estiver livre) ou **assistir**. O código também funciona.
- [x] **Trancada** (cadeado ao criar, e dá para trancar/destrancar no lobby antes de começar): **não aparece** na lista. Só entra quem tiver o código, para jogar ou para assistir (ex.: torneio privado). O código é o próprio nome da sala no Trystero, então sem ele não dá para achá-la.
- [x] Ao entrar com código, o jogador escolhe **Play** (se a vaga estiver livre) ou **Watch**.
- [x] Vagas: 2 jogadores + até 8 espectadores (🔧 limite para a rede não pesar: todo mundo da sala conversa com todo mundo). Sala cheia → "Room is full".
- [x] Ao conectar, todos trocam `hello` com **versão do jogo** e nome. Versões diferentes → "Your game versions differ. Reload the page (Ctrl+F5) and try again." (evita alguém com o site antigo em cache).
- [x] Sem conexão em 20 s → mensagem de falha com a dica do Wi-Fi e botão "Try again".
- [x] 🔧 Quem criou a sala é o **dono**: escolhe o mapa, tranca/destranca e pode remover alguém do lobby (Kick). Se o dono sair do lobby antes de começar, a sala fecha para todos ("The room was closed").

### Lista de salas abertas
- [x] Tela Online mostra "Open rooms": nome do dono, mapa, situação ("Waiting for opponent" / "In match - round 5"), nº de espectadores, e botões **Play** (se tem vaga) e **Watch**.
- [x] Como funciona sem servidor: as salas abertas se anunciam a cada 5 s num canal público fixo do Trystero (o "saguão"); quem está na tela Online escuta. Sala que não se anuncia há 15 s some da lista.
- [x] Lista vazia → "No open rooms right now. Create one!"
- [x] Limitação conhecida: o saguão é uma sala do Trystero como as outras, então funciona bem com dezenas de pessoas olhando a lista ao mesmo tempo, não com milhares.

### Recomendação de Wi-Fi (texto na tela Online)
- [x] Mostrar na tela Online, em inglês como o resto do jogo:
  > **Tip: play on Wi-Fi.** Online matches connect the devices directly, with no game server in the middle. Some mobile networks (4G/5G) and office networks block direct connections. If you can't connect, switch to Wi-Fi.
- [x] Repetir a dica curta na mensagem de falha de conexão.

### Antes da partida (lobby)
- [x] Mostra: código (copiar), aberta/trancada, os dois jogadores (nome, conectado, ready), espectadores (nomes), mapa.
- [x] 🔧 O dono escolhe o mapa (os outros veem a escolha ao vivo).
- [x] 🔧 O dono joga de **Azul** (começa) na 1ª partida; na revanche as cores **trocam**.
- [x] Cada jogador monta **o próprio exército** ao mesmo tempo (tela `army-select`, orçamento 100). O exército do outro fica **escondido** (inclusive dos espectadores) até os dois clicarem "Ready".
- [x] Partida começa quando os dois estão "Ready". Mudar o mapa tira o "Ready" dos dois.
- [x] Sair do lobby avisa os outros ("Jean left the room").

### Durante a partida
- [x] Só o jogador da vez controla; o outro vê as jogadas animadas (como assiste a CPU hoje) e pode passar o mouse/tocar para ver cards e alcances.
- [x] **Dados**: quem ataca sorteia e manda os números; os outros calculam o mesmo resultado com eles. (Confia no jogador — ok entre amigos.)
- [x] Tudo o que existe hoje continua valendo: skills, Run, Heal, desfazer movimento, Wait, End turn.
- [x] Coisas **locais** (cada um tem a sua, sem afetar os outros): velocidade x1/x2/x3, zoom, som, botão do olho.
- [x] 🔧 **Pausa**: abre o menu só para quem pausou; o jogo dos outros continua. As jogadas recebidas durante a pausa ficam na fila e tocam ao voltar.
- [x] **Limite de 2 minutos por turno** (constante `ONLINE_TURN_SECONDS = 120`):
  - Começa quando o banner de fase termina e corre direto até o fim do turno (animações incluídas; a pausa local **não** para o relógio).
  - Mostrado no painel central do `game-hud` (o da pausa/velocidade, "Round N / X phase", End turn): contagem `1:42` ao lado do texto da fase + uma barra fina na base do painel, na cor do time da vez, que vai esvaziando. Todos (jogadores e espectadores) veem o mesmo relógio.
  - Últimos 15 s: número e barra em vermelho, piscando, e um som de aviso para o jogador da vez.
  - Chegou a 0: o turno termina sozinho, igual ao "End turn" (skill pendente devolvida, menus fechados). Se uma animação estiver tocando, termina depois dela.
  - Quem controla o fim é o jogador da vez (ele manda o `end-turn`). Se o outro não receber nada 15 s depois do 0, mostra "Jean is not responding" com **Wait** / **Leave** (Leave = vitória de quem ficou).
  - Fora do online (CPU, PvP local) não há relógio.
- [x] "Main menu" na pausa → confirma ("You will forfeit the match") → avisa os outros; o adversário **vence** ("Jean left the match").
- [x] Limite de fases do mapa continua (empate igual ao local).

### Espectadores
- [x] Entram no lobby ou **no meio da partida**: recebem o histórico (configuração + todas as ações) e reaplicam tudo na hora (`moveInstant`/`attackInstant` com os mesmos dados), depois seguem ao vivo com animação.
- [x] Não controlam nada: sem menu de unidade, sem End turn, sem limite de tempo próprio. Podem passar o mouse/tocar para ver cards, alcances e a prévia de combate, dar zoom, mudar a velocidade e o som deles.
- [x] Veem os dois exércitos (depois do Ready) e os nomes dos dois jogadores. Banner e fim falam em nomes ("Jean's turn", "Jean wins!"), nunca "Victory"/"Defeat".
- [x] HUD mostra um olho com o nº de espectadores (para todos); o espectador vê "Watching" no lugar dos botões de End turn.
- [x] Ações vindas de quem não é um dos dois jogadores são ignoradas.
- [x] Revanche: espectadores continuam na sala e assistem à próxima.
- [x] Sair: botão "Leave" (não afeta a partida).

### Queda de conexão e reconexão
- [x] Cada jogador recebe ao entrar um **token de vaga** (aleatório, guardado em `sessionStorage` com o código da sala).
- [x] Se um jogador cair: os outros veem "Connection lost with Jean - waiting for reconnection..." e o relógio do turno **pausa**. Botões **Wait** e **Leave** para o adversário (Leave = vitória).
- [x] 🔧 Depois de 3 min sem voltar, quem ficou ganha automaticamente.
- [x] Ao voltar (recarregar a página reconecta sozinho; ou entrar com o código de novo), o token devolve a vaga; ele recebe o histórico, reaplica tudo na hora e a partida continua de onde parou. O relógio volta a correr.
- [x] Os dois jogadores guardam o histórico; quem voltou confere com o hash do último turno.
- [x] Se os **dois** caírem ao mesmo tempo, a partida se perde (não há ninguém guardando o histórico). Espectadores também guardam o histórico, então se houver algum na sala ele serve de fonte.

### Emotes
- [x] Jogadores mandam reações rápidas: "Nice!", "Oops", "Good luck", "GG", "Hmm...", "Hurry up!".
- [x] Botão no HUD (abre a lista) e teclas 1–6 (só teclado).
- [x] Aparece em balão perto da barra do time de quem mandou, por 3 s, para todos (inclusive espectadores).
- [x] Limite: 1 a cada 3 s. Botão "mute emotes" no menu de pausa (local).
- [x] 🔧 Espectadores veem, mas não mandam (evita bagunça em torneio).

### Fim de partida
- [x] Tela de fim do ponto de vista de cada um: "Victory!" / "Defeat" / "Draw" (jogadores) ou "Jean wins!" (espectadores), com subtítulo como hoje.
- [x] "Play again" = pedir revanche; começa quando os dois pedirem (mostra "Waiting for Jean..."). Volta ao lobby com o mesmo mapa e exércitos, cores trocadas, "Ready" desmarcado (dá para mudar exército).
- [x] "Main menu" avisa os outros; se for o dono, a sala fecha.

### Segurança contra dessincronia
- [x] No fim de cada turno, quem jogou manda um resumo do tabuleiro (posição, HP, MP de cada unidade). Se não bater com o de alguém: a partida acaba sem resultado para essa pessoa ("Match ended - The two games went out of sync"), jogador ou espectador.

---

## Como vamos fazer

### Fase 1 — Transporte e protocolo
- [x] `src/online/transport.ts`: interface pequena `send(msg, to?)`, `onMessage(cb)`, `onPeerJoin/onPeerLeave`, `close()`. O jogo só conhece isso (dá para trocar o Trystero depois sem mexer no resto).
- [x] `LocalTransport` com `BroadcastChannel`: abas do mesmo navegador conversam. Para desenvolver e testar sem rede (jogadores + espectador em 3 abas).
- [x] `TrysteroTransport`: `joinRoom({ appId: 'pixelfantasywar', password? }, código)`. Adicionar `trystero` com `yarn add` (versão fixa).
- [x] `src/online/protocol.ts`: tipos das mensagens (`hello`, `seat`, `lobby`, `ready`, `start`, `action`, `turn-hash`, `history-request`/`history`, `emote`, `rematch`, `kick`, `leave`, `close`) e versão do protocolo.
- [x] `src/online/room.ts`: estado da sala (dono, vagas, espectadores, trancada, mapa, ready, tokens) e regras (quem pode mandar o quê).
- [x] `src/online/lobby-directory.ts`: anúncio e escuta das salas abertas no saguão.

### Fase 2 — Jogadas pela rede
- [x] Unidade identificada pela célula onde está (`x,y`); destino e caminho por coordenadas.
- [x] Ações enviadas só quando **confirmadas** (escolher e cancelar skill é local):
  - `move { unit, path, skill? }` (skill = Run)
  - `attack { unit, target, rolls: [d20, d6][], skill? }` (rolls do golpe e do contra-ataque)
  - `self-skill { unit, skill }` · `heal { unit, target }` · `undo { unit }` · `pass { unit }` · `end-turn { reason: 'button' | 'timeout' }`
- [x] `HumanPlayer` ganha um gancho `onAction` chamado em `maybeMove`, `maybeAttack`, `useSkill` (self), `maybeHeal`, `undo`, `pass` e `endTurn`.
- [x] `Unit.attack` aceita `rolls` (hoje só o `attackInstant` aceita) e devolve os números usados, para o `HumanPlayer` mandar.
- [x] `RemotePlayer extends Player`: `makeMove()` tira ações da fila e executa com animação, no mesmo estilo do executor do `ComputerPlayer` (destaque do caminho/alvo + `gameDelay`).
- [x] `src/online/replay.ts`: aplica um histórico inteiro na hora (espectador entrando, reconexão).
- [x] Separar "humano" de "local": `Player.isLocal`. O `TurnManager.describe` passa a falar em Victory/Defeat quando houver **um jogador local**, e usa os nomes no online (espectador = nenhum jogador local, os dois remotos).
- [x] Testes (vitest): dois tabuleiros iguais, uma sequência de ações aplicada nos dois (com os mesmos `rolls`) → mesmo estado e mesmo hash; replay do histórico = estado ao vivo.

### Fase 3 — Telas
- [x] Modo novo `online` em `GAME_MODES` ("Online", "Play or watch on another device.").
- [x] Tela Online: nome, dica do Wi-Fi, lista "Open rooms" (Play/Watch), **Create room** (com cadeado) e **Join with code** (Play/Watch).
- [x] Lobby: código (copiar), cadeado, jogadores com status, espectadores, mapa (dono escolhe), botão para montar o exército, **Ready**, Kick (dono), Leave.
- [x] `army-select` em modo "só um time" (o meu).
- [x] `MatchSettings` ganha `online?: { session, localTeam: 0 | 1 | null, names }` (`null` = espectador); a `LevelBase` cria `HumanPlayer` para o time local e `RemotePlayer` para os outros.

### Fase 4 — Partida e fim
- [x] Nomes no HUD, banner, dica de espera e game over (visão de jogador e de espectador).
- [x] Relógio do turno: `HudView.turnTimer` (segundos restantes, total) calculado no `GameUI`; contagem + barra no painel central do `game-hud`; fim automático no `HumanPlayer` (mesmo caminho do `endTurn`); aviso "not responding" do lado de quem espera; pausa do relógio enquanto um jogador está desconectado.
- [x] Pausa local (sem `engine.clock.stop()` afetar os outros) e forfeit ao sair.
- [x] Espectador: sem input de jogo, "Watching" no HUD, olho com nº de espectadores.
- [x] Emotes: botão no HUD, teclas 1–6, balão, limite de frequência, mute.
- [x] Queda/reconexão: aviso, Wait/Leave, vitória após 3 min, token de vaga, replay do histórico.
- [x] Revanche com troca de cores.
- [x] Hash do turno e aviso de dessincronia.
- [x] Desconectar e limpar tudo no `onDeactivate` / ao voltar ao menu (sem listeners sobrando entre partidas).

### Fase 5 — Testar e documentar
- [x] 3 abas com `LocalTransport` (2 jogadores + espectador; espectador entrando no meio; recarregar um jogador para testar reconexão).
- [x] Trystero de verdade (relays Nostr públicos) em 3 abas do Chrome: lista de salas, partida, emote, espectador no meio, recarregar e desistência.
- [ ] Aparelhos reais: PC + celular no mesmo Wi-Fi; celular no 4G para ver a mensagem de falha; sala trancada não aparecendo na lista de outro aparelho.
- [x] `yarn validate`.
- [x] README (seção do modo online, salas abertas/trancadas, espectadores, dica do Wi-Fi), tela "How to play" e CLAUDE.md (arquitetura `src/online/`).

## Fora do escopo
Servidor TURN (só conexão direta; quem não conectar troca para Wi-Fi), ranking, chat livre, partidas com mais de 2 jogadores, busca automática de adversário (a lista de salas abertas cumpre esse papel).
