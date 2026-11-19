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

//Configuraçao do MUNDO do jogo (TAMANHO DO MAPA)
const WORLD = {
    width: 2800,
    height: 2100
}

//-------- CAMERA --------------
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    update(player) {
        //centraliza a camera no player
        const playerCentroX = player.x + player.size / 2;
        const playerCentroY = player.y + player.size / 2;
        //seguir HORIZONTALMENTE
        this.x = playerCentroX - this.width / 2;
        //seguir VERTICALMENTE
        const targetY = playerCentroY - this.height / 2;
        const maxY = WORLD.height - this.height;

        this.y = Math.min(Math.max(0, targetY), maxY);

        //clamping geral pra camera não mostrar fora do mapa
        this.x = Math.min(Math.max(0, this.x), WORLD.width - this.width);
        this.y = Math.min(Math.max(0, this.y), WORLD.height - this.height);
    }
};

// CARREGAMENTO DOS TILES DO CHÃO
const yellowGrassImage = new Image();
const blueGrassImage = new Image();

let yellowPattern = null;
let bluePattern = null;

let bgImageLoaded = false;

yellowGrassImage.src = 'assets/yellow_grass.png';
blueGrassImage.src = 'assets/blue_grass.png';

// REPETIÇÃO DO TILE AMARELO QUANDO CARREGAR
yellowGrassImage.onload = () => {
    yellowPattern = ctx.createPattern(yellowGrassImage, 'repeat');
    //aumentei o tamanho dos tiles pra ficar mais visível
    yellowPattern.setTransform(new DOMMatrix().scale(2.5));
    bgImageLoaded = true;
};

// REPETIÇÃO DO TILE AZUL QUANDO CARREGAR
blueGrassImage.onload = () => {
    bluePattern = ctx.createPattern(blueGrassImage, 'repeat');
    bluePattern.setTransform(new DOMMatrix().scale(2.5));
};

//inicializa player no meio e embaixo do mundo
const player = new Player(0, 0);
player.x = (WORLD.width - player.size) / 2;
player.y = WORLD.height - player.size;
camera.update(player);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //MUNDO --------------------
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    if (yellowPattern) {
        ctx.fillStyle = yellowPattern;
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    } else {
        ctx.fillStyle = '#001aff4a';
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    }

    player.draw(ctx);

    ctx.restore();
    //FIM DO MUNDO (CAMERA VOLTA)

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
        player.update(deltaTime, keys, WORLD.width, WORLD.height);
        camera.update(player);
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
    const screenX = (event.clientX - rect.left) * canvas.width / rect.width;
    const screenY = (event.clientY - rect.top) * canvas.height / rect.height;

    // Converte a posição do cursor na tela para a posição real no mundo do jogo
    mouse.x = screenX + camera.x;
    mouse.y = screenY + camera.y;
});
//recebe posição do click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) * canvas.width / rect.width;
    const screenY = (event.clientY - rect.top) * canvas.height / rect.height;

    mouse.x = screenX + camera.x;
    mouse.y = screenY + camera.y;
    mouse.clicked = true;
});

requestAnimationFrame(gameLoop); //inicia loop
