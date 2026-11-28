# Nimesha

Nimesha é um jogo 2D executado no navegador, usando Canvas e JavaScript puro.

## Controles
| Teclas | Ação |
| --- | --- |
| `W`, `A`, `S`, `D` | Move o personagem para cima, esquerda, baixo e direita |
| `Espaço` | Alterna entre as dimensões Acordada e DreamWorld |
| `P` | Pausa ou retoma o jogo |

O movimento diagonal é normalizado, então andar na diagonal não aumenta a velocidade. O jogo também limpa as teclas pressionadas quando a janela perde o foco.

O cursor e os cliques no Canvas são convertidos para coordenadas do mundo e armazenados, mas ainda não acionam nenhuma mecânica.

## Mundo e câmera
- O mundo mede **2000 × 1500** unidades.
- O Canvas principal mede **900 × 700** pixels.
- O personagem começa no centro horizontal, perto da borda inferior do mundo.
- A câmera acompanha o personagem e é limitada pelas bordas do mapa para não mostrar áreas fora do mundo.
- O terreno usa `yellow_grass.png` ou `blue_grass.png`, repetidos pelo mapa. Se a textura da dimensão atual ainda não estiver disponível, é usada uma cor de fallback.

Pressionar `Espaço` alterna a dimensão ativa enquanto o jogo está em andamento. Isso troca o terreno e determina quais inimigos são desenhados e atualizados.

## Personagem
O personagem é um quadrado branco de **45 × 45** unidades, com velocidade de **230** unidades por segundo. Sua posição é limitada ao tamanho do mundo.

## Inimigos
Cada inimigo tem um ponto inicial e um ponto final de patrulha. Ele se move em linha reta entre esses pontos e inverte a direção ao chegar a cada extremidade. Os pontos podem formar uma rota horizontal, vertical ou diagonal.

Quando o personagem entra no raio de detecção, o inimigo o persegue. Se o personagem sair desse raio, o inimigo retorna ao ponto inicial e retoma a patrulha. Inimigos de uma única dimensão ficam congelados e não são desenhados enquanto a outra dimensão está ativa; inimigos Duodimensionais funcionam nas duas.

A velocidade de patrulha é 60% da velocidade configurada; perseguição e retorno usam a velocidade completa.

As rotas são definidas ao criar um `Enemy`, passando os pontos e, opcionalmente, dimensão e configurações:

```js
new Enemy(
    { x: 600, y: 1200 },
    { x: 900, y: 1200 },
    'yellow',
    { speed: 120, detectionRadius: 180 }
);
```

As configurações opcionais incluem `size` (padrão `35`), `speed` (padrão `120`) e `detectionRadius` (padrão `180`).

## Pausa
Ao pressionar `P`, o movimento e a atualização dos inimigos são suspensos. O Canvas exibe uma sobreposição de pausa e a instrução para retomar. Pressionar `P` novamente continua o jogo.

## Arquivos e recursos
- `index.html`: cria os dois Canvas (jogo e minimapa), define o posicionamento e carrega os scripts do jogo.
- `js/entities.js`: implementa o personagem e os inimigos.
- `js/main.js`: configura o mundo e a câmera, carrega as texturas, controla entradas e executa o loop do jogo.
- `js/topview.js`: desenha e atualiza o minimapa.

# EM DESENVOLVIMENTO
`js/levels.js`, `js/ui.js` e `style.css` estão vazios. Ainda não há sistema de fases, menu, itens, combate, vida ou colisões implementados. A interface atual se limita às instruções de controle e ao estado de pausa desenhados no Canvas.
