
    // Enemy wave
    var enemies;
    var debugWave = false;
    var waveSize = 5;
    var spawnCount = 0;
    var spawnCountText;
    var killCount = 0;

    // Level info
    var level = 1;
   
    // Environment
    var walls;
    var lanes;
    const NUM_LANE_WALL = 60;
    const depths = {
        GROUND: 0,
        BELOW_ENEMY: 1,
        ENEMY: 2,
        ABOVE_ENEMY: 3,
        POINTER: 4
    };
    var groundImage;
    var oopBounds;
   
    // Player stats and HUD
    var playerHealth = 100;
    var playerHealthText;
    var score = 0;
    var scoreText;
    var gameOverText;
    
    // Weapons
    const weapons = {
        BOOK: 'book',
        BUBBLE: 'bubble',
        HIRAISHIN: 'hiraishin',
        PIKACHU: 'pikachu',
        PORTAL: 'portal',
        TELEPORTER: 'teleporter',
    }
    var selectedWeapon = weapons.TELEPORTER;
    var selectedWeaponText;
    // Books
    var books;
    var bookVelocity = -500;
    var bookAngularVelocity = -720
    // Portals
    var portals;
    var portalBounds;
    var portalDuration = 5000;
    // Pikachu
    var pikachuPointer;
    var thunderAnimation;
    var thunderHitBox;
    const THUNDER_ACCURACY = 70;
    var allowCharge = true;
    var isChargingThunder = false;
    var chargePercentage = 0;
    var chargeIncrement = 10;
    var chargeLock = false;
    var chargeDelay = 500;
    var pikachuCooldown = 1000;
    var pikachuPointerDefaultAlpha = 0.5;
    // Bubbles
    var bubblePointer;
    var bubblePointerDefaultAlpha = 0.5;
    var bubbleActivated = false;
    // Hiraishin
    var hiraishinPointer;    
    var hiraishinPointerDefaultAlpha = 0.5;
    var hiraishinTargettingActive = false;
    var kunaiGroup;
    var kunaiHitBox;
    var numberOfKunai = 5;
    var kunaiThrown = false;

export class BattleScene extends Phaser.Scene {


    constructor() {
        super({
            key: 'battleScene',
        });
    }
    
