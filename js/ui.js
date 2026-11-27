const UI = {
    isButtonClicked(mouse, btn) {
        if (!btn) {
            return false;
        }

        return (
            mouse.x >= btn.x &&
            mouse.x <= btn.x + btn.width &&
            mouse.y >= btn.y &&
            mouse.y <= btn.y + btn.height
        );
    },

    handleMenuClick(mouse, buttons, actions) {
        if (this.isButtonClicked(mouse, buttons.input)) {
            actions.onToggleInput();
            return true;
        }

        if (this.isButtonClicked(mouse, buttons.start)) {
            actions.onStart();
            return true;
        }

        return false;
    },

    // -------------------------------------------------------------------------
    //MENU

    drawMenu(ctx, canvasWidth, canvasHeight, configInput) {
        ctx.fillStyle = '#0a0b1e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        //TITULO
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('NIMESHA', canvasWidth / 2, canvasHeight / 3 - 30);

        //AREA DOS BOTÕES
        const btnWidth = 260;
        const btnHeight = 50;
        const centerX = (canvasWidth - btnWidth) / 2;
        const startY = canvasHeight / 2 + 20;

        const buttons = {
            start: { x: centerX, y: startY, width: btnWidth, height: btnHeight },
            input: { x: centerX, y: startY + 65, width: btnWidth, height: btnHeight }
        };

        //DESENHA START
        ctx.fillStyle = '#4c2ae3';
        ctx.fillRect(buttons.start.x, buttons.start.y, buttons.start.width, buttons.start.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('start', canvasWidth / 2, buttons.start.y + btnHeight / 2);

        //DESENHAR INPUT
        ctx.fillStyle = '#2a2d6c';
        ctx.fillRect(buttons.input.x, buttons.input.y, buttons.input.width, buttons.input.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        const inputLabel = configInput === 'space' ? 'Espaço' : 'Piscar (Webcam)';
        ctx.fillText(`controle: ${inputLabel}`, canvasWidth / 2, buttons.input.y + btnHeight / 2);

        return buttons;
    }
};