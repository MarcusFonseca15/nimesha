class Player {
    constructor(x, y, size = 35, speed = 230) {
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


class Enemy {
    constructor(patrolStart, patrolEnd, dimension = 'yellow', options = {}) {
        this.patrolStart = { x: patrolStart.x, y: patrolStart.y };
        this.patrolEnd = { x: patrolEnd.x, y: patrolEnd.y };
        this.patrolTarget = this.patrolEnd; //alterna entre start e end
        this.x = this.patrolStart.x;
        this.y = this.patrolStart.y;
        this.size = options.size || 35;
        this.speed = options.speed || 120;
        
        //define se ele é monoDim.(amarelo/azul) ou duoDim.
        this.dimension = dimension;

        //DETECÇÃO E PATRULHA
        this.detectionRadius = options.detectionRadius || 180;

        // Estados patrolling, chasing ou returning
        this.state = 'patrolling';
    }

    update(deltaTime, player, isDreamWorld) {
        // Checa se o inimigo deve atuar na dimensão atual
        const currentDimension = isDreamWorld ? 'blue' : 'yellow';
        const isActiveInDimension = (this.dimension === 'both') || (this.dimension === currentDimension);

        // Se for MonoDim. e o jogador estiver na outra dimensão, CONGELA (Save-State)
        if (!isActiveInDimension) {
            return;
        }

        // Posição central do Inimigo e do Player para cálculo de distância
        const enemyCenterX = this.x + this.size / 2;
        const enemyCenterY = this.y + this.size / 2;
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;

        const distToPlayer = Math.hypot(playerCenterX - enemyCenterX, playerCenterY - enemyCenterY);

        //ESTADOS
        if (distToPlayer <= this.detectionRadius) {
            // Player entrou no raio -> Perseguir
            this.state = 'chasing';
        } else if (this.state === 'chasing') {
            // Perdeu o track -> Retornar
            this.state = 'returning';
        }

        //MOVIMENTO
        if (this.state === 'chasing') {
            // Perseguir
            const dirX = (playerCenterX - enemyCenterX) / distToPlayer;
            const dirY = (playerCenterY - enemyCenterY) / distToPlayer;

            this.x += dirX * this.speed * deltaTime;
            this.y += dirY * this.speed * deltaTime;

        } else if (this.state === 'returning') {
            // Retornar
            const distToSpawn = Math.hypot(this.patrolStart.x - this.x, this.patrolStart.y - this.y);
            const returnStep = this.speed * deltaTime;

            if (distToSpawn <= Math.max(5, returnStep)) {
                // Chegou ao Spawn -> Patrulhar
                this.x = this.patrolStart.x;
                this.y = this.patrolStart.y;
                this.patrolTarget = this.patrolEnd;
                this.state = 'patrolling';
            } else {
                const dirX = (this.patrolStart.x - this.x) / distToSpawn;
                const dirY = (this.patrolStart.y - this.y) / distToSpawn;

                this.x += dirX * returnStep;
                this.y += dirY * returnStep;
            }

        } else if (this.state === 'patrolling') {
            const deltaX = this.patrolTarget.x - this.x;
            const deltaY = this.patrolTarget.y - this.y;
            const distanceToTarget = Math.hypot(deltaX, deltaY);
            const patrolStep = this.speed * 0.6 * deltaTime;

            if (distanceToTarget <= patrolStep) {
                this.x = this.patrolTarget.x;
                this.y = this.patrolTarget.y;
                this.patrolTarget = this.patrolTarget === this.patrolEnd
                    ? this.patrolStart
                    : this.patrolEnd;
            } else {
                this.x += deltaX / distanceToTarget * patrolStep;
                this.y += deltaY / distanceToTarget * patrolStep;
            }
        }
    } // End de update

    draw(ctx, isDreamWorld) {
        const currentDimension = isDreamWorld ? 'blue' : 'yellow';
        const isActiveInDimension = (this.dimension === 'both') || (this.dimension === currentDimension);

        //Se for MonoDim em dimensao oposta, nao desenha
        if (!isActiveInDimension) {
            return;
        }

        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        //-------------RAIO DE DETECÇÃO (DEBUG)----------------
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.detectionRadius, 0, Math.PI * 2);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.83)';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        

        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        //-----------------------------------------------------

        //DESENHO DO INIMIGO
        ctx.fillStyle = this.dimension === 'both' 
            ? '#ff00ff' //DUODIMENSION
            : (this.dimension === 'yellow' ? '#ff9f43' : '#00d2d3'); // DIMENSAO YELLOW : DREAMWORLD
            
        ctx.fillRect(this.x, this.y, this.size, this.size);
    } // End de draw

} // End de Enemy ----------------