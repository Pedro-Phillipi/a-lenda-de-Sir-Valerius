// 1. VARIÁVEIS GLOBAIS
let enemiesDefeatedGlobal = 0;

// ==========================================
// --- CENA DA FASE 1 (Grama e Céu Azul) ---
// ==========================================
class Fase1 extends Phaser.Scene {
    constructor() { super('Fase1'); }

    preload() {
        this.load.spritesheet('knight', 'assets/knight.png', { frameWidth: 32, frameHeight: 29 });
        this.load.spritesheet('fruit', 'assets/fruit.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('tiles', 'assets/world_tileset.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('slime', 'assets/slime_green.png', { frameWidth: 22, frameHeight: 25 });
        this.load.image('topL', 'assets/tile_0113.png'); 
        this.load.image('topR', 'assets/tile_0114.png');
        this.load.image('botL', 'assets/tile_0123.png');
        this.load.image('botR', 'assets/tile_0124.png');
    }

    create() {
        this.score = 0;
        this.cameras.main.setBackgroundColor('#87CEEB');
        this.platforms = this.physics.add.staticGroup();
        
        for (let x = 0; x < 800; x += 15) this.platforms.create(x, 584, 'tiles', 1).setScale(2).refreshBody();
        for (let x = 0; x < 200; x += 15) this.platforms.create(x, 500, 'tiles', 1).setScale(2).refreshBody();
        for (let x = 300; x < 500; x += 15) this.platforms.create(x, 400, 'tiles', 1).setScale(2).refreshBody();
        for (let x = 600; x < 800; x += 15) this.platforms.create(x, 320, 'tiles', 1).setScale(2).refreshBody();
        for (let x = 150; x < 350; x += 15) this.platforms.create(x, 240, 'tiles', 1).setScale(2).refreshBody(); 
        for (let x = 450; x < 650; x += 15) this.platforms.create(x, 160, 'tiles', 1).setScale(2).refreshBody();

        this.platforms.children.iterate(p => { p.body.checkCollision.down = p.body.checkCollision.left = p.body.checkCollision.right = false; });

        this.door = this.add.container(220, 150); 
        this.physics.world.enable(this.door);
        this.door.add([this.add.image(0, 0, 'topL').setScale(3), this.add.image(48, 0, 'topR').setScale(3), this.add.image(0, 48, 'botL').setScale(3), this.add.image(48, 48, 'botR').setScale(3)]);
        this.door.body.setAllowGravity(false).setSize(96, 96);

        this.enemies = this.physics.add.group();
        this.criarInimigo(400, 350, 'slime', 310, 485, 100);  
        this.criarInimigo(700, 270, 'slime', 610, 785, 80);   
        this.criarInimigo(550, 110, 'slime', 460, 635, -100); 

        this.player = this.physics.add.sprite(50, 520, 'knight').setScale(2);
        this.player.setCollideWorldBounds(true);

        if (!this.anims.exists('correr')) {
            this.anims.create({ key: 'parado', frames: this.anims.generateFrameNumbers('knight', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
            this.anims.create({ key: 'correr', frames: this.anims.generateFrameNumbers('knight', { start: 0, end: 3 }), frameRate: 12, repeat: -1 });
        }

        this.fruits = this.physics.add.group();
        const posFrutas1 = [{x:120, y:530}, {x:750, y:530}, {x:100, y:450}, {x:400, y:350}, {x:700, y:270}, {x:280, y:190}, {x:480, y:110}, {x:620, y:110}];
        posFrutas1.forEach(p => { this.fruits.create(p.x, p.y, 'fruit').setScale(2).setBounceY(0.4).setFrame(Phaser.Math.Between(0, 2)); });

        this.scoreText = this.add.text(16, 16, 'Frutas: 0/8', { fontSize: '32px', fill: '#000', fontWeight: 'bold' });
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.fruits, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.fruits, (p, f) => { f.disableBody(true, true); this.score++; this.scoreText.setText('Frutas: ' + this.score + '/8'); }, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.door, () => { if(this.score >= 8) this.scene.start('Fase2'); }, null, this);
    }

    update() {
        this.enemies.children.iterate(e => {
            if (!e || !e.active) return;
            if (e.x >= e.patrolMax) { e.setVelocityX(-100); e.setFlipX(true); } else if (e.x <= e.patrolMin) { e.setVelocityX(100); e.setFlipX(false); }
        });
        if (this.cursors.left.isDown) { this.player.setVelocityX(-160); this.player.flipX = true; this.player.anims.play('correr', true); }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(160); this.player.flipX = false; this.player.anims.play('correr', true); }
        else { this.player.setVelocityX(0); this.player.anims.play('parado', true); }
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-450);
        if (!this.player.body.touching.down) { this.player.anims.stop(); this.player.setFrame(2); }
    }

    criarInimigo(x, y, sprite, min, max, vel) {
        let s = this.enemies.create(x, y, sprite).setScale(2);
        s.patrolMin = min; s.patrolMax = max; s.setVelocityX(vel);
    }

    hitEnemy(player, enemy) {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
            enemy.disableBody(true, true); enemiesDefeatedGlobal++;
            player.setVelocityY(-300);
        } else { player.setPosition(50, 520); player.setVelocity(0,0); }
    }
}