    preload() {
        this.load.image('enemy', 'assets/testenemy.png');
        this.load.image('battleground', 'assets/battleground.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('lane', 'assets/lane.png');
        this.load.image('book', 'assets/book.png');
        this.load.image('portal_orange', 'assets/portal_orange.png');
        this.load.image('portal_mask', 'assets/portal_mask.png');
        this.load.spritesheet('pikachu', 'assets/pikachu_spritesheet.png', { 
            frameWidth: 42,
            frameHeight: 60,
            startFrame: 0,
            endFrame: 3
        });
        this.load.spritesheet('thunder', 'assets/thunder_spritesheet2.png', {
            frameWidth: 110,
            frameHeight: 230,
            startFrame: 0,
            endFrame: 5
        });
        this.load.image('thunderHitBox', 'assets/thunderHitBox.png');
        this.load.spritesheet('bubblePointer', 'assets/bubble_spritesheet.png', {
            frameWidth: 20,
            frameHeight: 20,
            startFrame: 0,
            endFrame: 3
        });
        this.load.image('hiraishinAOE', 'assets/hiraishinAOE.png');
        this.load.image('kunai', 'assets/kunai.png');
        this.load.image('kunaiHitBox', 'assets/kunaiHitBox.png');
        this.load.image('pixel', 'assets/pixel.png');
    }

    create() {
        // Add background elements
        this.add.image(400, 300, 'battleground');
        groundImage = this.add.image(338, 450, 'ground');

        // Pointers
        pikachuPointer = this.add.sprite(400, 300, 'pikachu');
        pikachuPointer.alpha = pikachuPointerDefaultAlpha;
        pikachuPointer.visible = false;
        pikachuPointer.depth = groundImage.depth + depths.POINTER;
        this.anims.create({
            key: 'idlePika',
            frames: [ { key: 'pikachu', frame: 0 } ],
            frameRate: 20,
        });
        this.anims.create({
            key: 'chargeThunder',
            frames: this.anims.generateFrameNumbers('pikachu', { start: 1, end: 2 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'useThunder',
            frames: [ { key: 'pikachu', frame: 3 } ],
            frameRate: 20,
        });
        thunderAnimation = this.add.sprite(400, 300, 'thunder');
        thunderAnimation.visible = false;
        thunderAnimation.depth = groundImage.depth + depths.ABOVE_ENEMY;
        this.anims.create({
            key: 'thunderbolt',
            frames: this.anims.generateFrameNumbers('thunder', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 2
        });
        bubblePointer = this.physics.add.sprite(400, 300, 'bubblePointer');
        bubblePointer.alpha = bubblePointerDefaultAlpha;
        bubblePointer.depth = groundImage.depth + depths.POINTER;
        this.anims.create({
            key: 'idleBubble',
            frames: [ { key: 'bubblePointer', frame: 0 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'activeBubble',
            frames: this.anims.generateFrameNumbers('bubblePointer', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        bubblePointer.disableBody(true, true);
        hiraishinPointer = this.physics.add.image(400, 300, 'hiraishinAOE');
        hiraishinPointer.alpha = hiraishinPointerDefaultAlpha;
        hiraishinPointer.depth = groundImage.depth + depths.GROUND;
        hiraishinPointer.disableBody(true, true);
        hiraishinPointer.setData('tween', this.tweens.add({
            targets: hiraishinPointer,
            duration: 250,
            scaleX: 4,
            scaleY: 4,
            yoyo: true,
            repeat: -1
        }));
        // TODO Currently masking out the sky with the test ground
        // Maybe make a better mask and not hardcode the values
        hiraishinPointer.mask = new Phaser.Display.Masks.BitmapMask(this, this.make.image({
            x: 400,
            y: 150,
            key: 'ground',
            add: false
        }));
        hiraishinPointer.mask.invertAlpha = true;

        // Register keyboard inputs
        // Create key objects, which are emitOnce by default.
        // Then create listener event for the key input, which because of the created Key should only fire once.
        var key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.input.keyboard.on('keydown_ONE', function (event) {
            selectedWeapon = weapons.TELEPORTER;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        var key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.input.keyboard.on('keydown_TWO', function (event) {
            selectedWeapon = weapons.BOOK;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        var key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.input.keyboard.on('keydown_THREE', function (event) {
            selectedWeapon = weapons.PORTAL;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        var key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.input.keyboard.on('keydown_FOUR', function (event) {
            selectedWeapon = weapons.PIKACHU;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        var key5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
        this.input.keyboard.on('keydown_FIVE', function (event) {
            selectedWeapon = weapons.HIRAISHIN;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        var key6 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
        this.input.keyboard.on('keydown_SIX', function (event) {
            selectedWeapon = weapons.BUBBLE;
            selectedWeaponText.setText('Weapon: ' + selectedWeapon);
        });
        //var key7 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);
        //var key8 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT);

        var reloadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.input.keyboard.on('keydown_R', function (event) {
        });

        // Instantiate physics objects

        // Create lanes
        lanes = this.physics.add.staticGroup({
            key: 'lane',
            repeat: NUM_LANE_WALL - 1,
            setXY: { x: 400, y: 300, stepY: 5 },
            visible: false
        });

        // Create walls
        walls = this.physics.add.staticGroup({
            key: 'wall',
            repeat: NUM_LANE_WALL - 1,
            setXY: { x: 500, y: 300, stepX: 3 },
            visible: false
        });

        // Create enemies
        enemies = this.physics.add.group({
            defaultKey: 'enemy',
            maxSize: 10
        });

        // Create out-of-play bounds (remove enemies once they hit this)
        oopBounds = this.physics.add.staticGroup();
        var oopLeft = oopBounds.create(-100, 300, 'wall');
        oopLeft.setScale(2);
        oopLeft.body.updateFromGameObject();
        var oopRight = oopBounds.create(900, 300, 'wall');
        oopRight.setScale(2);
        oopRight.body.updateFromGameObject();
        var oopTop = oopBounds.create(400, -100, 'lane');
        oopTop.setScale(2);
        oopTop.body.updateFromGameObject();
        var oopBottom = oopBounds.create(400, 700, 'lane');
        oopBottom.setScale(2);
        oopBottom.body.updateFromGameObject();

        // Create weapon object groups
        books = this.physics.add.group();
        books.defaultKey = 'book';
        portals = this.physics.add.staticGroup();
        portals.defaultKey = 'portal_orange';
        portalBounds = this.physics.add.staticGroup();
        portalBounds.defaultKey = 'wall';
        thunderHitBox = this.physics.add.staticGroup();
        thunderHitBox.defaultKey = 'thunderHitBox';
        kunaiGroup = this.physics.add.group();
        kunaiGroup.defaultKey = 'kunai';
        kunaiHitBox = this.physics.add.staticGroup();
        kunaiHitBox.defaultKey = 'kunaiHitBox';

        this.physics.add.collider(books, oopBounds, hitOOP, null, this);

        // Add HUD elements
        scoreText = this.add.text(16, 16, 'Score: 0');
        playerHealthText = this.add.text(650, 16, 'Health: 100');
        selectedWeaponText = this.add.text(16, 32, 'Weapon: ' + weapons.TELEPORTER);
        spawnCountText = this.add.text(16, 48, 'Spawn Count: 0');

        // DEBUG: Generate a stationary grid of enemies
        if (debugWave)
        {
            // Generate grid of stationary enemies
            for (var xPos = 100; xPos < 500; xPos += 150)
            {
                // It's OK to have laneIndex = NUM_LANE_WALL since spawnEnemy()
                // will clamp the index to NUM_LANE_WALL - 1 anyway
                for (var laneIndex = 0; laneIndex <= NUM_LANE_WALL; laneIndex += 20)
                {
                    var e = enemies.get();
                    if (e)
                    {
                        e.setActive(true);
                        e.setVisible(true);
                        spawnEnemy.call(this, e, xPos, laneIndex, 0);
                    }
                }
            }
        }

        // Pointer event listeners
        groundImage.setInteractive().on('pointerdown', activateWeaponOnGround, this);
        groundImage.setInteractive().on('pointermove', moveWeaponOnGround, this);
        groundImage.setInteractive().on('pointerup', releaseWeaponOnGround, this);
        this.input.on('pointerdown', activateWeapon, this);
        this.input.on('pointerup', releaseWeapon, this);
        // TODO Currently will only update image if the pointer moves
        // If the weapon is switched but the pointer isn't moved, the pointer is unchanged until it does
        // We can add a step to update the image in the weapon selection logic as well
        // TODO Maybe create a pointer object that contains all the pointers for each weapon
        // And instead of an if-else statement just index based on the weapons enum
        this.input.on('pointermove', function (pointer) {

            pikachuPointer.visible = (selectedWeapon == weapons.PIKACHU);
            bubblePointer.visible = (selectedWeapon == weapons.BUBBLE);
            if (selectedWeapon == weapons.PIKACHU)
            {
                pikachuPointer.setPosition(pointer.x, pointer.y);
            }
            else if (selectedWeapon == weapons.BUBBLE)
            {
                bubblePointer.setPosition(pointer.x, pointer.y);
            }
        });

        // Scene event listeners
        this.events.on('wake', levelUp);
    }

    update() {
        // Reserve available enemy objects to spawn if the wave isn't over
        if (spawnCount < waveSize && enemies.getTotalFree() > 0 && !debugWave)
        {
            allocateEnemy.call(this);
        }

        if (selectedWeapon == weapons.PIKACHU && isChargingThunder)
        {
            if (chargePercentage < 100 && !chargeLock)
            {
                console.log("add charge event");
                chargeLock = true;
                this.time.addEvent({
                    delay: chargeDelay,
                    callback: increaseCharge,
                    callbackScope: this
                });
            }
            pikachuPointer.alpha = pikachuPointerDefaultAlpha + 
                (1 - pikachuPointerDefaultAlpha) * (chargePercentage / 100);
        }
        else if (kunaiThrown)
        {
            if (kunaiGroup.children.entries.length == 0)
            {
                kunaiThrown = false;
            }
            else
            {
                console.log("number of kunai: " + kunaiGroup.children.entries.length);
                // Note: Can't use Set.Iterate here because kunaiFlightControl modifies the set size
                for (var i = 0; i < kunaiGroup.children.entries.length; i++)
                {
                    kunaiFlightControl.call(this, kunaiGroup.children.entries[i]);
                }
            }
        }
    }
}

function increaseCharge()
{
    chargePercentage += chargeIncrement;
    chargeLock = false;
    console.log("increase charge: " + chargePercentage);
}

function resetPikachu()
{
    pikachuPointer.alpha = pikachuPointerDefaultAlpha;
    pikachuPointer.anims.play('idlePika');
    thunderAnimation.visible = false;
    allowCharge = true;
}

function kunaiFlightControl(kunai)
{
    var path = kunai.getData('path');
    var pathProgress = kunai.getData('pathProgress');
    if (pathProgress < path.length)
    {
        kunai.x = path[pathProgress].x;
        kunai.y = path[pathProgress].y;
        kunai.rotation = path[pathProgress].angle;
        pathProgress += 10;
        kunai.setData('pathProgress', pathProgress);
    }
    if (pathProgress >= path.length)
    {
        console.log('create hit box');
        // Create temporary hit box
        var hitBox = kunaiHitBox.create(kunai.x, kunai.y);
        hitBox.visible = false;
        this.time.addEvent({
            delay: 100,
            callback: clearKunaiHitBox,
            args: [hitBox]
        });
        // Create alpha tween
        this.tweens.add({
            targets: kunai,
            duration: 500,
            alpha: 0
        });
        // TODO: This currently only removes the kunai from the group,
        // but the game object still exists! I need to refactor how
        // I do sprite pool management.
        kunaiGroup.remove(kunai);
    }
}

function hitWall(enemy, wall)
{
    if (playerHealth > 0)
    {
        playerHealth -= 10;
        playerHealthText.setText('Health: ' + playerHealth);
    }

    if (playerHealth <= 0)
    {
        gameOverText = this.add.text(325, 300, 'GAME OVER', { fontSize: '50px', fill: '#000' });
        // Clean up enemies upon game over and stop spawning enemies
        //spawnTimer.remove();
        //enemies.children.iterate(function (child) {
        //    child.disableBody(true, true);
        //});
    }
}

function hitOOP(obj, oop)
{
    obj.disableBody(true, true);
}

function hitEnemyOOP(enemy, oop)
{
    console.log("enemy hit OOP");
    recordEnemyKill.call(this, enemy);
}

function hitBook(enemy, book)
{
    // Remove this collider early so other books won't hit it
    this.physics.world.removeCollider(enemy.getData('bookCollider'));
    enemy.setVelocity(-400, -400);
    enemy.setGravityY(300);
    book.setVelocityX(bookVelocity);
    book.setAngularVelocity(bookAngularVelocity);
}

function hitPortal(enemy, portal)
{
    // Let the enemy fall through its lane
    this.physics.world.removeCollider(enemy.getData('laneCollider'));
    enemy.setGravityY(300);
    // Mask the enemy as it falls through the portal
    enemy.mask = new Phaser.Display.Masks.BitmapMask(this, portal.getData('mask'));
    enemy.mask.invertAlpha = true;
    // Add bounds to enemy as it falls through the portal to prevent clipping through ground
    enemy.setData('portalBoundLeft', this.physics.add.collider(enemy, portal.getData('boundLeft')));
    enemy.setData('portalBoundRight', this.physics.add.collider(enemy, portal.getData('boundRight')));
    // Prevent the enemy from colliding with other portals and resetting its mask
    this.physics.world.removeCollider(enemy.getData('portalCollider'));
}

function hitThunder(enemy, thunder)
{
    if (Phaser.Math.Between(0, 100) < THUNDER_ACCURACY)
    {
        var distance = Phaser.Math.Distance.BetweenPoints(enemy.getCenter(), thunder.getCenter());
        var direction = Math.sign(enemy.x - thunder.x);
        console.log(distance);
        removeAllCollidersFromEnemy.call(this, enemy, false);
        var blastMagnitude = 
            200 / Math.max(distance, 40);
        console.log("blastMagnitude: " + blastMagnitude);
        enemy.setVelocity(50 * blastMagnitude * direction, -250 * Math.abs(blastMagnitude))
        enemy.setAngularVelocity(-360);
        enemy.setGravityY(300);
        this.tweens.add({
            targets: enemy,
            duration: 1000,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0
        });
    }
}

function hitBubble(enemy, bubble)
{
    removeAllCollidersFromEnemy.call(this, enemy, false);
    enemy.setVelocity(0, -100);
}

function hitKunai(enemy, kunai)
{
    recordEnemyKill.call(this, enemy);
}

function allocateEnemy()
{
    var e = enemies.get();
    if (!e) return;
    // There is a free enemy object available
    // Set it active, otherwise it remains available for another successful call to get()
    // This allows multiple different spawnEnemy events to be fired for the same enemy
    // Super bad since it'll repeatedly restart its position, without any collider cleanup
    e.setActive(true);
    // If an enemy object was created with get(), its location won't be set
    // until spawnEnemy() is called, so set it invisible for now.
    e.setVisible(false);
    this.time.addEvent(
        {
            delay: Phaser.Math.Between(1000, 2000),
            callback: spawnEnemy,
            callbackScope: this,
            args: [e]
        });
    spawnCount++;
}
    

function spawnEnemy(e, debugXStartPos = 0, debugLaneIndex = 0, debugSpeed = 0)
{
    spawnCountText.setText("Spawn Count: " + spawnCount);
    // Choose a random lane/wall for this enemy
    var index = debugWave ? 
        Phaser.Math.Clamp(debugLaneIndex, 0, NUM_LANE_WALL - 1) : 
        Phaser.Math.Between(0, NUM_LANE_WALL - 1);
    var l = lanes.children.entries[index];
    var w = walls.children.entries[index];

    // ENEMY STATS
    // Starting position
    e.setVisible(true);
    e.x = debugWave ? debugXStartPos : 0;
    e.y = l.y - l.height/2 - e.height/2;
    e.setData('startX', e.x);
    e.setData('startY', e.y);
    // These attributes don't seem to be reset perfectly in cleanup
    e.rotation = 0;
    // Walk speed
    var speed = debugWave ? debugSpeed : Phaser.Math.Between(100, 200);
    e.setData('speed', speed);
    e.setVelocityX(speed);
    // Health
    e.setData('health', 100);
    // Depth
    // Make enemies always on top of ground level
    e.depth = groundImage.depth + depths.ENEMY;

    // ENEMY COLLIDERS/LISTENERS
    // Need to be cleaned up before being reused
    // Environment colliders
    e.setData('laneCollider', this.physics.add.collider(e, l, landOnGround, null, this));
    e.setData('wallCollider', this.physics.add.collider(e, w, hitWall, null, this));
    e.setData('oopCollider', this.physics.add.collider(e, oopBounds, hitEnemyOOP, null, this));
    // Weapon colliders
    e.setData('bookCollider', this.physics.add.collider(e, books, hitBook, null, this));
    e.setData('portalCollider', this.physics.add.overlap(e, portals, hitPortal, null, this));
    e.setData('thunderCollider', this.physics.add.overlap(e, thunderHitBox, hitThunder, null, this));
    e.setData('kunaiCollider', this.physics.add.overlap(e, kunaiHitBox, hitKunai, null, this));
    e.setData('bubbleCollider', this.physics.add.overlap(e, bubblePointer, hitBubble, null, this));
    // Click event listener
    e.setInteractive().on(
        'pointerdown', 
        function (pointer) {
            if (selectedWeapon == weapons.TELEPORTER)
            {
                console.log("click detected");
                var health = e.getData('health');
                health -= 100;
                if (health <= 0)
                {
                    recordEnemyKill.call(this, e);
                }
                e.setData('health', health);
            }
        }, 
        this);
}

function recordEnemyKill(enemy)
{
    // Update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    // Reset the enemy
    // Resetting the position appeared to fix some weird hitbox glitching
    // if a tween was being applied to the object while it hit the OOP boundary
    enemy.setPosition(0, 0);
    enemy.setVelocity(0, 0);
    enemy.setAngularVelocity(0);
    enemy.setRotation(0); // Doesn't appear to work perfectly
    enemy.setGravity(0, 0);
    enemy.setScale(1, 1);
    enemy.setAlpha(1);

    // Perform cleanup
    removeAllCollidersFromEnemy.call(this, enemy);
    enemy.removeAllListeners();
    enemy.clearMask();
    this.tweens.killTweensOf(enemy);

    enemies.killAndHide(enemy);
    killCount++;
    if (killCount == waveSize)
    {
        console.log("shop");
        killCount = 0;
        this.scene.switch('shopScene');
    }
}

// Reset motion for enemies once they land back on the ground
function landOnGround(enemy, ground)
{
    enemy.setVelocityX(enemy.getData('speed'));
    enemy.setGravityY(0);
}

// Handle weapon actions when mouse is clicked on the ground
function activateWeaponOnGround()
{
    if (selectedWeapon == weapons.BOOK)
    {
        var b = books.create();
        var laneWall = getLaneAndWallFromYPos(this.input.activePointer.y);
        b.x = laneWall.wall.x;
        b.y = this.input.activePointer.y;
        // TODO Currently the rotation only affects the GameObject but not the hitbox. This might be OK
        b.setVelocityX(bookVelocity);
        b.setAngularVelocity(bookAngularVelocity);
        b.setScale(0.3);
    }
    else if (selectedWeapon == weapons.PORTAL)
    {
        // TODO If portal size clips outside the ground boundaries,
        // relocate it away from the actual pointer position to something else
        var p = portals.create(this.input.activePointer.x, this.input.activePointer.y);
        // TODO Shape portal hitbox size and location based on enemy size
        // Currently hardcoding enemy size as 30x30px
        p.body.setSize(p.body.width - 60, 5);
        p.body.setOffset(30, -5);
        p.depth = groundImage.depth + depths.GROUND;
        // TODO Remove hardcode for portal mask offset
        var mask = this.make.image({
            x: p.x,
            y: p.y + 150,
            key: 'portal_mask',
            add: false
        });
        p.setData('mask', mask);

        // Set bounds on the portal to constrain enemies once they've been caught
        var pbLeft = portalBounds.create(p.x - p.width/2, p.y);
        pbLeft.visible = false;
        p.setData('boundLeft', pbLeft);
        var pbRight = portalBounds.create(p.x + p.width/2, p.y);
        pbRight.visible = false;
        p.setData('boundRight', pbRight);

        this.time.addEvent({
            delay: portalDuration,
            callback: closePortal,
            args: [p]
        });
    }
    else if (selectedWeapon == weapons.HIRAISHIN)
    {
        hiraishinTargettingActive = true;
        hiraishinPointer.enableBody(
            true,
            this.input.activePointer.x,
            this.input.activePointer.y,
            true,
            true);
    }
}

function activateWeapon()
{
    if (selectedWeapon == weapons.PIKACHU)
    {
        if (allowCharge)
        {
            console.log("Pikachu activate");
            isChargingThunder = true;
            chargePercentage = 0;
            pikachuPointer.anims.play('chargeThunder');
        }
    }
    else if (selectedWeapon == weapons.BUBBLE)
    {
        bubbleActivated = true;
        bubblePointer.enableBody(
            true,
            this.input.activePointer.x,
            this.input.activePointer.y,
            true,
            true);
        bubblePointer.anims.play('activeBubble');
    }
}

function moveWeaponOnGround()
{
    if (selectedWeapon == weapons.HIRAISHIN && hiraishinTargettingActive)
    {
        hiraishinPointer.setPosition(this.input.activePointer.x, this.input.activePointer.y);
    }
}

function releaseWeaponOnGround()
{
}

function releaseWeapon()
{
    if (selectedWeapon == weapons.PIKACHU && isChargingThunder)
    {
        console.log("Pikachu release");
        isChargingThunder = false;
        allowCharge = false;
        pikachuPointer.anims.play('useThunder');

        var releasedOnGround = this.input.activePointer.y > (groundImage.y - groundImage.height/2);
        thunderAnimation.setScale(1 + chargePercentage / 100, 1 + chargePercentage / 100);
        thunderAnimation.x = this.input.activePointer.x;
        if (releasedOnGround)
        {
            thunderAnimation.y = this.input.activePointer.y - 
                (thunderAnimation.height * thunderAnimation.scaleY)/2;
        }
        else
        {
            thunderAnimation.y = groundImage.y - groundImage.height/2 -
                (thunderAnimation.height * thunderAnimation.scaleY)/2;
        }
        thunderAnimation.visible = true;
        thunderAnimation.anims.play('thunderbolt');
        this.time.addEvent({
            delay: pikachuCooldown,
            callback: resetPikachu,
            callbackScope: this
        });

        var hitBox = thunderHitBox.create();
        hitBox.x = this.input.activePointer.x;
        if (releasedOnGround)
        {
            hitBox.y = this.input.activePointer.y;
        }
        else
        {
            hitBox.y = groundImage.y - groundImage.height/2;
        }
        hitBox.setScale(1 + chargePercentage / 25, 1 + chargePercentage / 25);
        hitBox.body.updateFromGameObject();
        hitBox.visible = true;
        this.time.addEvent({
            delay: 100,
            callback: clearThunderHitBox,
            args: [hitBox]
        });
    }
    else if (selectedWeapon == weapons.BUBBLE)
    {
        bubbleActivated = false;
        bubblePointer.anims.play('idleBubble');
        bubblePointer.disableBody(true, true);
    }
    else if (selectedWeapon == weapons.HIRAISHIN && hiraishinTargettingActive)
    {
        // Disable AOE marker
        hiraishinTargettingActive = false;
        hiraishinPointer.disableBody(true, true);
        // Generate kunai and paths
        for (var kunaiIndex = 0; kunaiIndex < numberOfKunai; kunaiIndex++)
        {
            // Calculate path points
            var path = [];
            var points = {
                'x': [ 0, 0, 0 ],
                'y': [ 0, 0, 0 ]
            };
            // Point 3: Landing point
            points.x[2] = Phaser.Math.Between(
                hiraishinPointer.x - hiraishinPointer.body.width/2,
                hiraishinPointer.x + hiraishinPointer.body.width/2);
            points.y[2] = Phaser.Math.Between(
                hiraishinPointer.y - hiraishinPointer.body.height/2,
                hiraishinPointer.y + hiraishinPointer.body.height/2);
            // Point 1: Starting point
            // TODO: Change 200 to the actual wall height
            var laneWall = getLaneAndWallFromYPos(points.y[2]);
            // Set starting point a little behind the wall so that we can still
            // hit enemies that are right at the wall
            points.x[0] = laneWall.wall.x + 100;
            points.y[0] = laneWall.lane.y - 200;
            // Point 2: Control point
            points.x[1] = points.x[0] - (points.x[0] - points.x[2])*0.3;
            points.y[1] = points.y[0] - 100;
            // Perform path interpolation
            var ix = 0;
            // TODO Don't hardcode game width
            var pathIncrement = 1 / 800; // 1 pixel
            for (var pathPos = 0; pathPos <= 1; pathPos += pathIncrement)
            {
                var px = Phaser.Math.Interpolation.Bezier(points.x, pathPos);
                var py = Phaser.Math.Interpolation.Bezier(points.y, pathPos);
                var node = { x: px, y: py, angle: 0 };
                if (ix > 0)
                {
                    node.angle = Phaser.Math.Angle.Reverse(
                        Phaser.Math.Angle.BetweenPoints(path[ix - 1], node));
                }
                path.push(node);
                ix++;
                // Debug: draw kunai path
                //this.add.image(px, py, 'pixel');
            }
            // Create kunai game object
            var kunai = kunaiGroup.create(points.x[0], points.y[0]);
            kunai.setData('points', points);
            kunai.setData('path', path);
            kunai.setData('pathProgress', 0);
        }
        kunaiThrown = true;
    }
}

function getLaneAndWallFromYPos(y)
{
    // Map the y-position to lane, find the corresponding wall
    // Subtract first lane position divided by lane increments
    var laneIndex = Phaser.Math.Clamp(
        Phaser.Math.RoundTo((y - lanes.children.entries[0].y) / 
        (lanes.children.entries[1].y - lanes.children.entries[0].y), 0),
        0, NUM_LANE_WALL - 1);
    return { 
        lane: lanes.children.entries[laneIndex],
        wall: walls.children.entries[laneIndex]
    };
}

function levelUp()
{
    console.log('levelUp');
    level++;
    waveSize *= level;
    killCount = 0;
    spawnCount = 0;
}

function closePortal(portal)
{
    portalBounds.remove(portal.getData('boundLeft'), true, true);
    portalBounds.remove(portal.getData('boundRight'), true, true);
    portals.remove(portal, true, true);
}

function clearThunderHitBox(hitBox)
{
    thunderHitBox.remove(hitBox, true, true);
}

function clearKunaiHitBox(hitBox)
{
    console.log("remove kunai hitbox");
    kunaiHitBox.remove(hitBox, true, true);
}

function removeAllCollidersFromEnemy(enemy, removeOOP)
{
    this.physics.world.removeCollider(enemy.getData('laneCollider'));
    this.physics.world.removeCollider(enemy.getData('wallCollider'));
    if (removeOOP) this.physics.world.removeCollider(enemy.getData('oopCollider'));
    this.physics.world.removeCollider(enemy.getData('bookCollider'));
    this.physics.world.removeCollider(enemy.getData('portalCollider'));
    this.physics.world.removeCollider(enemy.getData('portalBoundLeft'));
    this.physics.world.removeCollider(enemy.getData('portalBoundRight'));
    this.physics.world.removeCollider(enemy.getData('thunderCollider'));
    this.physics.world.removeCollider(enemy.getData('bubbleCollider'));
    this.physics.world.removeCollider(enemy.getData('kunaiCollider'));
}
