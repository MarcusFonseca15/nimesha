const topViewCanvas = document.getElementById('topview');
const topViewCtx = topViewCanvas.getContext('2d');
let topViewYellowPattern = null;
let topViewBluePattern = null;

function createTopViewPattern(image) {
    if (!image.complete || image.naturalWidth === 0) {
        return null;
    }

    const pattern = topViewCtx.createPattern(image, 'repeat');
    if (pattern) {
        pattern.setTransform(new DOMMatrix().scale(2.5));
    }
    return pattern;
}

function drawTopView() {
    const scaleX = topViewCanvas.width / WORLD.width;
    const scaleY = topViewCanvas.height / WORLD.height;

    topViewYellowPattern = topViewYellowPattern || createTopViewPattern(yellowGrassImage);
    topViewBluePattern = topViewBluePattern || createTopViewPattern(blueGrassImage);

    topViewCtx.clearRect(0, 0, topViewCanvas.width, topViewCanvas.height);
    topViewCtx.fillStyle = '#ffffff';
    topViewCtx.fillRect(0, 0, topViewCanvas.width, topViewCanvas.height);

    topViewCtx.save();
    topViewCtx.scale(scaleX, scaleY);
    topViewCtx.fillStyle = isDreamWorld
        ? (topViewBluePattern || '#001aff4a')
        : (topViewYellowPattern || '#eede2a88');
    topViewCtx.fillRect(0, 0, WORLD.width, WORLD.height);
    player.draw(topViewCtx);
    enemies.forEach(enemy => enemy.draw(topViewCtx, isDreamWorld));
    topViewCtx.restore();

    topViewCtx.strokeStyle = '#ff3030';
    topViewCtx.lineWidth = 2;
    topViewCtx.strokeRect(
        camera.x * scaleX,
        camera.y * scaleY,
        camera.width * scaleX,
        camera.height * scaleY
    );

    requestAnimationFrame(drawTopView);
}

requestAnimationFrame(drawTopView);