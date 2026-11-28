//inicialização da tela
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const GAME_STATE = Object.freeze({
    MENU: 'menu',
    CUTSCENE: 'cutscene',
    FADING: 'transicao',
    PLAYING: 'jogando',
    PAUSED: 'pausado'
});

//para UI e menu
const SHOW_START_SCREEN = true;

//ESTADO DA DIMENSÃO (FALSE = AMARELO, TRUE = AZUL)
let isDreamWorld = false;

let gameState = SHOW_START_SCREEN ? GAME_STATE.MENU : GAME_STATE.PLAYING;
let lastFrameTime = null;

let configInput = 'space';

const keys = Object.create(null);
const mouse = { x: 0, y: 0, clicked: false };

let activeButtons = {};

//Configuraçao do MUNDO do jogo (TAMANHO DO MAPA)
const WORLD = {
    width: 2000,
    height: 1500
}

function setWorldSize(newWidth, newHeight) {
    WORLD.width = newWidth;
    WORLD.height = newHeight;
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

let bgImageLoaded = false;

const yellowGrassImage = new Image();
let yellowPattern = null;

const blueGrassImage = new Image();
let bluePattern = null;

const playerImage = new Image();
playerImage.src = 'assets/player-sheet.png';

yellowGrassImage.src = 'assets/yellow_grass.png';
blueGrassImage.src = 'assets/blue_grass.png';

// REPETIÇÃO DO TILE AMARELO QUANDO CARREGAR
yellowGrassImage.onload = () => {
    yellowPattern = ctx.createPattern(yellowGrassImage, 'repeat');
    //aumentei o tamanho dos tiles pra ficar mais visível
    yellowPattern.setTransform(new DOMMatrix().scale(2));
    bgImageLoaded = true;
};

// REPETIÇÃO DO TILE AZUL QUANDO CARREGAR
blueGrassImage.onload = () => {
    bluePattern = ctx.createPattern(blueGrassImage, 'repeat');
    bluePattern.setTransform(new DOMMatrix().scale(2));
};

//inicializa player no meio e embaixo do mundo
const player = new Player(0, 0);
player.image = playerImage;
player.x = (WORLD.width - player.size) / 2;
player.y = WORLD.height - player.size;
camera.update(player);

//INSTANCIAR INIMIGO
const enemies = [
    // MonoDim Yellow
    new Enemy({ x: 600, y: 1200 }, { x: 900, y: 1200 }, 'yellow'),

    // MonoDim Blue
    new Enemy({ x: 1400, y: 1200 }, { x: 1400, y: 1450 }, 'blue'),

    // Duodimension
    new Enemy({ x: 1000, y: 1400 }, { x: 1200, y: 1400 }, 'both', { speed: 140, detectionRadius: 220 })
];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //MUNDO --------------------
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    if (bgImageLoaded) {
        const dimensaoAtual = isDreamWorld ? bluePattern : yellowPattern;
        ctx.fillStyle = dimensaoAtual || (isDreamWorld ? '#001aff4a' : '#eede2a88');
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    } else {
        ctx.fillStyle = isDreamWorld ? '#001aff4a' : '#eede2a88';
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    }

    player.draw(ctx);

    enemies.forEach(enemy => enemy.draw(ctx, isDreamWorld));
    
    ctx.restore();
    //FIM DO MUNDO (CAMERA VOLTA)

    //OVERLAY DE PAUSE
    if (gameState === GAME_STATE.MENU) {
        activeButtons = UI.drawMenu(ctx, canvas.width, canvas.height, configInput);
    } else if (gameState === GAME_STATE.PAUSED) {
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
    } else if (gameState === GAME_STATE.PLAYING) {
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

        enemies.forEach(enemy => enemy.update(deltaTime, player, isDreamWorld));

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

        if(!event.repeat && gameState === GAME_STATE.PLAYING) {
            isDreamWorld = !isDreamWorld;
        }
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

    // Converte a posição do cursor na tela pra posição real no mundo do jogo
    mouse.x = screenX + camera.x;
    mouse.y = screenY + camera.y;
});
//recebe posição do click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) * canvas.width / rect.width;
    const screenY = (event.clientY - rect.top) * canvas.height / rect.height;

    if (gameState === GAME_STATE.MENU) {
        UI.handleMenuClick(
            { x: screenX, y: screenY },
            activeButtons,
            {
                onStart: () => { gameState = GAME_STATE.PLAYING; },
                onToggleInput: () => {
                    configInput = configInput === 'space' ? 'blink' : 'space';
                }
            }
        );
        return;
    }

    mouse.x = screenX + camera.x;
    mouse.y = screenY + camera.y;
    mouse.clicked = true;
});

requestAnimationFrame(gameLoop); //inicia loop