// ==========================================
// --- CENA DA FASE 2 (Deserto com Vento) ---
// ==========================================
class Fase2 extends Phaser.Scene {
    constructor() { super('Fase2'); }
    preload() { this.load.spritesheet('slime_purple', 'assets/slime_purple.png', { frameWidth: 20, frameHeight: 25 }); }
    create() {
        this.score = 0;
        this.windForce = -25;
        this.cameras.main.setBackgroundColor('#da8422'); 
        this.platforms = this.physics.add.staticGroup();
        
        for (let x = 0; x < 800; x += 32) this.platforms.create(x, 584, 'tiles', 4).setScale(2).refreshBody();
        for (let x = 120; x < 330; x += 15) this.platforms.create(x, 480, 'tiles', 4).setScale(2).refreshBody();
        for (let x = 520; x < 730; x += 15) this.platforms.create(x, 380, 'tiles', 4).setScale(2).refreshBody();
        for (let x = 220; x < 430; x += 15) this.platforms.create(x, 250, 'tiles', 4).setScale(2).refreshBody();
        for (let x = 570; x < 730; x += 15) this.platforms.create(x, 150, 'tiles', 4).setScale(2).refreshBody();

        this.platforms.children.iterate(p => { p.body.checkCollision.down = p.body.checkCollision.left = p.body.checkCollision.right = false; });

        this.nextDoor = this.add.container(650, 60);
        this.physics.world.enable(this.nextDoor);
        this.nextDoor.add([this.add.image(0, 0, 'topL').setScale(3), this.add.image(48, 0, 'topR').setScale(3), this.add.image(0, 48, 'botL').setScale(3), this.add.image(48, 48, 'botR').setScale(3)]);
        this.nextDoor.body.setAllowGravity(false).setSize(96, 96);

        this.enemies = this.physics.add.group();
        this.criarInimigoRoxo(220, 430, 130, 320);
        this.criarInimigoRoxo(620, 330, 530, 720);
        this.criarInimigoRoxo(320, 200, 230, 420);

        // Jogador em x:30 garante que ele não toque em nenhuma fruta ao nascer
        this.player = this.physics.add.sprite(30, 500, 'knight').setScale(2);
        this.player.setCollideWorldBounds(true);

        this.fruits = this.physics.add.group();
        // 8 posições totalmente fixas e seguras
        const posFrutas2 = [
            {x:170, y:430}, {x:280, y:430}, // Plataforma 1
            {x:550, y:330}, {x:680, y:330}, // Plataforma 2
            {x:250, y:200}, {x:380, y:200}, // Plataforma 3
            {x:450, y:540}, {x:750, y:540}  // Chão
        ];
        
        posFrutas2.forEach(p => { 
            let f = this.fruits.create(p.x, p.y, 'fruit').setScale(2).setDepth(10);
            f.body.setAllowGravity(false); // Frutas flutuam para garantir que nunca sumam
            f.setFrame(Phaser.Math.Between(3, 5));
        });

        this.scoreText = this.add.text(16, 16, 'Frutas: 0/8', { fontSize: '32px', fill: '#000', fontWeight: 'bold' });
        this.windText = this.add.text(330, 20, 'Deserto Ventoso ➔', { fontSize: '24px', fill: '#0055ff', alpha: 0.7 });
        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        
        this.physics.add.overlap(this.player, this.fruits, (p, f) => { 
            f.disableBody(true, true); 
            this.score++; 
            this.scoreText.setText('Frutas: ' + this.score + '/8'); 
        }, null, this);
        
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.nextDoor, () => { if(this.score >= 8) this.scene.start('Fase3'); }, null, this);
    }

    update() {
        this.player.setAccelerationX(this.windForce * 10);
        this.enemies.children.iterate(e => {
            if (!e || !e.active) return;
            if (e.x >= e.patrolMax) { e.setVelocityX(-130); e.setFlipX(true); } else if (e.x <= e.patrolMin) { e.setVelocityX(130); e.setFlipX(false); }
        });
        if (this.cursors.left.isDown) { this.player.setVelocityX(-160 + this.windForce); this.player.flipX = true; this.player.anims.play('correr', true); }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(160 + this.windForce); this.player.flipX = false; this.player.anims.play('correr', true); }
        else { this.player.setVelocityX(this.windForce); this.player.anims.play('parado', true); }
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-450);
    }

    criarInimigoRoxo(x, y, min, max) {
        let s = this.enemies.create(x, y, 'slime_purple').setScale(2);
        s.patrolMin = min; s.patrolMax = max; s.setVelocityX(130);
    }

    hitEnemy(player, enemy) {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
            enemy.disableBody(true, true); player.setVelocityY(-300);
        } else { player.setPosition(30, 500); player.setVelocity(0,0); }
    }
}

