const LevelManager = {
    currentLevelData: null,
    currentLevelIndex: 1,
    totalLevels: 5,
    renderTileSize: 48, //16px * 3 = 48px na tela
    tileImages: {},
    tilesLoadedCount: 0,
    totalTilesToLoad: 0,
    isLoaded: false,

    world: {
        width: 0,
        height: 0
    },

    //carregar sprites do JSON
    initTiles(jsonBlocos, onComplete) {
        this.tileImages = {};
        this.tilesLoadedCount = 0;

        // Filtra glifos únicos do JSON
        const uniqueGlifos = [...new Set(jsonBlocos.map(b => b.glifo))];
        this.totalTilesToLoad = uniqueGlifos.length;

        if (this.totalTilesToLoad === 0) {
            this.isLoaded = true;
            if (onComplete) onComplete();
            return;
        }

        uniqueGlifos.forEach(glifo => {
            const img = new Image();
            img.src = `assets/tiles/${glifo}.png`;

            img.onload = () => {
                this.tileImages[glifo] = img;
                this.tilesLoadedCount++;
                if (this.tilesLoadedCount === this.totalTilesToLoad) {
                    this.isLoaded = true;
                    if (onComplete) onComplete();
                }
            };

            //Fallback de cor
            img.onerror = () => {
                this.tilesLoadedCount++;
                if (this.tilesLoadedCount === this.totalTilesToLoad) {
                    this.isLoaded = true;
                    if (onComplete) onComplete();
                }
            };
        });
    },

    //Carrega JSON
    async loadLevel(jsonPath, onComplete) {
        this.isLoaded = false;
        const response = await fetch(jsonPath);
        this.currentLevelData = await response.json();

        //Calcula tamanho do mapa 
        this.world.width = this.currentLevelData.largura * this.renderTileSize;
        this.world.height = this.currentLevelData.altura * this.renderTileSize;

        this.initTiles(this.currentLevelData.blocos, onComplete);

        const playerSpawn = this.currentLevelData.entidades.find(e => e.tipo === 'player');

        return {
            spawnX: playerSpawn ? playerSpawn.x * this.renderTileSize : 100,
            spawnY: playerSpawn ? playerSpawn.y * this.renderTileSize : 100,
            width: this.world.width,
            height: this.world.height
        };
    },

    //Carrega a fase dinamicamente pelo número
    async loadLevelByIndex(levelIndex, onComplete) {
        this.currentLevelIndex = levelIndex;
        const jsonPath = `levels/fase${levelIndex}.json`;
        return await this.loadLevel(jsonPath, onComplete);
    },

    //COLISAO
    isSolidAt(pixelX, pixelY, isDreamWorld) {
        if (!this.currentLevelData) return false;

        const tileX = Math.floor(pixelX / this.renderTileSize);
        const tileY = Math.floor(pixelY / this.renderTileSize);

        if (tileX < 0 || tileX >= this.currentLevelData.largura || tileY < 0 || tileY >= this.currentLevelData.altura) {
            return true;
        }

        const mapGrid = isDreamWorld ? this.currentLevelData.dimensaoB : this.currentLevelData.dimensaoA;
        const charAtPos = mapGrid[tileY][tileX];
        const blocoInfo = this.currentLevelData.blocos.find(b => b.char === charAtPos);

        return blocoInfo ? (blocoInfo.categoria === 'solid' || blocoInfo.categoria === 'void') : false;
    },

    //RENDERIZAR MAPA DA DIMENSÃO ATIVA
    drawMap(ctx, isDreamWorld) {
        if (!this.currentLevelData) return;

        const mapGrid = isDreamWorld ? this.currentLevelData.dimensaoB : this.currentLevelData.dimensaoA;

        ctx.imageSmoothingEnabled = false;

        for (let y = 0; y < this.currentLevelData.altura; y++) {
            for (let x = 0; x < this.currentLevelData.largura; x++) {
                const charAtPos = mapGrid[y][x];
                const blocoInfo = this.currentLevelData.blocos.find(b => b.char === charAtPos);

                const posX = x * this.renderTileSize;
                const posY = y * this.renderTileSize;

                if (blocoInfo) {
                    const tileImg = this.tileImages[blocoInfo.glifo];

                    if (tileImg && tileImg.complete && tileImg.naturalWidth !== 0) {
                        ctx.drawImage(tileImg, posX, posY, this.renderTileSize, this.renderTileSize);
                    } else {
                        //FALLBACK DE COR
                        ctx.fillStyle = blocoInfo.cor;
                        ctx.fillRect(posX, posY, this.renderTileSize, this.renderTileSize);
                    }
                }
            }
        }
    }
};