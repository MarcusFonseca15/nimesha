const topViewCanvas = document.getElementById('topview');
const topViewCtx = topViewCanvas.getContext('2d');

function drawTopView() {
    const scaleX = topViewCanvas.width / WORLD.width;
    const scaleY = topViewCanvas.height / WORLD.height;

    topViewCtx.fillStyle = isDreamWorld ? '#001aff' : '#eede2a';
    topViewCtx.fillRect(0, 0, topViewCanvas.width, topViewCanvas.height);

    topViewCtx.fillStyle = '#ffffff';
    topViewCtx.fillRect(
        player.x * scaleX,
        player.y * scaleY,
        Math.max(player.size * scaleX, 4),
        Math.max(player.size * scaleY, 4)
    );

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