// ==========================================
// --- CENA DA FASE 3 (Ruínas Escorregadias) ---
// ==========================================
class Fase3 extends Phaser.Scene {
    constructor() { super('Fase3'); }

    preload() {
        this.load.spritesheet('slime_all', 'assets/slime_purple.png', { frameWidth: 24, frameHeight: 25 });
    }

    create() {
        this.score = 0;
        this.cameras.main.setBackgroundColor('#22cfe6'); 
        this.platforms = this.physics.add.staticGroup();

        for (let x = 0; x < 800; x += 32) this.platforms.create(x, 584, 'tiles', 23).setScale(2).refreshBody();
        for (let x = 120; x < 330; x += 15) this.platforms.create(x, 480, 'tiles', 23).setScale(2).refreshBody(); 
        for (let x = 520; x < 730; x += 15) this.platforms.create(x, 380, 'tiles', 23).setScale(2).refreshBody(); 
        for (let x = 220; x < 430; x += 15) this.platforms.create(x, 250, 'tiles', 23).setScale(2).refreshBody(); 
        for (let x = 570; x < 730; x += 15) this.platforms.create(x, 150, 'tiles', 23).setScale(2).refreshBody(); 

        this.platforms.children.iterate(p => { p.body.checkCollision.down = p.body.checkCollision.left = p.body.checkCollision.right = false; });

        this.elixir = this.physics.add.sprite(650, 100, 'tiles', 48).setScale(3);
        this.elixir.setTint(0xff00ff); 

        this.player = this.physics.add.sprite(100, 500, 'knight').setScale(2);
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(200);

        this.enemies = this.physics.add.group();
        this.criarInimigoVermelho(220, 430, 130, 320); 
        this.criarInimigoVermelho(620, 330, 530, 720);
        this.criarInimigoVermelho(320, 200, 230, 420);

        this.fruits = this.physics.add.group();
        const posFrutas3 = [{x:208, y:430}, {x:550, y:330}, {x:100, y:540}, {x:700, y:540}];
        posFrutas3.forEach(p => { this.fruits.create(p.x, p.y, 'fruit').setScale(2).setBounceY(0.4).setFrame(6); });

        this.scoreText = this.add.text(16, 16, 'Energia: 0/4', { fontSize: '32px', fill: '#fff', fontWeight: 'bold' });
        this.add.text(280, 20, 'RUÍNAS ESCORREGADIAS', { fontSize: '24px', fill: '#fff', fontWeight: 'bold' });
        
        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.fruits, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.elixir, this.platforms);
        
        this.physics.add.overlap(this.player, this.fruits, (p, f) => { f.disableBody(true, true); this.score++; this.scoreText.setText('Energia: ' + this.score + '/4'); }, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        
        this.physics.add.overlap(this.player, this.elixir, () => {
            if(this.score >= 4) {
                this.add.text(150, 250, 'ELIXIR COLETADO!\nÉDENIA ESTÁ SALVA!', { fontSize: '40px', fill: '#ff00ff', align: 'center', stroke: '#000', strokeThickness: 6 });
                this.physics.pause();
                this.player.setTint(0xff00ff);
            }
        }, null, this);
    }

    update() {
        this.enemies.children.iterate(e => {
            if (!e || !e.active) return;
            if (e.x >= e.patrolMax) { e.setVelocityX(-100); e.setFlipX(true); } 
            else if (e.x <= e.patrolMin) { e.setVelocityX(100); e.setFlipX(false); }
        });

        if (this.cursors.left.isDown) { this.player.setVelocityX(-160); this.player.flipX = true; this.player.anims.play('correr', true); }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(160); this.player.flipX = false; this.player.anims.play('correr', true); }
        else { if (Math.abs(this.player.body.velocity.x) < 10) { this.player.setVelocityX(0); this.player.anims.play('parado', true); } }
        
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-450);
        if (!this.player.body.touching.down) { this.player.anims.stop(); this.player.setFrame(2); }
    }

    criarInimigoVermelho(x, y, min, max) {
        let s = this.enemies.create(x, y, 'slime_all').setScale(2);
        s.setFrame(7); 
        s.patrolMin = min; 
        s.patrolMax = max; 
        s.setVelocityX(100);
    }

    hitEnemy(player, enemy) {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
            enemy.disableBody(true, true);
            player.setVelocityY(-300);
        } else { 
            player.setPosition(100, 500); 
            player.setVelocity(0,0); 
        }
    }
}

// 4. CONFIGURAÇÃO FINAL
const config = {
    type: Phaser.AUTO,
    width: 800, height: 600, pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 600 }, debug: false } },
    scene: [Fase1, Fase2, Fase3] 
};
const game = new Phaser.Game(config);