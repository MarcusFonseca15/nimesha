//inicialização da tela
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GAME_STATE = Object.freeze({
    PLAYING: 'jogando',
    PAUSED: 'pausado'
});

let gameState = GAME_STATE.PLAYING;
let lastFrameTime = null;

const keys = Object.create(null);
const mouse = { x: 0, y: 0, clicked: false };

//inicializa player no meio e embaixo da tela
const player = new Player(0, 0);
player.x = (canvas.width - player.size) / 2;
player.y = canvas.height - player.size;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#001aff4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw(ctx);

    //OVERLAY DE PAUSE
    if (gameState === GAME_STATE.PAUSED) {
        ctx.fillStyle = '#4c2ae3bf';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = '#0f102f';
    ctx.textBaseline = 'middle';

    if (gameState === GAME_STATE.PAUSED) {
        ctx.textAlign = 'center';
        ctx.font = '32px sans-serif';
        ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px sans-serif';
        ctx.fillText('Pressione P para continuar', canvas.width / 2, canvas.height / 2 + 40);
    } else {
        ctx.textAlign = 'left';
        ctx.font = '16px sans-serif';
        ctx.fillText('JOGANDO', 16, 24);
        ctx.fillText('WASD para mover - P para pausar', 16, 48);
    }
} //End de draw

function gameLoop(timestamp) {
    const deltaTime = lastFrameTime === null
        ? 0
        : Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    if (gameState === GAME_STATE.PLAYING) {
        player.update(deltaTime, keys, canvas.width, canvas.height);
    }

    draw();
    mouse.clicked = false;
    requestAnimationFrame(gameLoop);
}//End de gameLoop

//Controle de Pause
function togglePause() {
    if (gameState === GAME_STATE.PLAYING) {
        gameState = GAME_STATE.PAUSED;
    } else {
        gameState = GAME_STATE.PLAYING;
    }
}

//TECLADO ------------------
//Pause
window.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    if (event.code === 'Space') {
        event.preventDefault(); //impede de rolar a pagina
    }

    //Pause e impede repetir enqt pressiona
    if (event.code === 'KeyP' && !event.repeat) {
        togglePause();
    }
});

window.addEventListener('keyup', (event) => {
    delete keys[event.code];
});

//perder foco da janela e limpa teclado
window.addEventListener('blur', () => {
    for (const key of Object.keys(keys)) {
        delete keys[key];
    }
});

//recebe posição do mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * canvas.width / rect.width;
    mouse.y = (event.clientY - rect.top) * canvas.height / rect.height;
});
//recebe posição do click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * canvas.width / rect.width;
    mouse.y = (event.clientY - rect.top) * canvas.height / rect.height;
    mouse.clicked = true;
});

requestAnimationFrame(gameLoop); //inicia loop
