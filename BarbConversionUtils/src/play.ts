namespace Barbarian {

    export class Play extends Phaser.State {

        game: Barbarian.Game;

        background: Phaser.BitmapData;
        enemies: Barbarian.Enemies.Enemy[];
        changeFrameRate: any;
        hud: Hud;

        inputManager: Barbarian.Input.InputManager;

        preload() {
            this.load.atlasJSONArray('area', 'assets/area.png', 'assets/area.json');
            this.load.json('rooms', 'assets/rooms.json');
            this.load.atlasJSONArray('misc', 'assets/miscspr.png', 'assets/miscspr.json');
            this.load.atlasJSONArray('hero', 'assets/hero.png', 'assets/hero.json');
            this.load.json('hero', 'assets/heroanims.json');
            this.load.atlasJSONArray('hud', 'assets/hud.png', 'assets/hud.json');

            // Enemies
            this.load.json('enemies', 'assets/enemyanims.json');

            // Loop to load enemies
            for (var i = 0; i < 38; i++) {
                var key: string = Enemies.EnemyKeys[i].toLowerCase();
                this.load.atlasJSONArray(key.toUpperCase(), 'assets/enemies/' + key + '.png', 'assets/enemies/' + key + '.json');
            }
        }

        create() {

            

            // Get this line out of here and set the value in a menu state or something (like when you click the play button)
            this.game.level = new Level(this.game, this.cache.getJSON('rooms'), 0x00);
            // A room change will trigger a redraw.
            this.game.level.onRoomChange.add(this.drawRoom, this);



            this.stage.smoothed = false;
            this.game.renderer.renderSession.roundPixels = false;

            

            
            var startPos = this.game.level.getStartPosition();
            this.game.hero = new Barbarian.Hero(this.game, startPos.tileX, startPos.tileY);
            this.game.hero.onDied.add(this.heroDied, this);


            //this.changeFrameRate = this.game.input.keyboard.addKeys({ 'fast': Phaser.KeyCode.PLUS, 'slow': Phaser.KeyCode.MINUS });
            //this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR, 'sword': Phaser.KeyCode.ONE, 'bow': Phaser.KeyCode.TWO, 'shield': Phaser.KeyCode.THREE, 'slow': Phaser.KeyCode.S, 'fast': Phaser.KeyCode.F });

            // Use one background and constantly overwrite so no GC.
            this.background = this.add.bitmapData(640, 320);
            this.drawRoom(Direction.Right);
            // draw hud
            this.hud = new Hud(this.game, 'hud', 0, 320); // this.make.sprite(0, 320, 'hud', 5);
            this.stage.addChild(this.hud);


            // Button Test
            //hud.inputEnabled = true;
            //hud.input.enableDrag();
            //hud.input.allowVerticalDrag = false;
            //hud.input.enableSnap(10, 10);

            this.game.inputManager = new Input.InputManager(this.game, this.hud);

            this.game.time.reset()
           
            
        }

        createEffect(x: number, y: number, name: string): void {

            var effect: Phaser.Sprite = this.add.sprite(x, y, 'misc');

            switch (name) {
                case 'bat':
                    effect.scale.setTo(-1, 1);
                    effect.animations.add(name, [33, 34], 4, true, true);
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ x: -40 }, 10000, Phaser.Easing.Linear.None, true, 500);
                    break;
                case 'torch1':
                    effect.animations.add(name, [9, 7, 8], 6, true, true);
                    break;
                case 'torch2':
                    effect.animations.add(name, [7, 8, 9], 6, true, true);
                    break;
                case 'fire':
                    effect.animations.add(name, [10, 11, 12], 6, true, true);
                    break;
                case 'skull_eyes':
                    effect.animations.add(name, [17, 18, 19, 18], 6, true, true);
                    break;
                case 'demon_eyes':
                    effect.animations.add(name, [13, 14, 15, 14], 6, true, true);
                    break;
                case 'blood_drip':
                    effect.frame = 16;
                    var tween: Phaser.Tween = this.game.add.tween(effect).to({ y: 320 }, 1200, Phaser.Easing.Exponential.In, true);
                    tween.repeat(-1, 1000);
                    break;
            }
            
            if (name != 'blood_drip') {
                effect.animations.play(name, FRAMERATE);
            }

        }

        heroDied() {
            // Extract this into a method and handle lives less than zero... add a continue or quit screen.
            this.game.lives--;

            // Restart room after a half-second delay.
            this.game.time.events.add(Phaser.Timer.SECOND/2, () => {
                this.game.time.reset();
                this.game.hero.reset(this.game.level.getStartPosition().tileX, this.game.level.getStartPosition().tileY);
                this.drawRoom(Direction.None);
            }, this);
        }

        drawRoom(direction: Direction) {
            // Clear world.
            this.world.removeAll();
            // Render background.
            this.background.clear();
            for (var obj of this.game.level.currentRoom.area) {

                if (obj.flags !== 5) {
                    var spr: Phaser.Sprite;

                    spr = this.make.sprite(obj.xOff, obj.yOff, 'area', obj.imageId);
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);

                    var xScale = obj.flags & 1 ? -1 : 1;
                    var yScale = obj.flags & 2 ? -1 : 1;

                    spr.scale.setTo(xScale, yScale);

                    this.background.draw(spr, spr.x, spr.y);
                }
                else {
                    // Black out area of background with height of a single tile and width of tile * obj.unknown.
                    this.background.rect(obj.xOff, obj.yOff, TILE_SIZE * obj.unknown, TILE_SIZE, '#000');
                }

            }
            // Order is important here to maintain correct z-ordering of entities.
            this.background.addToWorld(0, 0);
            // Add any room effects.
            for (var effect of this.game.level.currentRoom.effects) {

                this.createEffect(effect.x, effect.y, effect.name);
            }
            // Add enemies.
            this.enemies = [];
            for (var enemy of this.game.level.currentRoom.enemies) {
                var createdEnemy = Enemies.Enemy.createEnemy(this.game, enemy, direction);
                this.world.add(createdEnemy);
                this.enemies.push(createdEnemy);
            }
            // Add Hegor the Barbarian.
            this.world.add(this.game.hero);
            // Add static items.
            for (var item of this.game.level.getRoomItems()) {
                this.world.add(item);               
            }
        }
       
        handleMovement() {


            if (this.game.hero.x >= this.world.width + TILE_SIZE && this.game.hero.direction == Direction.Right) {
                this.game.level.nextRoom(Direction.Right);
                this.game.hero.x = 0;
                this.game.hero.tilePos.x = 0;
            } else if (this.game.hero.x <= -16 && this.game.hero.direction == Direction.Left) {
                this.game.level.nextRoom(Direction.Left);
                this.game.hero.x = 640;
                this.game.hero.tilePos.x = 39;
            } else if (this.game.hero.y <= 0 && this.game.hero.direction == Direction.Up) {
                this.game.level.nextRoom(Direction.Up);
                this.game.hero.y = 320;
                this.game.hero.tilePos.y = 19;
            } else if (this.game.hero.y >= this.world.height - (TILE_SIZE * 1.5)/* && this.game.hero.direction == Direction.Down*/) {
                this.game.level.nextRoom(Direction.Down);
                this.game.hero.y = TILE_SIZE;
                this.game.hero.tilePos.y = 1;
            }

        }

        
        update() {

            this.game.inputManager.update(this.game.time);

            this.handleMovement();

            if (this.game.hero.keys.fast.isDown) {
                FIXED_TIMESTEP -= 1;
                if (FIXED_TIMESTEP < 1)
                    FIXED_TIMESTEP = 1;
                FRAMERATE = 1000 / FIXED_TIMESTEP;
                console.log(FIXED_TIMESTEP.toString());
            }
            else if (this.game.hero.keys.slow.isDown) {
                FIXED_TIMESTEP += 1;
                if (FIXED_TIMESTEP > 999)
                    FIXED_TIMESTEP = 999;
                FRAMERATE = 1000 / FIXED_TIMESTEP;
                console.log(FIXED_TIMESTEP.toString());
            }

            // Basic sword killing test
            if (this.game.hero.isAttackingWithSword) {
                for (var enemy of this.enemies.filter((e) => { return e.isKillable })) {
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds())

                    if (enemyBounds.intersects(this.game.hero.getSwordBounds(), 0)) {
                        enemy.kill();
                    }
                }
            }
            // Basic arrow kill test.
            for (var arrow of <Arrow[]>this.world.children.filter((obj) => { return obj instanceof Arrow && obj.alive; })) {
                for (var enemy of this.enemies.filter((e) => { return e.isKillable })) {
                    // Inflate the enemyBounds so it doesn't go over their head without a hit.
                    var enemyBounds = new Phaser.Rectangle().copyFrom(enemy.getBounds()).inflate(TILE_SIZE / 2, TILE_SIZE * 2);
                    var arrowBounds = new Phaser.Rectangle().copyFrom(arrow.getBounds());

                    if (enemyBounds.containsRect(arrowBounds)) {
                        enemy.kill();
                        arrow.kill();
                    }
                }
            }
            // Basic small arrow kill test.
            for (var small of <Enemies.SmallArrow[]>this.world.children.filter((obj) => { return obj instanceof Enemies.SmallArrow && obj.alive; })) {
                
                    // Inflate the enemyBounds so it doesn't go over their head without a hit.
                    var heroBounds = new Phaser.Rectangle().copyFrom(this.game.hero.getBounds()).inflate(TILE_SIZE / 2, TILE_SIZE * 2);
                    var arrowBounds = new Phaser.Rectangle().copyFrom(small.getBounds());

                    if (heroBounds.containsRect(arrowBounds)) {
                        this.game.hero.fsm.transition('Die');
                        small.kill();
                    
                }
            }

            
            
        }

        render() {
            //this.game.debug.text(this.game.hero.frame.toString(), 20, 20);
            
            
            if (this.game.debugOn) {
                this.game.debug.text(this.game.level.currentRoom.id.toString(), 20, 20);
                this.game.debug.text(this.game.inputManager.iconsState.toString(), 50, 20);
                // this.game.debug.text(this.game.hero.tileMap.getTile(), 20, 40);
                // Draw Gridlines and TileMap Values
                for (var i = 0; i < 40; i++) {
                    for (var j = 0; j < 20; j++) {
                        this.game.debug.text(this.game.hero.tileMap.getTileValue(i, j), i * TILE_SIZE + 4, j * TILE_SIZE + 12);
                        this.game.debug.rectangle(new Phaser.Rectangle(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE), null, false);
                    }
                }

                var dumbAdjust = this.game.hero.direction == Direction.Right ? -TILE_SIZE : 0;
                this.game.debug.rectangle(new Phaser.Rectangle(this.game.hero.x + dumbAdjust, this.game.hero.y - TILE_SIZE, TILE_SIZE, TILE_SIZE), "green", true);

                this.game.debug.pixel(this.game.hero.x, this.game.hero.y, 'rgba(0,255,255,1)');


                var bounds: any = this.game.hero.getBodyBounds();
                this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));

                // Sword bounding box
                this.game.debug.rectangle(this.game.hero.getSwordBounds(), 'red', false);
                

                for (var enemy of this.enemies) {
                    if (enemy != null) {
                        bounds = enemy.getBounds();
                        this.game.debug.rectangle(new Phaser.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height));
                    }
                }
            }
        }

    }

    export class Hud extends Phaser.Group {

        game: Barbarian.Game;
        primaryHud: Phaser.Sprite;
        secondaryHud: Phaser.Sprite;
        primaryVisible: boolean = true;
        weaponIcons: Phaser.Sprite[] = [];
        heroIcons: Phaser.Sprite[] = [];
        iconSelector: Phaser.Sprite;

        private static DirectionIcons: Input.Icons = Input.Icons.Left | Input.Icons.Right | Input.Icons.Up | Input.Icons.Down | Input.Icons.Run;

        private iconSelected: Input.Icon = Input.Icon.None;

        private icons: { [key: string]: { icon: Input.Icon, hitBox: Phaser.Rectangle } } = {};

        constructor(game: Barbarian.Game, key: string, x: number, y: number) {
            super(game);
            this.x = x;
            this.y = y;

            this.primaryHud = this.create(0, 0, key, 'ICON-06.PNG');
            //this.primaryHud.input.enableDrag(true);
            this.secondaryHud = this.create(640, 0, key, 'ICON-07.PNG');
            // We have to crop this because data from Barb has 00:00:00 for the time...
            this.secondaryHud.crop(new Phaser.Rectangle(0, 0, 480, 80), true);
            //this.secondaryHud.input.enableDrag(true);
            // Create weapon icons on secondary Hud
            this.weaponIcons[Weapon.Sword] = this.create(640 + 3 * 80, 0, key, 'ICON-03.PNG');
            this.weaponIcons[Weapon.Bow] = this.create(640 + 4 * 80, 0, key, 'ICON-04.PNG');
            this.weaponIcons[Weapon.Shield] = this.create(640 + 5 * 80, 0, key, 'ICON-05.PNG');

            // Icon Selector
            this.iconSelector = this.create(0, 0, 'misc', '000.PNG');
            this.iconSelector.anchor.setTo(0.5, 0.5);

            for (var i = 0; i < 3; i++) {
                this.heroIcons[i] = this.create(640 + 544 + i * 32, 0, 'hud', 'ICON-01.PNG');
            }

            // TODO: Maybe have a spritesheet for these icons to make this code cleaner and avoid having to specify the hitbox.
            // Hitboxes for Icons
            this.icons[Input.Icon.Left.toString()] = { icon: Input.Icon.Left, hitBox: new Phaser.Rectangle(0, 0, 40, 80) };
            this.icons[Input.Icon.Up.toString()] = { icon: Input.Icon.Up, hitBox: new Phaser.Rectangle(40, 0, 80, 40) };
            this.icons[Input.Icon.Down.toString()] = { icon: Input.Icon.Down, hitBox: new Phaser.Rectangle(40, 40, 80, 40) };
            this.icons[Input.Icon.Right.toString()] = { icon: Input.Icon.Right, hitBox: new Phaser.Rectangle(120, 0, 40, 80) };
            this.icons[Input.Icon.Stop.toString()] = { icon: Input.Icon.Stop, hitBox: new Phaser.Rectangle(160, 0, 80, 80) };
            this.icons[Input.Icon.Jump.toString()] = { icon: Input.Icon.Jump, hitBox: new Phaser.Rectangle(240, 0, 80, 80) };
            this.icons[Input.Icon.Run.toString()] = { icon: Input.Icon.Run, hitBox: new Phaser.Rectangle(320, 0, 80, 80) };
            this.icons[Input.Icon.Attack.toString()] = { icon: Input.Icon.Attack, hitBox: new Phaser.Rectangle(400, 0, 80, 80) };
            this.icons[Input.Icon.Defend.toString()] = { icon: Input.Icon.Defend, hitBox: new Phaser.Rectangle(480, 0, 80, 80) };
            this.icons[Input.Icon.Flee.toString()] = { icon: Input.Icon.Flee, hitBox: new Phaser.Rectangle(560, 0, 80, 80) };
            // Secondary Icons
            this.icons[Input.Icon.Pickup.toString()] = { icon: Input.Icon.Pickup, hitBox: new Phaser.Rectangle(640, 0, 80, 80) };
            this.icons[Input.Icon.Use.toString()] = { icon: Input.Icon.Use, hitBox: new Phaser.Rectangle(720, 0, 80, 80) };
            this.icons[Input.Icon.Drop.toString()] = { icon: Input.Icon.Drop, hitBox: new Phaser.Rectangle(800, 0, 80, 80) };
            this.icons[Input.Icon.Sword.toString()] = { icon: Input.Icon.Sword, hitBox: new Phaser.Rectangle(880, 0, 80, 80) };
            this.icons[Input.Icon.Bow.toString()] = { icon: Input.Icon.Bow, hitBox: new Phaser.Rectangle(960, 0, 80, 80) };
            this.icons[Input.Icon.Shield.toString()] = { icon: Input.Icon.Shield, hitBox: new Phaser.Rectangle(1040, 0, 80, 80) };
        }

        update() {
            // Primitive object pooling for digit sprites.
            this.forEach((part) => { if (part.animations.currentFrame.name.startsWith("DIGIT")) { part.kill(); } }, this);
            this.iconSelected = this.game.inputManager.iconMenu.selectedIcon;
            this.primaryVisible = !this.game.inputManager.iconMenu.isMenuToggled;
            this.x = this.primaryVisible ? 0 : -640;
            this.render();
        }

        render() {
            this.renderTimer();
            this.renderArrowCount(this.game.hero.inventory.numArrows);
            this.renderWeaponIcons();
            this.renderLives();
            this.renderSelector();
        }

        renderSelector() {
            if (this.iconSelected == Input.Icon.None) {
                return;
            }
            // this.iconSelector.visible = this.iconSelected != Input.Icon.None;
            for (var key in this.icons) {
                if (this.iconSelected == this.icons[key].icon) {
                    var hitBox = this.icons[key].hitBox;
                    this.iconSelector.x = hitBox.centerX;
                    this.iconSelector.y = hitBox.centerY;
                    break;
                }
            }
        }

        renderLives() {
            this.heroIcons.forEach((icon) => {
                icon.visible = false;
            });

            for (var i = 0; i < this.game.lives && i < 3; i++) {
                this.heroIcons[i].visible = true;
            }
        }

        renderWeaponIcons() {
            for (var weapon = Weapon.Sword; weapon <= Weapon.Bow; weapon++) {
                if (this.game.hero.inventory.hasWeapon(weapon)) {
                    this.weaponIcons[weapon].visible = true;
                } else {
                    this.weaponIcons[weapon].visible = false;
                }
            }
        }

        renderTimer() {
            var date = new Date(null);
            date.setSeconds(this.game.time.totalElapsedSeconds());
            var result = date.toISOString().substr(11, 8);
            for (var i = 0, iMax = result.length; i < iMax; i++) {
                this.renderDigit(result.charAt(i), 640 + 496 + i * 16, 50);
            }

        }

        renderDigit(digit: string, x: number, y: number) {
            var key = digit === ":" ? 'DIGIT-10.PNG' : 'DIGIT-0' + digit + '.PNG'
            digit = this.getFirstDead(true, x, y, 'hud', key);
        }

        renderArrowCount(numArrows: number) {
            var count = "0" + numArrows;
            count = count.substr(count.length - 2);
            this.getFirstDead(true, 640 + 512, 0, 'hud', 'ICON-00.PNG');
            for (var i = 0, iMax = count.length; i < iMax; i++) {
                this.renderDigit(count.charAt(i), 640 + 480 + i * 16, 0);
            }



        }

    }
}