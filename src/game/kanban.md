# 🗂️ Kanban - Jogo Tático por Turnos (Excalibur.js + Lit + Quasar)

## 🎯 Ideias

- Criar sistema de habilidades ativas e passivas por unidade
- Adicionar sistema de terreno com bônus (ex: floresta, montanha, etc.)
- Implementar efeitos visuais para buffs/debuffs
- Expandir IA com estratégias de grupo (ex: formação, flanqueamento)
- Sistema de status (envenenado, sangramento, etc.)
- Tela de preview da unidade com informações completas
- Animações de vitória e derrota no final da partida

---

## 🔧 Em andamento

- IA ainda com problemas em ataques à distância
- Implementar sistema de skills (já está planejado nas configs, mas ainda não foi usado)
- Aprimorar decisão de movimento da IA (evitar loops)
- Melhorar a lógica de pathfinding para considerar zonas perigosas

---

## 🧪 Testes

- Sistema de dano com rolagem de dados (D20 e D6)
- Animações contextuais (idle/move/attack/death)
- Sistema de seleção e cursor de movimentação
- Sistema de movimentação com partículas (DustParticles)
- Menus responsivos no mobile

---

## ✅ Concluído

- Sistema de movimentação baseado em máscara e tipo de terreno
- Sistema de ataque com cálculo de dano e animação
- Interface flutuante com UnitMenu
- Pathfinding com A* adaptado (considerando curva com penalidade)
- Componentes customizados em Lit para menus
- Sistema de som com controle de volume

---

## 🐞 Bugs / Ajustes

- IA evita ataque mesmo com inimigo em range (investigar pontuação da ação)
- Tooltip do botão "Pass Turn" às vezes sobrepõe outros elementos
- Unidades de longa distância não priorizam posicionamento adequado
- Algumas animações de morte não são interrompidas corretamente

---

## ⚖️ Balanceamento

- Balancear ataque/defesa de arqueiros vs. lanceiros
- Definir valores médios para movimento de unidades rápidas e pesadas
- Ajustar dano mínimo para que não haja ataques inúteis (sempre causar ao menos 1?)
- Testar combate com mais de 6 unidades simultâneas em campo
