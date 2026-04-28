# ⚽ PrimeBall

![Versão](https://img.shields.io/badge/version-4.2-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Online-green?style=for-the-badge)
![Tecnologias](https://img.shields.io/badge/Tech-JS%20|%20HTML5%20|%20PeerJS-yellow?style=for-the-badge)

O **PrimeBall** é um simulador de futebol arcade minimalista e dinâmico, desenvolvido para ser jogado diretamente no navegador. O projeto foca em jogabilidade fluida, física de colisões realista e uma experiência multiplayer peer-to-peer (P2P).

## 🔗 Jogue Agora
O jogo está disponível oficialmente em:
**[primeball.top](https://primeball.top)**

---

## 🚀 Funcionalidades

- **Multiplayer em Tempo Real:** Conexão direta entre jogadores via ID usando PeerJS (WebRTC).
- **Bot Inteligente:** Modo treino contra uma IA que rastreia a bola e defende o gol.
- **Sistema de Times:** Alternância dinâmica entre o time Vermelho e Azul.
- **Chat Integrado:** Sistema de mensagens in-game para comunicação rápida.
- **Alta Performance:** Otimizado para 60 FPS com física baseada em vetores.

## 🕹️ Como Jogar

### Controles
- **W, A, S, D:** Movimentação do jogador.
- **Espaço:** Chutar a bola.
- **Enter:** Abrir chat / Enviar mensagem.
- **T:** Trocar de Time.
- **P:** Ativar/Desativar o Bot automático.

### Multiplayer
1. O **Host** compartilha seu ID gerado na tela.
2. O **Cliente** insere o ID e clica em conectar.
3. A sincronização de estado (bola, posições e placar) é feita automaticamente pelo Host.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas:** Renderização gráfica.
- **JavaScript (Vanilla):** Lógica do jogo e motor físico.
- **PeerJS:** Comunicação P2P para o multiplayer.
- **Vercel:** Hospedagem e deploy contínuo.

## 🔧 Organização do Código

O projeto segue uma estrutura limpa e modular:
- `index.html`: Interface e elementos de UI.
- `style.css`: Design responsivo e visual do chat.
- `game.js`: Motor de física, lógica de rede e loop principal.

---

## 👨‍💻 Autor

Projeto desenvolvido como parte do portfólio técnico, focando em desenvolvimento front-end e lógica de jogos.

---
*Este projeto é de código aberto e focado em aprendizado.*
