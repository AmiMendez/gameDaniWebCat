// Configuración de Phaser 
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#ffffff', // Blanco
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let targetPosition = { x: 0, y: 0 };
let isMoving = false;
let speed = 160;  // Velocidad de movimiento
let balls = [];
let score = 0;  // Contador de bolitas recogidas
let progressBar;
let progressBarBorder;
let maxScore = 10; // Máximo para llenar la barra

function preload() {
    console.log("Preload ejecutándose");
    // Cargar los spritesheets y otros recursos
    this.load.spritesheet('cat', 'assets/sprites/caminaIZQ_DER10.png', {
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('catFront', 'assets/sprites/AdelanteCAT3.png', {
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('catBack', 'assets/sprites/AtrasCAT4.png', {
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('meditacion', 'assets/sprites/MeditacionCAT.png', {
        frameWidth: 128,
        frameHeight: 128
    });
    this.load.image('bolita', 'assets/sprites/bVERDE.png'); // PNG de la bolita
}

function create() {
    console.log("Create ejecutándose");

    // Crear al jugador
    player = this.physics.add.sprite(100, 100, 'cat');
    player.setCollideWorldBounds(true);

    // Crear animaciones
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cat', { start: 10, end: 19 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('catFront', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('catBack', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    // Crear el borde de la barra de progreso
    progressBarBorder = this.add.graphics();
    progressBarBorder.lineStyle(2, 0x000000, 1); // Borde negro delgado
    progressBarBorder.strokeRect(10, 10, 300, 20);

    // Barra de progreso dorada
    progressBar = this.add.graphics();
    updateProgressBar();

    // Generar bolitas en posiciones aleatorias
    for (let i = 0; i < 3; i++) {
        generateBall(this);
    }

    // Configurar eventos táctiles para que el gato se mueva hacia la bolita
    this.input.on('pointerdown', function (pointer) {
        targetPosition.x = pointer.x;
        targetPosition.y = pointer.y;
        isMoving = true;
    });
}

function generateBall(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(50, config.height - 50);
    let ball = scene.physics.add.sprite(x, y, 'bolita').setScale(0.09); // Bolita más pequeña que el gato

    // Añadir movimiento de flotación
    scene.tweens.add({
        targets: ball,
        y: ball.y - 10, // Flotar hacia arriba y abajo
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    balls.push(ball);

    // Detectar colisión entre el jugador y las bolitas
    scene.physics.add.overlap(player, ball, () => {
        ball.destroy(); // Eliminar la bolita cuando el jugador la alcanza
        balls = balls.filter(b => b !== ball); // Eliminar la bolita de la lista
        generateBall(scene); // Generar una nueva bolita
        score += 1;  // Incrementar el contador
        updateProgressBar();  // Actualizar la barra de progreso

        // Mostrar animación y mensaje al alcanzar el máximo
        if (score >= maxScore) {
            showMeditationMessage(scene);
            score = 0; // Reiniciar el contador
        }
    });
}

function updateProgressBar() {
    progressBar.clear();
    progressBar.fillStyle(0xFFD700, 1); // Color dorado
    let barWidth = (score / maxScore) * 300; // Ancho de la barra
    progressBar.fillRect(10, 10, barWidth, 20); // Dibujar la barra
}

function showMeditationMessage(scene) {
    // Fondo celeste claro en el centro de la pantalla
    let messageBackground = scene.add.graphics();
    let centerX = config.width / 2;
    let centerY = config.height / 2;
    messageBackground.fillStyle(0x87CEEB, 1); // Celeste claro
    messageBackground.fillRoundedRect(centerX - 175, centerY - 130, 350, 280, 20); // Ajusta el ancho a 350 y la altura a 280

    // Sprite animado de MeditacionCAT que flota
    let meditationSprite = scene.add.sprite(centerX, centerY - 80, 'meditacion').setScale(1);
    scene.anims.create({
        key: 'meditacionAnim',
        frames: scene.anims.generateFrameNumbers('meditacion', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    meditationSprite.play('meditacionAnim');

    // Añadir animación de flotación al sprite
    scene.tweens.add({
        targets: meditationSprite,
        y: centerY - 90,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Crear el texto con una animación de entrada (aparece letra por letra)
    let message = "Cada bolita refleja los momentos compartidos y los recuerdos que guardo con cariño. Gracias por cada instante juntos.";
    let messageText = scene.add.text(centerX, centerY + 50, '', { // Mueve el texto más arriba
        fontSize: '18px',
        fill: '#000000',
        fontFamily: 'Verdana, sans-serif',
        align: 'center',
        wordWrap: { width: 300 } // Ajusta el ancho de la envoltura de texto a 300 para que no se salga
    }).setOrigin(0.5);

    let index = 0;
    scene.time.addEvent({
        delay: 50, // Intervalo entre la aparición de cada letra
        repeat: message.length - 1,
        callback: () => {
            messageText.text += message[index];
            index++;
        }
    });

    // Desaparecer el mensaje después de 10 segundos
    scene.time.delayedCall(10000, () => {
        meditationSprite.destroy();
        messageText.destroy();
        messageBackground.destroy();
    });
}




function update() {
    if (isMoving) {
        // Calcular la dirección hacia el objetivo
        let dx = targetPosition.x - player.x;
        let dy = targetPosition.y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Mover al jugador hacia el objetivo
        if (distance > 5) {  // Umbral para detenerse cuando esté cerca
            let velocityX = (dx / distance) * speed;
            let velocityY = (dy / distance) * speed;

            player.setVelocity(velocityX, velocityY);

            // Seleccionar la animación según la dirección
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    player.anims.play('right', true);
                } else {
                    player.anims.play('left', true);
                }
            } else {
                if (dy > 0) {
                    player.anims.play('down', true);
                } else {
                    player.anims.play('up', true);
                }
            }
        } else {
            player.setVelocity(0);
            player.anims.stop();
            isMoving = false;  // Detener el movimiento cuando se alcanza el objetivo
        }
    }
}
