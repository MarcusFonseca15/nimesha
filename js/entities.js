class Player {
    constructor(x, y, size = 50, speed = 230) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }

    update(deltaTime, keys, worldWidth, worldHeight) {
        //direção (anula direçao oposta ao msm tempo com Boolean)
        let moveX = Number(Boolean(keys.KeyD)) - Number(Boolean(keys.KeyA));
        let moveY = Number(Boolean(keys.KeyS)) - Number(Boolean(keys.KeyW));

        //normaliza a direção pra vel. ser constante
        const magnitude = Math.hypot(moveX, moveY);
        if (magnitude > 0) {
            moveX /= magnitude;
            moveY /= magnitude;
        }
        //posicao atual + direçao x vel x tempo
        this.x = Math.max(0, Math.min(
            worldWidth - this.size,
            this.x + moveX * this.speed * deltaTime
        ));
        this.y = Math.max(0, Math.min(
            worldHeight - this.size,
            this.y + moveY * this.speed * deltaTime
        ));
    } //End de update

    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }//End de draw

} //End de Player ----------------
