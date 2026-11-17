//inicialização da tela
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

//######## VARIÁVEIS GAMELOOP
const GAME_STATE = Object.freeze({
    PLAYING: 'jogando',
    PAUSED: 'pausado'
});
//Inicia como jogando
let gameState = GAME_STATE.PLAYING;

//METODO DE LÓGICA DO JOGO ----------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f102f';
    ctx.textAlign = 'center';
    ctx.font = '32px sans-serif';
    ctx.fillText(gameState === GAME_STATE.PLAYING ? 'JOGANDO' : 'PAUSADO', canvas.width / 2, canvas.height / 2);

    ctx.font = '16px sans-serif';
    ctx.fillText('Pressione P para pausar/continuar', canvas.width / 2, canvas.height / 2 + 40);
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    gameState = gameState === GAME_STATE.PLAYING
        ? GAME_STATE.PAUSED
        : GAME_STATE.PLAYING;
}

window.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyP') {
        return;
    }

    event.preventDefault();
    if (!event.repeat) {
        togglePause();
    }
});

requestAnimationFrame(gameLoop);
